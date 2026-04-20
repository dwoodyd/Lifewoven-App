import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { referrals, referralCredits, referralCodes, betaAccess, events, users } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "../_core/notification";
import crypto from "crypto";

const REFERRAL_TRIAL_DAYS = 30;

function genTrialCode(userId: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 8; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  return `REF-${rand.slice(0, 4)}-${rand.slice(4)}`;
}

function generateCode(): string {
  return crypto.randomBytes(6).toString("hex").toUpperCase(); // 12 chars
}

export const referralRouter = router({
  // Get or create the user's referral code
  getMyCode: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    const existing = await db.select().from(referrals)
      .where(eq(referrals.referrerId, ctx.user.id))
      .limit(1);
    if (existing[0]) return { code: existing[0].code };
    const code = generateCode();
    await db.insert(referrals).values({ referrerId: ctx.user.id, code });
    return { code };
  }),

  // Get credit balance
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { balanceCents: 0 };
    const rows = await db.select().from(referralCredits)
      .where(eq(referralCredits.userId, ctx.user.id)).limit(1);
    return { balanceCents: rows[0]?.balanceCents ?? 0 };
  }),

  // Validate a referral code (called on signup/first purchase)
  applyCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const ref = await db.select().from(referrals)
        .where(eq(referrals.code, input.code.toUpperCase())).limit(1);
      if (!ref[0]) return { success: false, message: "Invalid referral code." };
      if (ref[0].usedAt) return { success: false, message: "Code already used." };
      if (ref[0].referrerId === ctx.user.id) return { success: false, message: "Cannot use your own code." };
      // Mark used
      await db.update(referrals)
        .set({ refereeId: ctx.user.id, usedAt: new Date(), creditCents: 1000 })
        .where(eq(referrals.code, input.code.toUpperCase()));
      // Credit referrer $10
      const existing = await db.select().from(referralCredits)
        .where(eq(referralCredits.userId, ref[0].referrerId)).limit(1);
      if (existing[0]) {
        await db.update(referralCredits)
          .set({ balanceCents: existing[0].balanceCents + 1000 })
          .where(eq(referralCredits.userId, ref[0].referrerId));
      } else {
        await db.insert(referralCredits).values({ userId: ref[0].referrerId, balanceCents: 1000 });
      }
      return { success: true, message: "Referral applied! Your friend earned $10 store credit." };
    }),

  // Get referral history
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(referrals)
      .where(eq(referrals.referrerId, ctx.user.id));
  }),

  // ── Beta-trial referral (30 days) ─────────────────────────────────────────

  // Get or create a 30-day trial referral code (only for converted beta users)
  myTrialCode: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const converted = await db.select({ cnt: sql<number>`COUNT(*)` })
      .from(events)
      .where(eq(events.userId, ctx.user.id));
    const hasConverted = Number(converted[0]?.cnt ?? 0) > 0;
    if (!hasConverted) return { code: null, eligible: false, redeemedCount: 0 };

    let rows = await db.select().from(referralCodes)
      .where(eq(referralCodes.ownerId, ctx.user.id)).limit(1);

    if (rows.length === 0) {
      let code = genTrialCode(ctx.user.id);
      for (let i = 0; i < 5; i++) {
        const clash = await db.select({ id: referralCodes.id }).from(referralCodes)
          .where(eq(referralCodes.code, code)).limit(1);
        if (clash.length === 0) break;
        code = genTrialCode(ctx.user.id + i + 1);
      }
      await db.insert(referralCodes).values({ code, ownerId: ctx.user.id, createdAt: Date.now() });
      rows = await db.select().from(referralCodes)
        .where(eq(referralCodes.ownerId, ctx.user.id)).limit(1);
    }

    const redeemed = await db.select({ cnt: sql<number>`COUNT(*)` })
      .from(referralCodes)
      .where(sql`${referralCodes.ownerId} = ${ctx.user.id} AND ${referralCodes.redeemedBy} IS NOT NULL`);

    return { code: rows[0].code, eligible: true, redeemedCount: Number(redeemed[0]?.cnt ?? 0) };
  }),

  // Redeem a 30-day trial referral code
  redeemTrialCode: protectedProcedure
    .input(z.object({ code: z.string().trim().toUpperCase() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const existing = await db.select().from(betaAccess)
        .where(eq(betaAccess.userId, ctx.user.id)).limit(1);
      if (existing.length > 0)
        throw new TRPCError({ code: "BAD_REQUEST", message: "You already have an active trial." });

      const codeRow = await db.select().from(referralCodes)
        .where(eq(referralCodes.code, input.code)).limit(1);
      if (codeRow.length === 0)
        throw new TRPCError({ code: "NOT_FOUND", message: "Code not found." });
      const ref = codeRow[0];
      if (ref.redeemedBy !== null)
        throw new TRPCError({ code: "BAD_REQUEST", message: "This code has already been used." });
      if (ref.ownerId === ctx.user.id)
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot redeem your own referral code." });

      const now = Date.now();
      const expiresAt = new Date(now + REFERRAL_TRIAL_DAYS * 24 * 60 * 60 * 1000);

      await db.update(referralCodes)
        .set({ redeemedBy: ctx.user.id, redeemedAt: now })
        .where(eq(referralCodes.id, ref.id));

      await db.insert(betaAccess).values({ userId: ctx.user.id, betaCodeId: 0, expiresAt });

      const [ownerRow] = await db.select({ name: users.name, email: users.email })
        .from(users).where(eq(users.id, ref.ownerId)).limit(1);
      notifyOwner({
        title: `🎁 Referral code redeemed by ${ctx.user.name ?? ctx.user.email ?? "a user"}`,
        content: `Code ${ref.code} (owned by ${ownerRow?.name ?? ownerRow?.email ?? "unknown"}) was redeemed. New user gets ${REFERRAL_TRIAL_DAYS} days of access until ${expiresAt.toLocaleDateString()}.`,
      }).catch(() => {});

      return { success: true, expiresAt: expiresAt.getTime(), daysGranted: REFERRAL_TRIAL_DAYS };
    }),
});
