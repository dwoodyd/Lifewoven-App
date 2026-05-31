import { COOKIE_NAME } from "@shared/const";
import { btwRouter } from "./routers/btw";
import { paypalOrdersRouter } from "./routers/paypalOrders";
import { adminRouter } from "./routers/admin";
import { referralRouter } from "./routers/referral";
import { betaRouter } from "./routers/beta";
import { characterRouter } from "./routers/character";
import { moodLogRouter } from "./routers/moodLog";
import { storeRouter } from "./routers/store";
import { applicationsRouter } from "./routers/applications";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import {
  auditResults, checkIns, journalEntries, habits, habitLogs,
  scorecards, beliefs, decisions, energyAudits, oracleInsights,
  oracleConversations, userPathways, pathwaySessions, resources, courses, enrollments,
  products, communityPosts, communityComments, communityLikes, orders, users, moodLogs
} from "../drizzle/schema";
import { eq, desc, and, like, sql, gte } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
import { tierCanAccessOracle } from "./tierHelpers";
import { TRPCError } from "@trpc/server";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";

// ─── Audit Router ─────────────────────────────────────────────────────────────
const auditRouter = router({
  save: protectedProcedure
    .input(z.object({
      answers: z.record(z.string(), z.number()),
      scores: z.record(z.string(), z.number()),
      recommendedPathway: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      // Check if this is the user's first audit (for auto-draft journal)
      const existingAudits = await db.select({ id: auditResults.id })
        .from(auditResults).where(eq(auditResults.userId, ctx.user.id)).limit(1);
      const isFirstAudit = existingAudits.length === 0;

      await db.transaction(async (tx) => {
        await tx.insert(auditResults).values({
          userId: ctx.user.id,
          answers: input.answers,
          scores: input.scores,
          recommendedPathway: input.recommendedPathway,
        });
        // Mark onboarding complete — atomic with the audit insert
        await tx.update(users)
          .set({ onboardingCompleted: true, primaryPathway: input.recommendedPathway })
          .where(eq(users.id, ctx.user.id));
      });

      // Auto-draft first journal entry from audit responses (fire-and-forget, non-blocking)
      if (isFirstAudit) {
        const dimNames: Record<string, string> = {
          state: "State", story: "Story", standards: "Standards",
          strategy: "Strategy", stewardship: "Stewardship",
        };
        const scoreLines = Object.entries(input.scores)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .map(([dim, pct]) => `${dimNames[dim] ?? dim}: ${Math.round(pct as number)}%`)
          .join(", ");
        const lowestDim = Object.entries(input.scores)
          .sort(([, a], [, b]) => (a as number) - (b as number))[0]?.[0] ?? "";
        const prompt = `You are writing a brief, warm, first-person journal entry for someone who just completed a personal alignment audit.
Audit results: pathway recommended = ${input.recommendedPathway}, 5S scores = ${scoreLines}.
Lowest dimension: ${lowestDim}.
Write 3-4 sentences as if the person is reflecting on their results. Use "I" voice. Be honest, compassionate, and forward-looking. No headers, no lists. Plain prose only.`;
        invokeLLM({
          messages: [
            { role: "system", content: "You write warm, honest personal journal entries. Respond with only the journal text." },
            { role: "user", content: prompt },
          ],
        }).then(async (llmRes) => {
          const rawContent = llmRes.choices?.[0]?.message?.content ?? "";
          const body = typeof rawContent === "string" ? rawContent.trim() : "";
          if (!body) return;
          const firstSentence = body.split(/[.!?]/)[0]?.trim() ?? "";
          const title = firstSentence.length > 80
            ? firstSentence.slice(0, 77) + "…"
            : firstSentence || "My Alignment Audit Reflection";
          const db2 = await getDb();
          if (!db2) return;
          await db2.insert(journalEntries).values({
            userId: ctx.user.id,
            title,
            content: body,
            module: "state",
            isPrivate: true,
          });
        }).catch(() => { /* non-blocking — ignore errors */ });
      }

      return { success: true };
    }),

  latest: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const results = await db.select().from(auditResults)
      .where(eq(auditResults.userId, ctx.user.id))
      .orderBy(desc(auditResults.createdAt))
      .limit(1);
    return results[0] ?? null;
  }),
});

// ─── Check-in Router ──────────────────────────────────────────────────────────
const checkInRouter = router({
  create: protectedProcedure
    .input(z.object({
      emotionalScore: z.number().min(1).max(22),
      energyLevel: z.number().min(1).max(10),
      clarityLevel: z.number().min(1).max(10),
      note: z.string().optional(),
      module: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [result] = await db.insert(checkIns).values({
        userId: ctx.user.id,
        ...input,
      });
      return result;
    }),

  recent: protectedProcedure
    .input(z.object({ limit: z.number().default(7) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(checkIns)
        .where(eq(checkIns.userId, ctx.user.id))
        .orderBy(desc(checkIns.createdAt))
        .limit(input.limit);
    }),
});

// ─── Journal Router ───────────────────────────────────────────────────────────
const journalRouter = router({
  list: protectedProcedure
    .input(z.object({
      module: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      let query = db.select().from(journalEntries)
        .where(eq(journalEntries.userId, ctx.user.id))
        .orderBy(desc(journalEntries.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      return query;
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const results = await db.select().from(journalEntries)
        .where(and(eq(journalEntries.id, input.id), eq(journalEntries.userId, ctx.user.id)));
      return results[0] ?? null;
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().optional(),
      content: z.string().min(1),
      module: z.enum(["state", "story", "standards", "strategy", "stewardship", "free"]).default("free"),
      pathway: z.string().optional(),
      tags: z.array(z.string()).optional(),
      emotionalScore: z.number().optional(),
      isPrivate: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      // Auto-title from first sentence if no title provided
      const autoTitle = input.title ||
        input.content.split(/[.!?\n]/)[0].trim().slice(0, 80) ||
        "Untitled entry";
      await db.insert(journalEntries).values({
        userId: ctx.user.id,
        ...input,
        title: autoTitle,
        tags: input.tags ?? [],
      });
      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      content: z.string().optional(),
      tags: z.array(z.string()).optional(),
      emotionalScore: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { id, ...updates } = input;
      await db.update(journalEntries)
        .set(updates)
        .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, ctx.user.id)));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(journalEntries)
        .where(and(eq(journalEntries.id, input.id), eq(journalEntries.userId, ctx.user.id)));
      return { success: true };
    }),

  generatePrompt: protectedProcedure
    .input(z.object({
      module: z.string().max(50),
      pathway: z.string().max(100).optional(),
      recentEntries: z.array(z.string().max(500)).max(5).optional(),
    }))
    .mutation(async ({ input }) => {
      const systemPrompt = `You are the Lifewoven Journal Oracle — a wise, warm, and perceptive guide rooted in the Lifewoven framework of interior alignment, identity, meaning, and deliberate practice. Generate a single, powerful journaling prompt for the ${input.module} module${input.pathway ? ` (${input.pathway} pathway)` : ""}. The prompt should be introspective, specific, and invite genuine self-reflection. Return only the prompt text, nothing else.`;
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a journaling prompt for the ${input.module} module.` },
        ],
      });
      return { prompt: response.choices[0]?.message?.content ?? "What is most alive in you right now?" };
    }),

  generateReflection: protectedProcedure
    .input(z.object({ entryId: z.number(), content: z.string().max(20000) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are the Lifewoven Oracle. Read this journal entry and offer a brief, wise, compassionate reflection (2-3 sentences). Identify one key theme or pattern. Do not be preachy. Be warm and specific." },
          { role: "user", content: input.content },
        ],
      });
      const rawRef = response.choices[0]?.message?.content;
      const reflection = typeof rawRef === "string" ? rawRef : "";
      await db.update(journalEntries)
        .set({ aiReflection: reflection })
        .where(and(eq(journalEntries.id, input.entryId), eq(journalEntries.userId, ctx.user.id)));
      return { reflection };
    }),

  exportData: protectedProcedure
    .input(z.object({
      module: z.string().optional(),
      limit: z.number().default(200),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { entries: [], userName: ctx.user.name ?? "" };
      let q = db.select().from(journalEntries)
        .where(eq(journalEntries.userId, ctx.user.id))
        .orderBy(desc(journalEntries.createdAt))
        .limit(input.limit);
      const entries = await q;
      const filtered = input.module
        ? entries.filter(e => e.module === input.module)
        : entries;
      return { entries: filtered, userName: ctx.user.name ?? "" };
    }),

  transcribeVoice: protectedProcedure
    .input(z.object({ audioDataUrl: z.string(), mimeType: z.string().default("audio/webm") }))
    .mutation(async ({ ctx, input }) => {
      // Decode base64 data URL and upload to S3
      const base64 = input.audioDataUrl.split(",")[1];
      if (!base64) throw new Error("Invalid audio data");
      const buffer = Buffer.from(base64, "base64");
      if (buffer.byteLength > 16 * 1024 * 1024) throw new Error("Audio file too large (max 16 MB)");
      const ext = input.mimeType.includes("mp4") ? "mp4" : input.mimeType.includes("wav") ? "wav" : "webm";
      const key = `voice-journal/${ctx.user.id}/${Date.now()}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      const result = await transcribeAudio({ audioUrl: url });
      if ("error" in result) throw new Error(result.error ?? "Transcription failed");
      return { text: result.text ?? "" };
    }),
});

// ─── Habits Router ────────────────────────────────────────────────────────────
const habitsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(habits)
      .where(and(eq(habits.userId, ctx.user.id), eq(habits.isActive, true)))
      .orderBy(habits.createdAt);
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(200),
      description: z.string().max(500).optional(),
      module: z.enum(["state", "story", "standards", "strategy", "stewardship"]).default("standards"),
      cue: z.string().max(300).optional(),
      reward: z.string().max(300).optional(),
      identityStatement: z.string().max(300).optional(),
      frequency: z.enum(["daily", "weekly", "custom"]).default("daily"),
      targetDays: z.array(z.number()).optional(),
      fullVersion: z.string().max(300).optional(),
      smallVersion: z.string().max(300).optional(),
      tinyVersion: z.string().max(300).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(habits).values({ userId: ctx.user.id, ...input });
      return { success: true };
    }),

  logCompletion: protectedProcedure
    .input(z.object({ habitId: z.number(), note: z.string().optional(), quality: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      // L1: Ownership check — verify the habit belongs to the requesting user
      const [ownedHabit] = await db.select({ id: habits.id }).from(habits)
        .where(and(eq(habits.id, input.habitId), eq(habits.userId, ctx.user.id))).limit(1);
      if (!ownedHabit) throw new TRPCError({ code: "FORBIDDEN", message: "Habit not found." });
      await db.insert(habitLogs).values({
        habitId: input.habitId,
        userId: ctx.user.id,
        note: input.note,
        quality: input.quality,
      });
      // Update streak
      await db.update(habits)
        .set({ streak: sql`streak + 1` })
        .where(and(eq(habits.id, input.habitId), eq(habits.userId, ctx.user.id)));
      return { success: true };
    }),

  todayLogs: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return db.select().from(habitLogs)
      .where(and(
        eq(habitLogs.userId, ctx.user.id),
        sql`DATE(completedAt) = CURDATE()`
      ));
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(habits).set({ isActive: false })
        .where(and(eq(habits.id, input.id), eq(habits.userId, ctx.user.id)));
      return { success: true };
    }),
});

// ─── Beliefs Router ───────────────────────────────────────────────────────────
const beliefsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(beliefs)
      .where(eq(beliefs.userId, ctx.user.id))
      .orderBy(desc(beliefs.createdAt));
  }),

  create: protectedProcedure
    .input(z.object({
      limitingBelief: z.string().min(1),
      empoweringBelief: z.string().optional(),
      evidence: z.string().optional(),
      declaration: z.string().optional(),
      category: z.enum(["self", "money", "relationships", "health", "purpose", "other"]).default("self"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(beliefs).values({ userId: ctx.user.id, ...input });
      return { success: true };
    }),

  rewrite: protectedProcedure
    .input(z.object({ id: z.number(), limitingBelief: z.string().max(1000) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a belief transformation coach trained in the Lifewoven belief transformation framework. Given a constraining belief, provide: 1) An empowering reframe, 2) Three pieces of counter-evidence to collect, 3) A grounding declaration. Format as JSON: { empoweringBelief, evidence, declaration }" },
          { role: "user", content: `Constraining belief: "${input.limitingBelief}"` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "belief_rewrite",
            strict: true,
            schema: {
              type: "object",
              properties: {
                empoweringBelief: { type: "string" },
                evidence: { type: "string" },
                declaration: { type: "string" },
              },
              required: ["empoweringBelief", "evidence", "declaration"],
              additionalProperties: false,
            },
          },
        },
      });
      const rawBelief = response.choices[0]?.message?.content;
      const content = JSON.parse(typeof rawBelief === "string" ? rawBelief : "{}");
      await db.update(beliefs)
        .set({ ...content, isRewritten: true })
        .where(and(eq(beliefs.id, input.id), eq(beliefs.userId, ctx.user.id)));
      return content;
    }),
});

// ─── Decisions Router ─────────────────────────────────────────────────────────
const decisionsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(decisions)
      .where(eq(decisions.userId, ctx.user.id))
      .orderBy(desc(decisions.createdAt));
  }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      context: z.string().optional(),
      options: z.array(z.object({ option: z.string(), pros: z.array(z.string()), cons: z.array(z.string()) })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(decisions).values({ userId: ctx.user.id, ...input });
      return { success: true };
    }),

  analyze: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string(), context: z.string().optional(), options: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a strategic decision coach. Analyze this decision using second-order thinking and provide clear guidance. Return JSON: { analysis, secondOrderEffects, recommendation, keyQuestion }" },
          { role: "user", content: `Decision: ${input.title}\nContext: ${input.context ?? "none"}\nOptions: ${input.options.join(", ")}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "decision_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                analysis: { type: "string" },
                secondOrderEffects: { type: "string" },
                recommendation: { type: "string" },
                keyQuestion: { type: "string" },
              },
              required: ["analysis", "secondOrderEffects", "recommendation", "keyQuestion"],
              additionalProperties: false,
            },
          },
        },
      });
      const rawDecision = response.choices[0]?.message?.content;
      return JSON.parse(typeof rawDecision === "string" ? rawDecision : "{}");
    }),
});

// ─── Energy Audit Router ──────────────────────────────────────────────────────
const energyRouter = router({
  create: protectedProcedure
    .input(z.object({
      date: z.string().max(20),
      sleepHours: z.number().optional(),
      movementMinutes: z.number().optional(),
      sunExposure: z.boolean().optional(),
      screenTimeHours: z.number().optional(),
      dopamineAudit: z.array(z.object({ trigger: z.string(), rating: z.number() })).optional(),
      energyScore: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(energyAudits).values({
        userId: ctx.user.id,
        date: input.date,
        sleepHours: input.sleepHours?.toString(),
        movementMinutes: input.movementMinutes,
        sunExposure: input.sunExposure,
        screenTimeHours: input.screenTimeHours?.toString(),
        dopamineAudit: input.dopamineAudit,
        energyScore: input.energyScore,
        notes: input.notes,
      });
      return { success: true };
    }),

  recent: protectedProcedure
    .input(z.object({ limit: z.number().default(7) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(energyAudits)
        .where(eq(energyAudits.userId, ctx.user.id))
        .orderBy(desc(energyAudits.createdAt))
        .limit(input.limit);
    }),
});

// ─── Oracle Router ────────────────────────────────────────────────────────────
const oracleRouter = router({
  chat: protectedProcedure
    .input(z.object({
      message: z.string().min(1),
      conversationId: z.number().optional(),
      context: z.object({
        recentCheckIns: z.array(z.any()).optional(),
        recentJournals: z.array(z.string()).optional(),
        habitStreak: z.number().optional(),
        primaryPathway: z.string().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // H1: Tier gate — Oracle chat requires oracle tier OR sampler (3 free/month for Explorer/Seeker)
      const [userTierRow] = await db.select({ membershipTier: users.membershipTier, role: users.role }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const isAdmin = userTierRow?.role === "admin";
      const hasFullOracle = tierCanAccessOracle(userTierRow?.membershipTier as any);
      if (!isAdmin && !hasFullOracle) {
        // Oracle Sampler: allow 3 free questions per calendar month for Explorer/Seeker
        const SAMPLER_LIMIT = 3;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const [{ count: monthlyCount }] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(oracleConversations)
          .where(and(eq(oracleConversations.userId, ctx.user.id), gte(oracleConversations.createdAt, monthStart)));
        if (monthlyCount >= SAMPLER_LIMIT) {
          throw new TRPCError({ code: "FORBIDDEN", message: `You've used all ${SAMPLER_LIMIT} free Oracle questions for this month. Upgrade to Oracle for unlimited sessions.` });
        }
      }

      // Fetch user mind patterns for Oracle adaptation
      const userRow = await db.select({ mindPatterns: users.mindPatterns }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const mindPats = (userRow[0]?.mindPatterns as string[] | null) ?? [];
      const mindContext = mindPats.length > 0
        ? `\n- How this user's mind works: ${mindPats.join(", ")}. Adapt your tone, pacing, and suggestions accordingly — shorter steps for scattered minds, gentler framing for overwhelmed ones, concrete first actions for those who struggle to start.`
        : "";

      // Fetch mood rhythm cycle phase for Oracle context
      const recentMoods = await db.select({ score: moodLogs.score, logDate: moodLogs.logDate })
        .from(moodLogs)
        .where(eq(moodLogs.userId, ctx.user.id))
        .orderBy(desc(moodLogs.logDate))
        .limit(5);
      let cyclePhase: "rising" | "peak" | "falling" | "trough" | "unknown" = "unknown";
      if (recentMoods.length >= 3) {
        const [s0, s1, s2] = recentMoods.map(m => m.score);
        if (s0 > s1 && s1 > s2) cyclePhase = "rising";
        else if (s0 < s1 && s1 < s2) cyclePhase = "falling";
        else if (s0 > s1 && s0 > s2) cyclePhase = "peak";
        else if (s0 < s1 && s0 < s2) cyclePhase = "trough";
      }
      const cyclePhaseDescriptions: Record<string, string> = {
        rising:  "Their emotional energy is building — they are in an ascending phase. This is a good moment for new commitments, clarity work, and forward momentum.",
        peak:    "They are at or near an emotional high point. Celebrate wins, set intentions, and plant seeds for the next cycle.",
        falling: "Their energy is beginning to descend. This is a natural transition — encourage rest, reflection, and consolidation rather than pushing harder.",
        trough:  "They are in a low-energy phase. Lead with compassion, reduce demands, and focus on the smallest possible next step. This is a reset, not a failure.",
        unknown: "",
      };
      const cycleContext = cyclePhase !== "unknown"
        ? `\n- Emotional rhythm phase: ${cyclePhase}. ${cyclePhaseDescriptions[cyclePhase]}`
        : "";

      // Build system prompt with user context
      const systemPrompt = `You are the Lifewoven Oracle — a wise, warm, and deeply perceptive guide rooted in the Lifewoven 5S Framework. Use these canonical definitions consistently — they are the same definitions used throughout the Lifewoven platform:

State — Your emotional and energetic quality in this moment. State is not a mood to manage; it is the interior weather that determines the quality of everything you do. Interior alignment precedes outer results: you cannot think clearly, act consistently, or connect deeply from a dysregulated state. State work is the foundation.

Story — The beliefs, identity narratives, and meaning-making frameworks that shape your perception of reality. Your story is not what happened to you — it is the interpretation you carry forward. Constraining beliefs limit your possibilities before you even begin. Identity-level change ("I am someone who...") is more durable than behavioral change alone.

Standards — Your values, commitments, and the non-negotiable rhythms that define who you are in practice. Standards are not rules imposed from outside — they are the expression of your identity in daily life. A standard without a rhythm is an aspiration. A rhythm without a standard is a habit without a soul.

Strategy — Your goals, systems, and the deliberate design of how you move toward what matters. Strategy is not about hustle or optimization — it is about alignment between your interior state and your external actions. The right strategy from alignment produces flow.

Stewardship — The ongoing care of your whole self: body, energy, relationships, environment, and legacy. Stewardship is the recognition that you are a resource, and resources require tending. It is the long game — the practice of maintaining what you have built so it compounds over time.

These five dimensions are an integrated system. A shift in State changes what Stories become available. A clarified Story raises Standards. Elevated Standards inform Strategy. Disciplined Strategy, sustained through Stewardship, creates a life of meaning and momentum.

You speak with warmth, precision, and wisdom. You ask powerful questions. You recognize patterns. You guide without preaching. You meet the user exactly where they are. Always use the canonical definitions above when referencing any of the five dimensions.

RESPONSE FORMAT: You MUST reply with valid JSON in exactly this shape — no markdown fences, no extra keys:
{"reply": "<your full response text>", "tags": ["State"]}
- "reply": your complete response (markdown allowed inside the string)
- "tags": array of 1–3 of the 5S dimension names most central to your response. Valid values: "State", "Story", "Standards", "Strategy", "Stewardship". Choose only dimensions genuinely present — do not force all five.

User context:
- Primary pathway: ${input.context?.primaryPathway ?? "not set"}
- Recent emotional scores: ${input.context?.recentCheckIns?.map((c: any) => c.emotionalScore).join(", ") ?? "none"}
- Habit streak: ${input.context?.habitStreak ?? 0} days${mindContext}${cycleContext}`;

      // Get or build conversation history
      let messages: { role: string; content: string }[] = [];
      if (input.conversationId) {
        const convs = await db.select().from(oracleConversations)
          .where(and(eq(oracleConversations.id, input.conversationId), eq(oracleConversations.userId, ctx.user.id)));
        if (convs[0]) {
          messages = (convs[0].messages as any[]) ?? [];
        }
      }

      messages.push({ role: "user", content: input.message });

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        ],
      });

      const rawContent = response.choices[0]?.message?.content;
      // Parse structured JSON response; fall back gracefully if LLM returns plain text
      let reply = "I'm here with you. Tell me more.";
      let tags: string[] = [];
      if (typeof rawContent === "string") {
        try {
          // Strip possible markdown code fences the LLM may add
          const cleaned = rawContent.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "");
          const parsed = JSON.parse(cleaned);
          if (parsed && typeof parsed.reply === "string") {
            reply = parsed.reply;
            const validTags = ["State", "Story", "Standards", "Strategy", "Stewardship"];
            tags = Array.isArray(parsed.tags)
              ? (parsed.tags as unknown[]).filter((t): t is string => typeof t === "string" && validTags.includes(t))
              : [];
          } else {
            reply = rawContent;
          }
        } catch {
          // LLM returned plain text — use as-is, no tags
          reply = rawContent;
        }
      }
      messages.push({ role: "assistant", content: reply });

      // Save conversation
      if (input.conversationId) {
        await db.update(oracleConversations)
          .set({ messages, updatedAt: new Date() })
          .where(eq(oracleConversations.id, input.conversationId));
        return { reply, tags, conversationId: input.conversationId };
      } else {
        const [inserted] = await db.insert(oracleConversations).values({
          userId: ctx.user.id,
          messages,
          context: input.context ?? {},
        });
        return { reply, tags, conversationId: (inserted as any).insertId };
      }
    }),

  insights: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(oracleInsights)
      .where(and(eq(oracleInsights.userId, ctx.user.id), eq(oracleInsights.isRead, false)))
      .orderBy(desc(oracleInsights.createdAt))
      .limit(5);
  }),

  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(oracleInsights)
        .set({ isRead: true })
        .where(and(eq(oracleInsights.id, input.id), eq(oracleInsights.userId, ctx.user.id)));
      return { success: true };
    }),

  generateInsights: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // H1: Tier gate — Oracle insights require oracle tier (admins bypass)
    const [userTierRow2] = await db.select({ membershipTier: users.membershipTier, role: users.role }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const isAdmin2 = userTierRow2?.role === "admin";
    if (!isAdmin2 && !tierCanAccessOracle(userTierRow2?.membershipTier as any)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Oracle access requires the Oracle membership tier. Upgrade to unlock unlimited Oracle AI sessions." });
    }

    // Gather recent data
    const [recentCheckIns, recentJournals, recentHabits] = await Promise.all([
      db.select().from(checkIns).where(eq(checkIns.userId, ctx.user.id)).orderBy(desc(checkIns.createdAt)).limit(7),
      db.select().from(journalEntries).where(eq(journalEntries.userId, ctx.user.id)).orderBy(desc(journalEntries.createdAt)).limit(5),
      db.select().from(habits).where(and(eq(habits.userId, ctx.user.id), eq(habits.isActive, true))).limit(10),
    ]);

    if (recentCheckIns.length === 0 && recentJournals.length === 0) {
      return { insights: [] };
    }

    const dataContext = `
Check-ins (last 7): ${JSON.stringify(recentCheckIns.map(c => ({ emotional: c.emotionalScore, energy: c.energyLevel, clarity: c.clarityLevel })))}
Journal themes: ${recentJournals.map(j => j.title || j.content.slice(0, 100)).join("; ")}
Active habits: ${recentHabits.map(h => `${h.name} (streak: ${h.streak})`).join(", ")}`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are the Lifewoven Oracle pattern recognition engine. Analyze the user's recent data and identify 1-2 meaningful patterns or insights. Return JSON array: [{ type: 'pattern'|'recommendation'|'nudge', module: string, content: string }]" },
        { role: "user", content: dataContext },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "insights",
          strict: true,
          schema: {
            type: "object",
            properties: {
              insights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    module: { type: "string" },
                    content: { type: "string" },
                  },
                  required: ["type", "module", "content"],
                  additionalProperties: false,
                },
              },
            },
            required: ["insights"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response.choices[0]?.message?.content;
    const contentStr = typeof rawContent === "string" ? rawContent : '{"insights":[]}';
    const { insights } = JSON.parse(contentStr);
    for (const insight of insights) {
      await db.insert(oracleInsights).values({
        userId: ctx.user.id,
        type: insight.type as any,
        module: insight.module,
        content: insight.content,
        sourceData: { checkIns: recentCheckIns.length, journals: recentJournals.length },
      });
    }
    return { insights };
  }),

  getMonthlyUsage: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { used: 0, limit: 3, hasFullAccess: false };
    const [userTierRow] = await db.select({ membershipTier: users.membershipTier, role: users.role }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const isAdmin = userTierRow?.role === "admin";
    const hasFullAccess = isAdmin || tierCanAccessOracle(userTierRow?.membershipTier as any);
    if (hasFullAccess) return { used: 0, limit: null, hasFullAccess: true };
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [{ count: used }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(oracleConversations)
      .where(and(eq(oracleConversations.userId, ctx.user.id), gte(oracleConversations.createdAt, monthStart)));
    return { used: Number(used), limit: 3, hasFullAccess: false };
  }),
});

// ─── Pathways Router ──────────────────────────────────────────────────────────
const pathwaysRouter = router({
  start: protectedProcedure
    .input(z.object({ pathway: z.string(), totalSteps: z.number().default(7) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      // Check if already active
      const existing = await db.select().from(userPathways)
        .where(and(eq(userPathways.userId, ctx.user.id), eq(userPathways.pathway, input.pathway), eq(userPathways.status, "active")));
      if (existing.length > 0) return { pathwayId: existing[0].id };
      await db.insert(userPathways).values({
        userId: ctx.user.id,
        pathway: input.pathway,
        totalSteps: input.totalSteps,
      });
      return { success: true };
    }),

  progress: protectedProcedure
    .input(z.object({ pathwayId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(userPathways)
        .set({ currentStep: sql`currentStep + 1` })
        .where(and(eq(userPathways.id, input.pathwayId), eq(userPathways.userId, ctx.user.id)));
      return { success: true };
    }),

  myPathways: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(userPathways)
      .where(eq(userPathways.userId, ctx.user.id))
      .orderBy(desc(userPathways.startedAt));
  }),

  saveSession: protectedProcedure
    .input(z.object({ pathway: z.string().max(100), stepsCompleted: z.number(), totalSteps: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(pathwaySessions).values({
        userId: ctx.user.id,
        pathway: input.pathway,
        stepsCompleted: input.stepsCompleted,
        totalSteps: input.totalSteps,
      });
      return { success: true };
    }),

  recentSessions: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(pathwaySessions)
        .where(eq(pathwaySessions.userId, ctx.user.id))
        .orderBy(desc(pathwaySessions.completedAt))
        .limit(input.limit);
    }),

  lastPracticed: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(pathwaySessions)
      .where(eq(pathwaySessions.userId, ctx.user.id))
      .orderBy(desc(pathwaySessions.completedAt))
      .limit(1);
    return rows[0] ?? null;
  }),

  practiceStreak: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { streak: 0, lastDate: null as string | null };
    const sessions = await db.select({ completedAt: pathwaySessions.completedAt })
      .from(pathwaySessions)
      .where(eq(pathwaySessions.userId, ctx.user.id))
      .orderBy(desc(pathwaySessions.completedAt))
      .limit(90);
    if (!sessions.length) return { streak: 0, lastDate: null as string | null };
    const toKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const days = Array.from(new Set(sessions.map(s => toKey(new Date(s.completedAt)))));
    const today = new Date();
    const yest = new Date(today); yest.setDate(today.getDate() - 1);
    if (days[0] !== toKey(today) && days[0] !== toKey(yest)) {
      return { streak: 0, lastDate: sessions[0].completedAt };
    }
    let streak = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(today); prev.setDate(today.getDate() - i);
      if (days[i] === toKey(prev)) streak++; else break;
    }
    return { streak, lastDate: sessions[0].completedAt };
  }),

  getProgress: protectedProcedure
    .input(z.object({ pathway: z.string().max(100) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { completedSteps: [] as number[], sessionStarted: false };
      const { pathwayProgress } = await import("../drizzle/schema");
      const rows = await db.select().from(pathwayProgress)
        .where(and(eq(pathwayProgress.userId, ctx.user.id), eq(pathwayProgress.pathway, input.pathway)))
        .limit(1);
      if (!rows.length) return { completedSteps: [] as number[], sessionStarted: false };
      return { completedSteps: rows[0].completedSteps as number[], sessionStarted: rows[0].sessionStarted };
    }),

  saveProgress: protectedProcedure
    .input(z.object({ pathway: z.string().max(100), completedSteps: z.array(z.number()), sessionStarted: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { pathwayProgress } = await import("../drizzle/schema");
      await db.insert(pathwayProgress)
        .values({
          userId: ctx.user.id,
          pathway: input.pathway,
          completedSteps: input.completedSteps,
          sessionStarted: input.sessionStarted ?? false,
        })
        .onDuplicateKeyUpdate({
          set: {
            completedSteps: input.completedSteps,
            sessionStarted: input.sessionStarted ?? false,
          },
        });
      return { success: true };
    }),
});

// ─── Resources Router ─────────────────────────────────────────────────────────
const resourcesRouter = router({
  list: publicProcedure
    .input(z.object({
      module: z.string().optional(),
      type: z.string().optional(),
      pathway: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(resources)
        .where(eq(resources.requiredTier, "free"))
        .orderBy(resources.sortOrder, desc(resources.createdAt))
        .limit(50);
    }),
});

// ─── Courses Router ───────────────────────────────────────────────────────────
const coursesRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(courses)
      .where(eq(courses.isPublished, true))
      .orderBy(courses.sortOrder, desc(courses.createdAt));
  }),

  get: publicProcedure
    .input(z.object({ slug: z.string().max(100) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const results = await db.select().from(courses)
        .where(and(eq(courses.slug, input.slug), eq(courses.isPublished, true)));
      return results[0] ?? null;
    }),

  enroll: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const existing = await db.select().from(enrollments)
        .where(and(eq(enrollments.userId, ctx.user.id), eq(enrollments.courseId, input.courseId)));
      if (existing.length > 0) return { alreadyEnrolled: true };
      await db.insert(enrollments).values({ userId: ctx.user.id, courseId: input.courseId });
      return { success: true };
    }),

  myEnrollments: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(enrollments)
      .where(eq(enrollments.userId, ctx.user.id))
      .orderBy(desc(enrollments.enrolledAt));
  }),
});

// ─── Products Router ──────────────────────────────────────────────────────────
const productsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(products)
      .where(eq(products.isPublished, true));
  }),
});

// ─── Community Router ─────────────────────────────────────────────────────────
const communityRouter = router({
  posts: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(communityPosts)
        .orderBy(communityPosts.isPinned, desc(communityPosts.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  createPost: protectedProcedure
    .input(z.object({
      title: z.string().optional(),
      content: z.string().min(1),
      category: z.enum(["share", "question", "win", "support", "workshop"]).default("share"),
      pathway: z.string().optional(),
      module: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(communityPosts).values({ userId: ctx.user.id, ...input });
      return { success: true };
    }),

  comments: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(communityComments)
        .where(eq(communityComments.postId, input.postId))
        .orderBy(communityComments.createdAt);
    }),

  addComment: protectedProcedure
    .input(z.object({ postId: z.number(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.transaction(async (tx) => {
        await tx.insert(communityComments).values({ userId: ctx.user.id, ...input });
        await tx.update(communityPosts)
          .set({ commentsCount: sql`commentsCount + 1` })
          .where(eq(communityPosts.id, input.postId));
      });
      return { success: true };
    }),

  like: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.transaction(async (tx) => {
        await tx.insert(communityLikes).values({ userId: ctx.user.id, postId: input.postId });
        await tx.update(communityPosts)
          .set({ likesCount: sql`likesCount + 1` })
          .where(eq(communityPosts.id, input.postId));
      });
      return { success: true };
    }),
});

// ─── User Profile Router ──────────────────────────────────────────────────────
const profileRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return ctx.user;
    const results = await db.select().from(users).where(eq(users.id, ctx.user.id));
    return results[0] ?? ctx.user;
  }),

  update: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      bio: z.string().optional(),
      primaryPathway: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(users).set(input).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  saveMindPatterns: protectedProcedure
    .input(z.object({       patterns: z.array(z.string().max(200)).max(20) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(users).set({ mindPatterns: input.patterns }).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  completeOnboarding: protectedProcedure
    .input(z.object({ recommendedPathway: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(users)
        .set({ onboardingCompleted: true, primaryPathway: input.recommendedPathway })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  setLuminEnabled: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(users).set({ luminEnabled: input.enabled }).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  setLowBandwidthMode: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(users).set({ lowBandwidthMode: input.enabled }).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  getIdentitySentence: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select({
      identitySentence: users.identitySentence,
      identitySentenceGeneratedAt: users.identitySentenceGeneratedAt,
    }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    return result[0] ?? null;
  }),

  generateIdentitySentence: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    // Rate-limit: once per 28 days
    const existing = await db.select({
      identitySentenceGeneratedAt: users.identitySentenceGeneratedAt,
    }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const lastGen = existing[0]?.identitySentenceGeneratedAt;
    if (lastGen) {
      const daysSince = (Date.now() - new Date(lastGen).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 28) throw new Error(`Identity Sentence can be regenerated in ${Math.ceil(28 - daysSince)} days.`);
    }
    // Gather behavior data
    const [journalCount, habitRows, auditRow] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(journalEntries).where(eq(journalEntries.userId, ctx.user.id)),
      db.select({ name: habits.name, streak: habits.streak }).from(habits)
        .where(and(eq(habits.userId, ctx.user.id), eq(habits.isActive, true))).limit(5),
      db.select({ recommendedPathway: auditResults.recommendedPathway, scores: auditResults.scores })
        .from(auditResults).where(eq(auditResults.userId, ctx.user.id))
        .orderBy(desc(auditResults.createdAt)).limit(1),
    ]);
    const jCount = journalCount[0]?.count ?? 0;
    const topHabits = habitRows.map(h => h.name).join(", ") || "no habits yet";
    const pathway = auditRow[0]?.recommendedPathway ?? ctx.user.primaryPathway ?? "general growth";
    const scores = auditRow[0]?.scores as Record<string, number> | null;
    const topDim = scores ? Object.entries(scores).sort(([,a],[,b]) => (b as number)-(a as number))[0]?.[0] ?? "" : "";
    const prompt = `You are writing a one-sentence identity affirmation for a personal growth app user.
Behavior data: ${jCount} journal entries, active habits: ${topHabits}, recommended pathway: ${pathway}${topDim ? `, strongest dimension: ${topDim}` : ""}.
Write a single, personal, present-tense identity sentence (max 20 words) that reflects who this person is becoming. Start with "I am". No quotes, no period.`;
    const llmRes = await invokeLLM({
      messages: [
        { role: "system", content: "You write concise, powerful identity affirmations. Respond with only the sentence." },
        { role: "user", content: prompt },
      ],
    });
    const rawContent = llmRes.choices?.[0]?.message?.content ?? "";
    const sentence = (typeof rawContent === "string" ? rawContent : "").trim().replace(/^["']|["']$/g, "");
    if (!sentence) throw new Error("Failed to generate identity sentence");
    await db.update(users).set({
      identitySentence: sentence,
      identitySentenceGeneratedAt: new Date(),
    }).where(eq(users.id, ctx.user.id));
    return { sentence };
  }),

  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const [
      recentCheckIns,
      activeHabits,
      recentJournals,
      oracleInsightsList,
      activePathways,
    ] = await Promise.all([
      db.select().from(checkIns).where(eq(checkIns.userId, ctx.user.id)).orderBy(desc(checkIns.createdAt)).limit(7),
      db.select().from(habits).where(and(eq(habits.userId, ctx.user.id), eq(habits.isActive, true))).limit(5),
      db.select().from(journalEntries).where(eq(journalEntries.userId, ctx.user.id)).orderBy(desc(journalEntries.createdAt)).limit(3),
      db.select().from(oracleInsights).where(and(eq(oracleInsights.userId, ctx.user.id), eq(oracleInsights.isRead, false))).limit(3),
      db.select().from(userPathways).where(and(eq(userPathways.userId, ctx.user.id), eq(userPathways.status, "active"))).limit(3),
    ]);
    return { recentCheckIns, activeHabits, recentJournals, oracleInsightsList, activePathways };
  }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    // H3: Project minimal fields only — never expose role, paypalSubscriptionId, openId on the wire
    me: publicProcedure.query(opts => {
      const u = opts.ctx.user;
      if (!u) return null;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        primaryPathway: u.primaryPathway,
        onboardingCompleted: u.onboardingCompleted,
        membershipTier: u.membershipTier,
        role: u.role,
        foundingMember: u.foundingMember,
        foundingTier: u.foundingTier,
        foundingRateLocked: u.foundingRateLocked,
        needsIntro: u.needsIntro,
        luminEnabled: u.luminEnabled,
        billingStatus: u.billingStatus,
        betaEndDate: u.betaEndDate,
        mindPatterns: u.mindPatterns,
        lowBandwidthMode: u.lowBandwidthMode,
      };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  audit: auditRouter,
  checkIn: checkInRouter,
  journal: journalRouter,
  habits: habitsRouter,
  beliefs: beliefsRouter,
  decisions: decisionsRouter,
  energy: energyRouter,
  oracle: oracleRouter,
  pathways: pathwaysRouter,
  resources: resourcesRouter,
  courses: coursesRouter,
  products: productsRouter,
  store: storeRouter,
  community: communityRouter,
  profile: profileRouter,
  btw: btwRouter,
  paypalOrders: paypalOrdersRouter,
  admin: adminRouter,
  referral: referralRouter,
  beta: betaRouter,
  character: characterRouter,
  moodLog: moodLogRouter,
  applications: applicationsRouter,
  support: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(120),
        email: z.string().email().max(255),
        message: z.string().min(1).max(2000),
      }))
      .mutation(async ({ input }) => {
        await notifyOwner({
          title: `Support request from ${input.name}`,
          content: `**From:** ${input.name} <${input.email}>\n\n${input.message}`,
        });
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
