/**
 * Legacy mood-log compatibility router. New member-facing rhythm views are based
 * on Daily Check-ins and do not claim to predict emotional cycles.
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { moodLogs } from "../../drizzle/schema";
import { and, eq, gte, asc } from "drizzle-orm";

// ─── DB helper ────────────────────────────────────────────────────────────────

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db;
}

// ─── Cycle detection helpers ──────────────────────────────────────────────────

/** Detect peaks (local maxima) in a score series. */
function detectPeaks(scores: number[]): number[] {
  const peaks: number[] = [];
  for (let i = 1; i < scores.length - 1; i++) {
    if (scores[i] > scores[i - 1] && scores[i] > scores[i + 1]) peaks.push(i);
  }
  return peaks;
}

/** Detect troughs (local minima) in a score series. */
function detectTroughs(scores: number[]): number[] {
  const troughs: number[] = [];
  for (let i = 1; i < scores.length - 1; i++) {
    if (scores[i] < scores[i - 1] && scores[i] < scores[i + 1]) troughs.push(i);
  }
  return troughs;
}

/** Average gap between consecutive indices. */
function avgGap(indices: number[]): number | null {
  if (indices.length < 2) return null;
  const gaps: number[] = [];
  for (let i = 1; i < indices.length; i++) gaps.push(indices[i] - indices[i - 1]);
  return gaps.reduce((a, b) => a + b, 0) / gaps.length;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const moodLogRouter = router({
  /**
   * Log or update a mood score for a given date (upsert by userId + logDate).
   */
  logMood: protectedProcedure
    .input(z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
      score: z.number().int().min(1).max(10),
      note: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const userId = ctx.user.id;

      const existing = await db.select().from(moodLogs)
        .where(and(eq(moodLogs.userId, userId), eq(moodLogs.logDate, input.date)))
        .limit(1);

      if (existing.length > 0) {
        await db.update(moodLogs)
          .set({ score: input.score, note: input.note ?? null })
          .where(and(eq(moodLogs.userId, userId), eq(moodLogs.logDate, input.date)));
        return { action: "updated" as const, date: input.date, score: input.score };
      }

      await db.insert(moodLogs).values({
        userId,
        logDate: input.date,
        score: input.score,
        note: input.note ?? null,
      });

      return { action: "created" as const, date: input.date, score: input.score };
    }),

  /** Get mood history for the last N days (default 90, max 365). */
  getMoodHistory: protectedProcedure
    .input(z.object({ days: z.number().int().min(7).max(365).default(90) }))
    .query(async ({ ctx, input }) => {
      const db = await requireDb();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - input.days);
      const cutoffStr = cutoff.toISOString().slice(0, 10);

      const rows = await db.select().from(moodLogs)
        .where(and(eq(moodLogs.userId, ctx.user.id), gte(moodLogs.logDate, cutoffStr)))
        .orderBy(asc(moodLogs.logDate));

      return rows.map(r => ({ id: r.id, date: r.logDate, score: r.score, note: r.note }));
    }),

  /** Get today's mood entry (if any). */
  getTodayMood: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await requireDb();
      const today = new Date().toISOString().slice(0, 10);
      const rows = await db.select().from(moodLogs)
        .where(and(eq(moodLogs.userId, ctx.user.id), eq(moodLogs.logDate, today)))
        .limit(1);
      if (!rows.length) return null;
      const r = rows[0];
      return { date: r.logDate, score: r.score, note: r.note };
    }),

  /**
   * Analyse the user's emotional cycle.
   * Returns cycle length, confidence, current phase, and predicted next high/low.
   */
  getCycleAnalysis: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await requireDb();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 180);
      const cutoffStr = cutoff.toISOString().slice(0, 10);

      const rows = await db.select().from(moodLogs)
        .where(and(eq(moodLogs.userId, ctx.user.id), gte(moodLogs.logDate, cutoffStr)))
        .orderBy(asc(moodLogs.logDate));

      if (rows.length < 14) {
        return {
          cycleLengthDays: null as number | null,
          confidence: "insufficient" as "high" | "medium" | "low" | "insufficient",
          currentPhase: "unknown" as "rising" | "peak" | "falling" | "trough" | "unknown",
          daysUntilNextPeak: null as number | null,
          daysUntilNextTrough: null as number | null,
          peakIndices: [] as number[],
          troughIndices: [] as number[],
          totalEntries: rows.length,
          message: `Keep logging — ${14 - rows.length} more day${14 - rows.length === 1 ? "" : "s"} needed to begin detecting your rhythm.`,
        };
      }

      const scores = rows.map(r => r.score);
      const peaks = detectPeaks(scores);
      const troughs = detectTroughs(scores);

      const peakCycleLen = avgGap(peaks);
      const troughCycleLen = avgGap(troughs);
      const cycleLen = peakCycleLen ?? troughCycleLen;

      let confidence: "high" | "medium" | "low" | "insufficient" = "insufficient";
      if (peaks.length >= 3 || troughs.length >= 3) confidence = "high";
      else if (peaks.length >= 2 || troughs.length >= 2) confidence = "medium";
      else if (peaks.length >= 1 || troughs.length >= 1) confidence = "low";

      // Current phase from last 3 entries
      let currentPhase: "rising" | "peak" | "falling" | "trough" | "unknown" = "unknown";
      if (scores.length >= 3) {
        const [s2, s1, s0] = [scores[scores.length - 3], scores[scores.length - 2], scores[scores.length - 1]];
        if (s0 > s1 && s1 > s2) currentPhase = "rising";
        else if (s0 < s1 && s1 < s2) currentPhase = "falling";
        else if (s0 > s1 && s0 > s2) currentPhase = "peak";
        else if (s0 < s1 && s0 < s2) currentPhase = "trough";
      }

      // Predict next peak/trough
      let daysUntilNextPeak: number | null = null;
      let daysUntilNextTrough: number | null = null;

      if (cycleLen && peaks.length > 0) {
        const nextPeakIdx = Math.round(peaks[peaks.length - 1] + cycleLen);
        const d = nextPeakIdx - (scores.length - 1);
        if (d > 0) daysUntilNextPeak = d;
      }
      if (cycleLen && troughs.length > 0) {
        const nextTroughIdx = Math.round(troughs[troughs.length - 1] + cycleLen);
        const d = nextTroughIdx - (scores.length - 1);
        if (d > 0) daysUntilNextTrough = d;
      }

      let message = "";
      if (cycleLen) {
        message = `Your emotional rhythm cycles approximately every ${Math.round(cycleLen)} days.`;
        if (daysUntilNextPeak !== null)
          message += ` Your next high period is estimated in about ${daysUntilNextPeak} day${daysUntilNextPeak === 1 ? "" : "s"}.`;
        if (daysUntilNextTrough !== null)
          message += ` A lower period may arrive in about ${daysUntilNextTrough} day${daysUntilNextTrough === 1 ? "" : "s"} — prepare, don't react.`;
      } else {
        message = "Keep logging each evening — your rhythm will emerge with more data.";
      }

      return {
        cycleLengthDays: cycleLen ? Math.round(cycleLen) : null,
        confidence,
        currentPhase,
        daysUntilNextPeak,
        daysUntilNextTrough,
        peakIndices: peaks,
        troughIndices: troughs,
        totalEntries: rows.length,
        message,
      };
    }),
});
