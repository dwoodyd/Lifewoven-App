import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { tierCanAccessGroundGuide, tierCanAccessWeeklyReflection } from "../tierHelpers";
import {
  users, btwProfiles, btwGroundChecks, btwDailySessions, btwReturns,
  btwPrayers, btwGratitudeEntries, btwAudioItems, btwWeeklyReflections,
} from "../../drizzle/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// ─── Ground Check scoring ─────────────────────────────────────────────────────

function scoreGroundCheck(answers: number[]): { state: string; practice: string } {
  const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
  const hasHighFear = answers[1] >= 4 || answers[3] >= 4;
  const hasHighStriving = answers[2] >= 4 || answers[5] >= 4;
  const hasDepletion = answers[6] >= 4;
  const hasDrift = answers[4] >= 4;

  if (avg <= 1.5) return { state: "settled", practice: "enter_the_ground" };
  if (hasDepletion) return { state: "depleted", practice: "gentle_reset" };
  if (hasHighFear) return { state: "bracing", practice: "return_to_ground" };
  if (hasHighStriving) return { state: "striving", practice: "living_as_heard" };
  if (hasDrift) return { state: "drifting", practice: "midday_return" };
  return { state: "settled", practice: "thanking_from_there" };
}

// ─── Router ───────────────────────────────────────────────────────────────────

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db;
}

export const btwRouter = router({
  // Profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDb();
    const [profile] = await db.select().from(btwProfiles).where(eq(btwProfiles.userId, ctx.user.id));
    return profile ?? null;
  }),

  upsertProfile: protectedProcedure
    .input(z.object({
      preferredMode: z.enum(["text", "audio", "silent"]).optional(),
      audioEnabled: z.boolean().optional(),
      faithLanguageConfirmed: z.boolean().optional(),
      lastPrimaryState: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const existing = await db.select().from(btwProfiles).where(eq(btwProfiles.userId, ctx.user.id));
      if (existing.length > 0) {
        await db.update(btwProfiles).set(input).where(eq(btwProfiles.userId, ctx.user.id));
      } else {
        await db.insert(btwProfiles).values({ userId: ctx.user.id, ...input });
      }
      const [profile] = await db.select().from(btwProfiles).where(eq(btwProfiles.userId, ctx.user.id));
      return profile;
    }),

  // Ground Check
  submitGroundCheck: protectedProcedure
    .input(z.object({ answers: z.array(z.number().min(0).max(5)).length(7) }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const { state, practice } = scoreGroundCheck(input.answers);
      await db.insert(btwGroundChecks).values({
        userId: ctx.user.id,
        stateResult: state as any,
        answersJson: input.answers,
        recommendedPractice: practice,
      });
      await db.update(btwProfiles).set({ lastPrimaryState: state }).where(eq(btwProfiles.userId, ctx.user.id)).catch(() => {});
      return { state, practice };
    }),

  getGroundCheckHistory: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
    return db.select().from(btwGroundChecks)
      .where(eq(btwGroundChecks.userId, ctx.user.id))
      .orderBy(desc(btwGroundChecks.createdAt))
      .limit(10);
  }),

  // Daily Sessions
  startSession: protectedProcedure
    .input(z.object({
      sessionType: z.enum(["morning", "midday", "evening", "return", "emergency"]),
      stateBefore: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [session] = await db.insert(btwDailySessions).values({
        userId: ctx.user.id,
        sessionType: input.sessionType,
        stateBeforeId: input.stateBefore,
      }).$returningId();
      return session;
    }),

  completeSession: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      durationSeconds: z.number(),
      stateAfter: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.update(btwDailySessions).set({
        completed: true,
        completedAt: new Date(),
        durationSeconds: input.durationSeconds,
        stateAfterId: input.stateAfter,
      }).where(and(eq(btwDailySessions.id, input.sessionId), eq(btwDailySessions.userId, ctx.user.id)));
      return { ok: true };
    }),

  getTodaySessions: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return db.select().from(btwDailySessions)
      .where(and(eq(btwDailySessions.userId, ctx.user.id), gte(btwDailySessions.startedAt, today)));
  }),

  // Returns
  logReturn: protectedProcedure
    .input(z.object({
      returnType: z.enum(["30sec", "2min", "fear", "discouragement", "depletion"]),
      triggerTag: z.string().optional(),
      beforeState: z.string().optional(),
      afterState: z.string().optional(),
      nextAction: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.insert(btwReturns).values({ userId: ctx.user.id, ...input });
      return { ok: true };
    }),

  // Prayers
  getPrayers: protectedProcedure
    .input(z.object({ topicTag: z.string().optional(), statusTag: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await requireDb();
      return db.select().from(btwPrayers)
        .where(eq(btwPrayers.userId, ctx.user.id))
        .orderBy(desc(btwPrayers.createdAt))
        .limit(50);
    }),

  savePrayer: protectedProcedure
    .input(z.object({
      id: z.number().optional(),
      title: z.string().optional(),
      body: z.string().min(1),
      toneTag: z.enum(["trust", "fear", "striving", "grief", "gratitude", "honest", "mixed"]).default("honest"),
      topicTag: z.enum(["long_wait", "fear", "provision", "relationship", "calling", "grief", "uncertainty", "gratitude", "not_yet", "answered", "still_carrying"]).default("still_carrying"),
      statusTag: z.enum(["carrying", "released", "answered", "returning"]).default("carrying"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      if (input.id) {
        await db.update(btwPrayers).set(input).where(and(eq(btwPrayers.id, input.id), eq(btwPrayers.userId, ctx.user.id)));
        return { id: input.id };
      }
      const [r] = await db.insert(btwPrayers).values({ userId: ctx.user.id, ...input }).$returningId();
      return r;
    }),

  deletePrayer: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.delete(btwPrayers).where(and(eq(btwPrayers.id, input.id), eq(btwPrayers.userId, ctx.user.id)));
      return { ok: true };
    }),

  // AI reflection on prayer (Oracle Ground Guide)
  reflectOnPrayer: protectedProcedure
    .input(z.object({ prayerBody: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Tier gate: Seeker+ only
      const db = await requireDb();
      const [user] = await db.select({ membershipTier: users.membershipTier }).from(users).where(eq(users.id, ctx.user.id));
      if (!tierCanAccessGroundGuide(user?.membershipTier as any)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "UPGRADE_REQUIRED:seeker" });
      }
      const response = await invokeLLM({
        messages: [
          {
            role: "system" as const,
            content: `You are the Ground Guide — a calm, warm, spiritually literate reflective companion inside the Before the Words pathway of Lifewoven. Your role is to help users move from inner reaction to grounded presence.

TONE: calm, warm, non-performative, not overconfident, not sentimental, not preachy.

RESPONSE SHAPE (always follow this structure):
1. Name what seems present (one sentence — what emotional posture or inner state is showing up)
2. Normalize without minimizing (one sentence — this is real, it makes sense)
3. Suggest one return (one specific practice or micro-action)
4. Offer one optional prayer or reflection prompt (short, honest, trust-oriented)

HARD GUARDRAILS — never say:
- "God told me..." or "This is what God is doing in your life..."
- "Your outcome is guaranteed..."
- "You should stop medical treatment and trust..."
- Do not claim divine authority or prophetic insight
- Do not diagnose psychologically
- Do not give more than one suggestion at a time

You are a reflective companion, not a spiritual authority.`,
          },
          {
            role: "user" as const,
            content: `Here is what I wrote in my prayer journal:\n\n${input.prayerBody}\n\nPlease reflect on the inner posture present here and offer gentle guidance.`,
          },
        ],
      });
      const content = response?.choices?.[0]?.message?.content ?? "";
      return { reflection: content };
    }),

  // Gratitude
  getGratitudeEntries: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
    return db.select().from(btwGratitudeEntries)
      .where(eq(btwGratitudeEntries.userId, ctx.user.id))
      .orderBy(desc(btwGratitudeEntries.createdAt))
      .limit(30);
  }),

  saveGratitude: protectedProcedure
    .input(z.object({
      entryText: z.string().min(1),
      gratitudeType: z.enum(["morning", "evening", "sparse_table", "hard_day", "specific_mercy"]).default("evening"),
      feltRealness: z.enum(["real", "forced", "mixed"]).default("real"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [r] = await db.insert(btwGratitudeEntries).values({ userId: ctx.user.id, ...input }).$returningId();
      return r;
    }),

  // Audio items
  getAudioItems: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
    return db.select().from(btwAudioItems)
      .where(eq(btwAudioItems.userId, ctx.user.id))
      .orderBy(desc(btwAudioItems.createdAt));
  }),

  saveAudioItem: protectedProcedure
    .input(z.object({
      type: z.enum(["prayer", "declaration", "voice_note", "scripture"]),
      title: z.string().optional(),
      sourceType: z.enum(["recorded", "uploaded", "library"]).default("recorded"),
      fileUrlOrText: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [r] = await db.insert(btwAudioItems).values({ userId: ctx.user.id, ...input }).$returningId();
      return r;
    }),

  toggleAudioFavorite: protectedProcedure
    .input(z.object({ id: z.number(), favorite: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.update(btwAudioItems).set({ favorite: input.favorite })
        .where(and(eq(btwAudioItems.id, input.id), eq(btwAudioItems.userId, ctx.user.id)));
      return { ok: true };
    }),

  // Weekly reflection (AI-generated)
  generateWeeklyReflection: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await requireDb();
      // Tier gate: Seeker+ only
      const [user] = await db.select({ membershipTier: users.membershipTier }).from(users).where(eq(users.id, ctx.user.id));
      if (!tierCanAccessWeeklyReflection(user?.membershipTier as any)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "UPGRADE_REQUIRED:seeker" });
      }
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [sessions, returns, prayers, gratitude] = await Promise.all([
      db.select().from(btwDailySessions).where(and(eq(btwDailySessions.userId, ctx.user.id), gte(btwDailySessions.startedAt, weekAgo))),
      db.select().from(btwReturns).where(and(eq(btwReturns.userId, ctx.user.id), gte(btwReturns.createdAt, weekAgo))),
      db.select().from(btwPrayers).where(and(eq(btwPrayers.userId, ctx.user.id), gte(btwPrayers.createdAt, weekAgo))),
      db.select().from(btwGratitudeEntries).where(and(eq(btwGratitudeEntries.userId, ctx.user.id), gte(btwGratitudeEntries.createdAt, weekAgo))),
    ]);

    const summary = {
      sessionsCompleted: sessions.filter((s: typeof sessions[0]) => s.completed).length,
      returnsCount: returns.length,
      prayersWritten: prayers.length,
      gratitudeEntries: gratitude.length,
      statesMostCommon: returns.map((r: typeof returns[0]) => r.beforeState).filter(Boolean),
    };

    const response = await invokeLLM({
      messages: [
        {
          role: "system" as const,
          content: `You are the Ground Guide. Generate a warm, honest weekly reflection for a Before the Words user. 
Format as JSON with keys: driftedMost (string), returnedBest (string), helpedMost (string), stateShowedUp (string), focusNextWeek (string).
Keep each value to 1-2 sentences. Never use shame language. Always affirm return.`,
        },
        { role: "user" as const, content: `Weekly data: ${JSON.stringify(summary)}` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "weekly_reflection",
          strict: true,
          schema: {
            type: "object",
            properties: {
              driftedMost: { type: "string" },
              returnedBest: { type: "string" },
              helpedMost: { type: "string" },
              stateShowedUp: { type: "string" },
              focusNextWeek: { type: "string" },
            },
            required: ["driftedMost", "returnedBest", "helpedMost", "stateShowedUp", "focusNextWeek"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response?.choices?.[0]?.message?.content;
    const reflectionData = JSON.parse(typeof rawContent === 'string' ? rawContent : "{}");
    const [r] = await db.insert(btwWeeklyReflections).values({
      userId: ctx.user.id,
      summaryJson: reflectionData,
      focusSuggestion: reflectionData.focusNextWeek,
    }).$returningId();
    return { id: r.id, ...reflectionData };
  }),

  getLatestWeeklyReflection: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
    const [r] = await db.select().from(btwWeeklyReflections)
      .where(eq(btwWeeklyReflections.userId, ctx.user.id))
      .orderBy(desc(btwWeeklyReflections.createdAt))
      .limit(1);
    return r ?? null;
  }),

  // Stats for Closing the Gap
  getStats: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
    const [sessions, returns, prayers, gratitude] = await Promise.all([
      db.select().from(btwDailySessions).where(eq(btwDailySessions.userId, ctx.user.id)),
      db.select().from(btwReturns).where(eq(btwReturns.userId, ctx.user.id)),
      db.select().from(btwPrayers).where(eq(btwPrayers.userId, ctx.user.id)),
      db.select().from(btwGratitudeEntries).where(eq(btwGratitudeEntries.userId, ctx.user.id)),
    ]);
    const completed = sessions.filter((s: typeof sessions[0]) => s.completed);
    const morning = completed.filter((s: typeof sessions[0]) => s.sessionType === "morning").length;
    const evening = completed.filter((s: typeof sessions[0]) => s.sessionType === "evening").length;
    return {
      totalSessions: completed.length,
      morningCount: morning,
      eveningCount: evening,
      returnsCount: returns.length,
      prayersCount: prayers.length,
      gratitudeCount: gratitude.length,
    };
  }),
});
