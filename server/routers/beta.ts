import { TRPCError } from "@trpc/server";
import { eq, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../db";
import { betaCodes, betaAccess, users } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";
import { sendBetaInviteEmail } from "../email";
import crypto from "crypto";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return db;
}

function generateCode(): string {
  const part = () => crypto.randomBytes(2).toString("hex").toUpperCase();
  return `LW-${part()}-${part()}`;
}

/** Returns the active beta access record for a user, or null */
export async function getBetaAccess(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(betaAccess).where(eq(betaAccess.userId, userId)).limit(1);
  if (!rows.length) return null;
  const row = rows[0];
  return { ...row, expired: row.expiresAt < new Date() };
}

const DEFAULT_FREE_BETA_DAYS = 30;

async function claimStandardFreeBeta(userId: number) {
  const db = await getDb();
  if (!db) return { granted: false, reason: "database_unavailable" as const };
  const userRows = await db.select({ role: users.role, membershipTier: users.membershipTier })
    .from(users).where(eq(users.id, userId)).limit(1);
  if (!userRows.length || userRows[0].role === "admin" || userRows[0].membershipTier !== "explorer") {
    return { granted: false, reason: "paid_or_admin" as const };
  }
  const u = userRows[0];
  const access = await getBetaAccess(userId);
  if (access && !access.expired) {
    await syncActiveBetaToUser(userId, access.activatedAt, access.expiresAt);
    return { granted: false, reason: "already_active" as const, expiresAt: access.expiresAt };
  }
  if (access?.expired) return { granted: false, reason: "expired" as const, expiresAt: access.expiresAt };

  const expiresAt = new Date(Date.now() + DEFAULT_FREE_BETA_DAYS * 24 * 60 * 60 * 1000);
  try {
    await db.insert(betaAccess).values({ userId, betaCodeId: null, source: "free_beta", expiresAt });
  } catch {
    const concurrent = await getBetaAccess(userId);
    if (concurrent && !concurrent.expired) {
      await syncActiveBetaToUser(userId, concurrent.activatedAt, concurrent.expiresAt);
      return { granted: false, reason: "already_active" as const, expiresAt: concurrent.expiresAt };
    }
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to establish beta access." });
  }
  await syncActiveBetaToUser(userId, new Date(), expiresAt);
  return { granted: true, reason: "new_free_beta" as const, expiresAt };
}

/** Returns true if user has active beta OR is admin OR has paid membership.
 * A brand-new Explorer receives their one-time beta entitlement on this first
 * protected access check, so a direct deep link cannot race the client bootstrap.
 */
export async function hasBetaOrPaidAccess(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const userRows = await db.select({ role: users.role, membershipTier: users.membershipTier })
    .from(users).where(eq(users.id, userId)).limit(1);
  if (!userRows.length) return false;
  const user = userRows[0];
  if (user.role === "admin" || user.membershipTier !== "explorer") return true;
  const claim = await claimStandardFreeBeta(userId);
  return claim.granted || claim.reason === "already_active";
}

async function syncActiveBetaToUser(userId: number, activatedAt: Date, expiresAt: Date) {
  const db = await requireDb();
  await db.update(users)
    .set({
      storeAccess: "library_during_beta",
      betaStartDate: activatedAt,
      betaEndDate: expiresAt,
      billingStatus: "trialing_no_card",
    })
    .where(eq(users.id, userId));
}

export const betaRouter = router({
  /**
   * Grants the standard free beta window on an authenticated user's first app load.
   * The unique beta_access.userId constraint makes simultaneous browser loads safe.
   */
  claimFreeAccess: protectedProcedure.mutation(async ({ ctx }) => {
    return claimStandardFreeBeta(ctx.user.id);
  }),

  /** Admin: generate beta codes */
  generateCodes: protectedProcedure
    .input(z.object({
      count: z.number().int().min(1).max(50).default(1),
      label: z.string().max(128).optional(),
      durationDays: z.number().int().min(1).max(365).default(45),
      maxUses: z.number().int().min(1).max(100).default(1),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await requireDb();
      const codes: string[] = [];
      for (let i = 0; i < input.count; i++) {
        const code = generateCode();
        await db.insert(betaCodes).values({
          code,
          label: input.label ?? null,
          maxUses: input.maxUses,
          durationDays: input.durationDays,
          createdBy: ctx.user.id,
        });
        codes.push(code);
      }
      return { codes };
    }),

  /** Admin: list all beta codes with redeemed-by info */
  listCodes: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await requireDb();
    const rows = await db
      .select({
        id: betaCodes.id,
        code: betaCodes.code,
        label: betaCodes.label,
        maxUses: betaCodes.maxUses,
        usedCount: betaCodes.usedCount,
        durationDays: betaCodes.durationDays,
        createdBy: betaCodes.createdBy,
        createdAt: betaCodes.createdAt,
        expiresAt: betaAccess.expiresAt,
        redeemedBy: betaAccess.userId,
        redeemedByName: users.name,
        redeemedByEmail: users.email,
      })
      .from(betaCodes)
      .leftJoin(betaAccess, eq(betaAccess.betaCodeId, betaCodes.id))
      .leftJoin(users, eq(users.id, betaAccess.userId))
      .orderBy(desc(betaCodes.createdAt));

    return rows.map((r) => ({
      ...r,
      status: r.redeemedBy
        ? (r.expiresAt && r.expiresAt < new Date() ? "expired" : "redeemed")
        : "available",
    }));
  }),

  /** Admin: delete a beta code */
  deleteCode: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await requireDb();
      await db.delete(betaCodes).where(eq(betaCodes.id, input.id));
      return { ok: true };
    }),

  /** User: redeem a beta code */
  redeemCode: protectedProcedure
    .input(z.object({ code: z.string().trim().toUpperCase() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();

      // Already has active access?
      const existing = await getBetaAccess(ctx.user.id);
      if (existing && !existing.expired) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You already have active beta access." });
      }

      const codeRows = await db.select().from(betaCodes)
        .where(eq(betaCodes.code, input.code)).limit(1);
      if (!codeRows.length) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid beta code." });
      const betaCode = codeRows[0];

      if (betaCode.usedCount >= betaCode.maxUses) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This code has already been fully used." });
      }
      if (betaCode.expiresAt && betaCode.expiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This code has expired." });
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + betaCode.durationDays);

      if (existing) {
        await db.update(betaAccess)
          .set({ betaCodeId: betaCode.id, source: "beta_code", activatedAt: new Date(), expiresAt, notifiedAt: null })
          .where(eq(betaAccess.id, existing.id));
      } else {
        await db.insert(betaAccess).values({ userId: ctx.user.id, betaCodeId: betaCode.id, source: "beta_code", expiresAt });
      }
      await syncActiveBetaToUser(ctx.user.id, new Date(), expiresAt);
      await db.update(betaCodes)
        .set({ usedCount: sql`${betaCodes.usedCount} + 1` })
        .where(eq(betaCodes.id, betaCode.id));

      // Notify owner
      const u = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const who = u[0]?.name || u[0]?.email || `User #${ctx.user.id}`;
      notifyOwner({ title: "Beta code redeemed", content: `${who} activated code ${input.code} — expires ${expiresAt.toDateString()}` }).catch(() => {});

      return { ok: true, expiresAt, durationDays: betaCode.durationDays };
    }),

  /** User: get own beta access status */
  myAccess: protectedProcedure.query(async ({ ctx }) => {
    const access = await getBetaAccess(ctx.user.id);
    const hasAccess = await hasBetaOrPaidAccess(ctx.user.id);
    return { access, hasAccess };
  }),

  /**
   * Admin: send beta invite emails via Resend.
   * Each recipient gets their assigned code(s) in a branded HTML email.
   */
  sendInvites: protectedProcedure
    .input(z.object({
      /** Comma-separated or array of email addresses */
      emails: z.array(z.string().email()).min(1).max(50),
      /** Codes to distribute — assigned round-robin across recipients */
      codes: z.array(z.string()).min(1),
      /** Frontend origin for the redeem link */
      origin: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });

      const redeemUrl = `${input.origin}/beta`;
      const perPerson = Math.ceil(input.codes.length / input.emails.length);
      const results: { email: string; ok: boolean; error?: string }[] = [];

      for (let i = 0; i < input.emails.length; i++) {
        const email = input.emails[i];
        const assigned = input.codes.slice(i * perPerson, (i + 1) * perPerson);
        if (!assigned.length) continue;
        try {
          await sendBetaInviteEmail({ to: email, codes: assigned, redeemUrl });
          results.push({ email, ok: true });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          results.push({ email, ok: false, error: msg });
        }
      }

      const sent = results.filter(r => r.ok).length;
      const failed = results.filter(r => !r.ok);

      // Notify owner
      notifyOwner({
        title: `Beta invites sent: ${sent}/${input.emails.length}`,
        content: failed.length
          ? `Failed: ${failed.map(f => `${f.email} (${f.error})`).join(", ")}`
          : `All ${sent} invite${sent !== 1 ? "s" : ""} delivered successfully.`,
      }).catch(() => {});

      return { sent, failed, results };
    }),
});
