import { z } from "zod";
import { sql } from "drizzle-orm";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { getDb } from "../db";
import { events } from "../../drizzle/schema";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
  trackEvent: publicProcedure
    .input(z.object({
      event: z.string(),
      properties: z.record(z.string(), z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { ok: false };
      await db.insert(events).values({
        userId: ctx.user?.id ?? null,
        event: input.event,
        properties: input.properties ? JSON.stringify(input.properties) : null,
        createdAt: Math.floor(Date.now() / 1000),
      });
      return { ok: true };
    }),
  getOnboardingFunnel: adminProcedure.query(async () => {
    const db = await getDb();
    const slideOrder = ["thesis","state","framework","oracle","btw","reset","close"];
    if (!db) return [...slideOrder.map(id => ({ slide: id, count: 0 })), { slide: "complete", count: 0 }];
    const [slideRaw, completeRaw] = await Promise.all([
      db.execute(
        sql`SELECT JSON_UNQUOTE(JSON_EXTRACT(properties,'$.slide')) as slide, COUNT(*) as cnt
            FROM events WHERE event='onboarding_slide_advance'
            GROUP BY JSON_UNQUOTE(JSON_EXTRACT(properties,'$.slide'))`
      ) as any,
      db.execute(sql`SELECT COUNT(*) as cnt FROM events WHERE event='onboarding_complete'`) as any,
    ]);
    const counts: Record<string,number> = {};
    (slideRaw[0] as any[]).forEach((r: any) => { counts[r.slide] = Number(r.cnt); });
    const completeCount = Number((completeRaw[0] as any[])[0]?.cnt ?? 0);
    return [...slideOrder.map(id => ({ slide: id, count: counts[id] ?? 0 })), { slide: "complete", count: completeCount }];
  }),
});
