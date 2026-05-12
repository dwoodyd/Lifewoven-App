/**
 * Founding Member Applications router.
 * Handles the full apply → approve → invite → redeem flow.
 */
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { applications, inviteCodes, users } from "../../drizzle/schema";
import { eq, desc, and, gt } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "../_core/notification";
import {
  sendApplicationQueueEmail,
  sendApplicationApprovalEmail,
  sendRedemptionConfirmationEmail,
} from "../email";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db;
}

/** Generate a random invite code (10 chars, uppercase alphanumeric) */
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const applicationsRouter = router({
  /** Public: submit a founding member application */
  submit: publicProcedure
    .input(z.object({
      name:   z.string().min(2).max(255),
      email:  z.string().email(),
      answer: z.string().min(50).max(2000),
      origin: z.string().url().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await requireDb();
      const ip = (ctx.req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim()
        ?? ctx.req.socket?.remoteAddress
        ?? null;
      const ua = ctx.req.headers["user-agent"] ?? null;

      // Prevent duplicate pending applications from the same email
      const existing = await db.select({ id: applications.id, status: applications.status })
        .from(applications)
        .where(eq(applications.email, input.email))
        .limit(1);
      if (existing.length && existing[0].status !== "declined") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An application from this email is already in the queue.",
        });
      }

      await db.insert(applications).values({
        name:      input.name,
        email:     input.email,
        answer:    input.answer,
        ipAddress: ip,
        userAgent: ua,
        status:    "new",
        tier:      "seeker", // default; admin can override at approve time
      });

      // Fire in-queue email (non-blocking)
      sendApplicationQueueEmail({ to: input.email, name: input.name }).catch(() => {});

      // Admin notification
      notifyOwner({
        title: `New founding member application: ${input.name}`,
        content: `Email: ${input.email}\n\nAnswer: ${input.answer.slice(0, 300)}${input.answer.length > 300 ? "…" : ""}`,
      }).catch(() => {});

      return { ok: true };
    }),

  /** Admin: list all applications */
  list: adminProcedure.query(async () => {
    const db = await requireDb();
    return db.select().from(applications).orderBy(desc(applications.createdAt)).limit(500);
  }),

  /** Admin: approve an application — generates invite code and fires approval email */
  approve: adminProcedure
    .input(z.object({
      applicationId: z.number(),
      tier: z.enum(["explorer", "seeker", "oracle"]).default("seeker"),
      origin: z.string().url(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await requireDb();

      const [app] = await db.select().from(applications)
        .where(eq(applications.id, input.applicationId)).limit(1);
      if (!app) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found." });
      if (app.status === "approved") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Application already approved." });
      }

      // Generate a unique code
      let code = generateCode();
      let attempts = 0;
      while (attempts < 5) {
        const existing = await db.select({ id: inviteCodes.id })
          .from(inviteCodes).where(eq(inviteCodes.code, code)).limit(1);
        if (!existing.length) break;
        code = generateCode();
        attempts++;
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const [insertResult] = await db.insert(inviteCodes).values({
        code,
        email:         app.email,
        tier:          input.tier,
        applicationId: app.id,
        expiresAt,
      });
      const inviteCodeId = (insertResult as { insertId: number }).insertId;

      await db.update(applications)
        .set({
          status:       "approved",
          tier:         input.tier,
          reviewedAt:   new Date(),
          reviewedBy:   ctx.user.id,
          inviteCodeId,
        })
        .where(eq(applications.id, app.id));

      const inviteUrl = `${input.origin}/invite/${code}`;

      // Fire approval email (non-blocking)
      sendApplicationApprovalEmail({
        to:        app.email,
        name:      app.name,
        code,
        inviteUrl,
        tier:      input.tier,
      }).catch(() => {});

      return { ok: true, code, inviteUrl };
    }),

  /** Admin: decline an application (silent — no email for cohort 1) */
  decline: adminProcedure
    .input(z.object({ applicationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await requireDb();
      await db.update(applications)
        .set({ status: "declined", reviewedAt: new Date(), reviewedBy: ctx.user.id })
        .where(eq(applications.id, input.applicationId));
      return { ok: true };
    }),

  /** Admin: re-send invite (generates a fresh code for an already-approved application) */
  resendInvite: adminProcedure
    .input(z.object({ applicationId: z.number(), origin: z.string().url() }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      const [app] = await db.select().from(applications)
        .where(eq(applications.id, input.applicationId)).limit(1);
      if (!app) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found." });

      let code = generateCode();
      let attempts = 0;
      while (attempts < 5) {
        const existing = await db.select({ id: inviteCodes.id })
          .from(inviteCodes).where(eq(inviteCodes.code, code)).limit(1);
        if (!existing.length) break;
        code = generateCode();
        attempts++;
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const [insertResult] = await db.insert(inviteCodes).values({
        code,
        email:         app.email,
        tier:          app.tier,
        applicationId: app.id,
        expiresAt,
      });
      const inviteCodeId = (insertResult as { insertId: number }).insertId;
      await db.update(applications).set({ inviteCodeId }).where(eq(applications.id, app.id));

      const inviteUrl = `${input.origin}/invite/${code}`;
      sendApplicationApprovalEmail({
        to:        app.email,
        name:      app.name,
        code,
        inviteUrl,
        tier:      app.tier,
      }).catch(() => {});

      return { ok: true, code, inviteUrl };
    }),

  /** Public: validate an invite code (used by /invite/<code> page before OAuth) */
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

  /** Protected: redeem an invite code — sets founding member flags on the user */
  redeemCode: protectedProcedure
    .input(z.object({ code: z.string().trim().toUpperCase() }))
    .mutation(async ({ input, ctx }) => {
      const db = await requireDb();

      const [row] = await db.select().from(inviteCodes)
        .where(
          and(
            eq(inviteCodes.code, input.code),
            gt(inviteCodes.expiresAt, new Date()),
          )
        ).limit(1);

      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or expired invite code." });
      if (row.redeemedBy) throw new TRPCError({ code: "BAD_REQUEST", message: "This invite code has already been used." });

      // Mark code as redeemed
      await db.update(inviteCodes)
        .set({ redeemedBy: ctx.user.id, redeemedAt: new Date() })
        .where(eq(inviteCodes.id, row.id));

      // Set founding member flags on the user
      const storeAccess = row.tier === "oracle" ? "library" : row.tier === "seeker" ? "discount" : "standalone";
      await db.update(users)
        .set({
          foundingMember:     true,
          foundingTier:       row.tier,
          foundingRateLocked: true,
          needsIntro:         true,
          inviteCode:         input.code,
          membershipTier:     row.tier,
        })
        .where(eq(users.id, ctx.user.id));

      notifyOwner({
        title: `Founding member joined: ${ctx.user.name || ctx.user.email}`,
        content: `Tier: ${row.tier} · Code: ${input.code} · Store access: ${storeAccess}`,
      }).catch(() => {});

      // Send redemption confirmation email (non-blocking)
      if (ctx.user.email) {
        sendRedemptionConfirmationEmail({
          to:   ctx.user.email,
          name: ctx.user.name || ctx.user.email,
          tier: row.tier,
        }).catch(() => {});
      }

      return { ok: true, tier: row.tier };
    }),

  /** Protected: mark intro as complete */
  completeIntro: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await requireDb();
    await db.update(users).set({ needsIntro: false }).where(eq(users.id, ctx.user.id));
    return { ok: true };
  }),

  /** Protected: replay intro (re-sets needsIntro = true) */
  replayIntro: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await requireDb();
    await db.update(users).set({ needsIntro: true }).where(eq(users.id, ctx.user.id));
    return { ok: true };
  }),
});
