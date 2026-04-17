import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { referrals, referralCredits } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

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
});
