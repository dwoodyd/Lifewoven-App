import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { firstHonestWeekEntries } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

// ─── Day Prompts (verbatim from Soul Engineer brief) ─────────────────────────
export const DAY_PROMPTS: Record<number, { prompt: string; subPrompt: string; completionMessage: string }> = {
  1: {
    prompt: "What are you actually working on right now?",
    subPrompt: "Not what you wish you were working on. Not what you tell people. What is actually consuming your attention, your energy, your worry?",
    completionMessage: "You named it. That's the first honest act.",
  },
  2: {
    prompt: "What have you been avoiding?",
    subPrompt: "The conversation you keep postponing. The decision you keep deferring. The thing you open and close without doing. Name it.",
    completionMessage: "Naming avoidance is not weakness. It's the beginning of motion.",
  },
  3: {
    prompt: "What do you actually believe about yourself right now?",
    subPrompt: "Not the affirmations. Not the aspirational self-talk. What is the quiet story you carry about who you are and what you deserve?",
    completionMessage: "You looked at the story. That's rarer than you think.",
  },
  4: {
    prompt: "What would you do if you weren't afraid of failing?",
    subPrompt: "Don't answer quickly. Sit with it. What is the thing that keeps not happening because you're protecting yourself from something?",
    completionMessage: "The answer you just wrote is a map. Keep it.",
  },
  5: {
    prompt: "Who are you becoming?",
    subPrompt: "Not who you want to be in some distant future. Based on your actual choices this week — your habits, your attention, your words — who is the person you are in the process of becoming?",
    completionMessage: "You can only change what you can see. You're seeing it now.",
  },
  6: {
    prompt: "What are you grateful for that you've never said out loud?",
    subPrompt: "Not the obvious things. The quiet ones. The things that have held you that you've never fully acknowledged.",
    completionMessage: "Gratitude that is spoken becomes a foundation. You just laid one.",
  },
  7: {
    prompt: "What do you want your life to mean?",
    subPrompt: "Not what you want to accomplish. Not what you want people to say at your funeral. What do you want the texture of your days to be? What do you want to have stood for?",
    completionMessage: "You've done the week. This last answer — return to it. It knows something.",
  },
};

export const firstHonestWeekRouter = router({
  // Returns the user's progress: completed days and all entries
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { entries: [], completedDays: [], currentDay: 1, isComplete: false };

    const entries = await db
      .select()
      .from(firstHonestWeekEntries)
      .where(eq(firstHonestWeekEntries.userId, ctx.user.id))
      .orderBy(firstHonestWeekEntries.dayNumber);

    const completedDays = entries.map((e) => e.dayNumber);
    const nextDay = completedDays.length === 0 ? 1 : Math.max(...completedDays) + 1;
    const currentDay = Math.min(nextDay, 7);
    const isComplete = completedDays.length >= 7;

    return {
      entries: entries.map((e) => ({
        id: e.id,
        dayNumber: e.dayNumber,
        response: e.response,
        completedAt: e.completedAt,
        prompt: DAY_PROMPTS[e.dayNumber]?.prompt ?? "",
      })),
      completedDays,
      currentDay,
      isComplete,
    };
  }),

  // Submits a response for a given day
  submitDay: protectedProcedure
    .input(
      z.object({
        dayNumber: z.number().int().min(1).max(7),
        response: z.string().min(10, "Please write at least a few words.").max(10000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Prevent duplicate submissions for the same day
      const existing = await db
        .select({ id: firstHonestWeekEntries.id })
        .from(firstHonestWeekEntries)
        .where(
          and(
            eq(firstHonestWeekEntries.userId, ctx.user.id),
            eq(firstHonestWeekEntries.dayNumber, input.dayNumber)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new Error(`Day ${input.dayNumber} has already been submitted.`);
      }

      await db.insert(firstHonestWeekEntries).values({
        userId: ctx.user.id,
        dayNumber: input.dayNumber,
        response: input.response,
      });

      const dayData = DAY_PROMPTS[input.dayNumber];
      return {
        completionMessage: dayData?.completionMessage ?? "Entry saved.",
        isLastDay: input.dayNumber === 7,
      };
    }),

  // Resets the entire week (allows starting over)
  reset: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    await db
      .delete(firstHonestWeekEntries)
      .where(eq(firstHonestWeekEntries.userId, ctx.user.id));

    return { success: true };
  }),
});
