/**
 * Founding-member invitation router.
 *
 * The legacy application queue was retired for self-service sign-up. This router
 * intentionally preserves only invitation redemption and first-use onboarding
 * for invite codes already issued to founding members.
 */
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { inviteCodes, users } from "../../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "../_core/notification";
import { sendRedemptionConfirmationEmail } from "../email";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db;
}

export const foundingRouter = router({
  /** Public: validate an already-issued invitation before OAuth. */
  validateCode: publicProcedure
    .input(z.object({ code: z.string().trim().toUpperCase() }))
    .query(async ({ input }) => {
      const db = await requireDb();
      const [row] = await db.select().from(inviteCodes)
        .where(eq(inviteCodes.code, input.code)).limit(1);
      if (!row) return { valid: false, reason: "not_found" as const };
      if (row.redeemedBy) return { valid: false, reason: "already_redeemed" as const };
      if (row.expiresAt < new Date()) return { valid: false, reason: "expired" as const };
      return { valid: true, tier: row.tier, email: row.email };
    }),

  /** Protected: redeem an already-issued invitation and grant founding access. */
  redeemCode: protectedProcedure
    .input(z.object({ code: z.string().trim().toUpperCase() }))
    .mutation(async ({ input, ctx }) => {
      const db = await requireDb();
      const [row] = await db.select().from(inviteCodes)
        .where(and(eq(inviteCodes.code, input.code), gt(inviteCodes.expiresAt, new Date())))
        .limit(1);

      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or expired invite code." });
      if (row.redeemedBy) throw new TRPCError({ code: "BAD_REQUEST", message: "This invite code has already been used." });

      await db.update(inviteCodes)
        .set({ redeemedBy: ctx.user.id, redeemedAt: new Date() })
        .where(eq(inviteCodes.id, row.id));

      const betaStart = new Date();
      const betaEnd = new Date(betaStart.getTime() + 90 * 24 * 60 * 60 * 1000);
      await db.update(users)
        .set({
          foundingMember: true,
          foundingTier: row.tier,
          foundingRateLocked: true,
          needsIntro: true,
          inviteCode: input.code,
          membershipTier: row.tier,
          billingStatus: "trialing_no_card",
          betaStartDate: betaStart,
          betaEndDate: betaEnd,
          storeAccess: "library_during_beta",
        })
        .where(eq(users.id, ctx.user.id));

      notifyOwner({
        title: `Founding member joined: ${ctx.user.name || ctx.user.email}`,
        content: `Tier: ${row.tier} · Code: ${input.code} · Beta ends: ${betaEnd.toISOString().slice(0, 10)}`,
      }).catch(() => {});

      if (ctx.user.email) {
        sendRedemptionConfirmationEmail({
          to: ctx.user.email,
          name: ctx.user.name || ctx.user.email,
          tier: row.tier,
        }).catch(() => {});
      }

      return { ok: true, tier: row.tier };
    }),

  /** Protected: dismiss the one-time founding welcome card. */
  completeIntro: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await requireDb();
    await db.update(users).set({ needsIntro: false }).where(eq(users.id, ctx.user.id));
    return { ok: true };
  }),

  /** Protected: allow a founding member to replay the welcome card. */
  replayIntro: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await requireDb();
    await db.update(users).set({ needsIntro: true }).where(eq(users.id, ctx.user.id));
    return { ok: true };
  }),
});
