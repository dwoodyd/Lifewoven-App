import { z } from "zod";
import { sql } from "drizzle-orm";
import { notifyOwner } from "./notification";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./trpc";
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
  // H6: trackEvent requires authentication and validates the event against an allowlist
  trackEvent: protectedProcedure
    .input(z.object({
      event: z.enum([
        "onboarding_slide_advance",
        "onboarding_complete",
        "beta_converted",
        "pathway_started",
        "pathway_step_completed",
        "habit_logged",
        "journal_created",
        "check_in_created",
        "oracle_chat_started",
        "oracle_upgrade_click",
        "product_viewed",
        "product_purchased",
      ]),
      properties: z.record(z.string(), z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { ok: false };
      await db.insert(events).values({
        userId: ctx.user.id,
        event: input.event,
        properties: input.properties ? JSON.stringify(input.properties) : null,
        createdAt: Math.floor(Date.now() / 1000),
      });
      return { ok: true };
    }),
  getOnboardingFunnel: adminProcedure.query(async () => {
    const db = await getDb();
    const slideOrder = ["thesis","state","framework","oracle","oracle_teaser","btw","reset","close"];
    if (!db) return [...slideOrder.map(id => ({ slide: id, count: 0 })), { slide: "complete", count: 0 }, { slide: "beta_converted", count: 0 }];
    const [slideRaw, completeRaw, convertedRaw] = await Promise.all([
      db.execute(
        sql`SELECT JSON_UNQUOTE(JSON_EXTRACT(properties,'$.slide')) as slide, COUNT(*) as cnt
            FROM events WHERE event='onboarding_slide_advance'
            GROUP BY JSON_UNQUOTE(JSON_EXTRACT(properties,'$.slide'))`
      ) as any,
      db.execute(sql`SELECT COUNT(*) as cnt FROM events WHERE event='onboarding_complete'`) as any,
      db.execute(sql`SELECT COUNT(*) as cnt FROM events WHERE event='beta_converted'`) as any,
    ]);
    const counts: Record<string,number> = {};
    (slideRaw[0] as any[]).forEach((r: any) => { counts[r.slide] = Number(r.cnt); });
    const completeCount = Number((completeRaw[0] as any[])[0]?.cnt ?? 0);
    const convertedCount = Number((convertedRaw[0] as any[])[0]?.cnt ?? 0);
    return [
      ...slideOrder.map(id => ({ slide: id, count: counts[id] ?? 0 })),
      { slide: "complete", count: completeCount },
      { slide: "beta_converted", count: convertedCount },
    ];
  }),

  // Called by a scheduled job or admin trigger — notifies owner of beta users expiring in 7 days
  checkBetaExpiry: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) return { notified: 0 };
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const soon = now + sevenDaysMs;
    // Find beta users expiring within 7 days who haven't converted yet
    const rows = await db.execute(
      sql`SELECT ba.user_id, ba.expires_at, u.name, u.email
          FROM beta_access ba
          JOIN users u ON u.id = ba.user_id
          WHERE ba.expires_at > ${now} AND ba.expires_at <= ${soon}
            AND NOT EXISTS (
              SELECT 1 FROM events e
              WHERE e.user_id = ba.user_id AND e.event = 'beta_converted'
            )`
    ) as any;
    const expiring = (rows[0] as any[]);
    if (expiring.length === 0) return { notified: 0 };
    const names = expiring.map((r: any) => `${r.name ?? "Unknown"} (${r.email ?? ""}) — expires ${new Date(Number(r.expires_at)).toLocaleDateString()}`).join("\n");
    await notifyOwner({
      title: `⏰ ${expiring.length} Beta Trial${expiring.length > 1 ? "s" : ""} Expiring in 7 Days`,
      content: `The following beta users haven't converted yet and expire soon:\n\n${names}\n\nConsider reaching out personally.`,
    }).catch(() => {});
    return { notified: expiring.length };
  }),

  getConvertedUsers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.execute(
      sql`SELECT e.user_id, u.name, u.email,
             JSON_UNQUOTE(JSON_EXTRACT(e.properties,'$.plan')) as plan,
             e.created_at as convertedAt
          FROM events e
          JOIN users u ON u.id = e.user_id
          WHERE e.event = 'beta_converted'
          ORDER BY e.created_at DESC
          LIMIT 50`
    ) as any;
    return (rows[0] as any[]).map((r: any) => ({
      userId: Number(r.user_id),
      name: r.name as string,
      email: r.email as string,
      plan: r.plan as string,
      convertedAt: Number(r.convertedAt),
    }));
  }),

  getBetaConversionStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { totalBeta: 0, converted: 0, conversionRate: 0, byPlan: [] };
    const [totalRaw, convertedRaw, byPlanRaw] = await Promise.all([
      db.execute(sql`SELECT COUNT(DISTINCT user_id) as cnt FROM beta_access`) as any,
      db.execute(sql`SELECT COUNT(*) as cnt FROM events WHERE event='beta_converted'`) as any,
      db.execute(
        sql`SELECT JSON_UNQUOTE(JSON_EXTRACT(properties,'$.plan')) as plan, COUNT(*) as cnt
            FROM events WHERE event='beta_converted'
            GROUP BY JSON_UNQUOTE(JSON_EXTRACT(properties,'$.plan'))`
      ) as any,
    ]);
    const totalBeta = Number((totalRaw[0] as any[])[0]?.cnt ?? 0);
    const converted = Number((convertedRaw[0] as any[])[0]?.cnt ?? 0);
    const conversionRate = totalBeta > 0 ? Math.round((converted / totalBeta) * 100) : 0;
    const byPlan = (byPlanRaw[0] as any[]).map((r: any) => ({ plan: r.plan as string, count: Number(r.cnt) }));
    return { totalBeta, converted, conversionRate, byPlan };
  }),
});
