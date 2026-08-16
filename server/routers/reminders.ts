import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { pushSubscriptions } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const reminderInput = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1).max(255),
  auth: z.string().min(1).max(255),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  timezone: z.string().min(1).max(64),
});

export const remindersRouter = router({
  publicKey: protectedProcedure.query(() => ({ publicKey: process.env.VAPID_PUBLIC_KEY ?? "" })),
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const [settings] = await db.select({ reminderTime: pushSubscriptions.reminderTime, timezone: pushSubscriptions.timezone, enabled: pushSubscriptions.enabled })
      .from(pushSubscriptions).where(eq(pushSubscriptions.userId, ctx.user.id)).orderBy(desc(pushSubscriptions.updatedAt)).limit(1);
    return settings ?? null;
  }),
  saveSubscription: protectedProcedure.input(reminderInput).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const [existing] = await db.select({ id: pushSubscriptions.id }).from(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, ctx.user.id), eq(pushSubscriptions.endpoint, input.endpoint))).limit(1);
    if (existing) await db.update(pushSubscriptions).set({ ...input, enabled: true }).where(eq(pushSubscriptions.id, existing.id));
    else await db.insert(pushSubscriptions).values({ userId: ctx.user.id, ...input, enabled: true });
    return { ok: true };
  }),
  disable: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    await db.update(pushSubscriptions).set({ enabled: false }).where(eq(pushSubscriptions.userId, ctx.user.id));
    return { ok: true };
  }),
});
