/**
 * Reading Bridge router
 * Connects Lifewoven to "Build a Life That Does Not Break You" by DeWayne Woods.
 * Stores the user's current chapter, exposes it to Oracle + Dashboard,
 * and manages per-chapter quick notes.
 */
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, readingBridgeNotes } from "../../drizzle/schema";

// ─── Static chapter-to-5S-section mapping ────────────────────────────────────
export const CHAPTER_SECTION_MAP: Record<string, string | null> = {
  "start-here": null,
  "intro":      null,
  "ch-1":       "STATE",
  "ch-2":       "STATE",
  "ch-3":       "STORY",
  "ch-4":       "STORY",
  "ch-5":       "STANDARDS",
  "ch-6":       "STANDARDS",
  "ch-7":       "STRATEGY",
  "ch-8":       "STRATEGY",
  "ch-9":       "STEWARDSHIP",
  "ch-10":      "STEWARDSHIP",
  "ch-11":      "STEWARDSHIP",
  "epilogue":   "STEWARDSHIP",
  "finished":   null, // all sections unlocked
};

// Ordered list used for progress calculation (finished = 100%)
export const CHAPTER_ORDER = [
  "start-here", "intro",
  "ch-1", "ch-2",
  "ch-3", "ch-4",
  "ch-5", "ch-6",
  "ch-7", "ch-8",
  "ch-9", "ch-10", "ch-11", "epilogue",
  "finished",
];

export const CHAPTERS = [
  // Start Here
  { id: "start-here", title: "Start Here: If Life Feels Like It Is Caving In", section: null },
  { id: "intro",      title: "Introduction: A Different Kind of Strength",       section: null },
  // State
  { id: "ch-1",  title: "Chapter 1: Strong But Not Okay",          section: "STATE" },
  { id: "ch-2",  title: "Chapter 2: The Performance Economy",       section: "STATE" },
  // Story
  { id: "ch-3",  title: "Chapter 3: How We Learn to Ignore Ourselves", section: "STORY" },
  { id: "ch-4",  title: "Chapter 4: Burnout Starts Before the Collapse", section: "STORY" },
  // Standards
  { id: "ch-5",  title: "Chapter 5: The Body Has Been Speaking",    section: "STANDARDS" },
  { id: "ch-6",  title: "Chapter 6: Capacity Is Not a Moral Virtue", section: "STANDARDS" },
  // Strategy
  { id: "ch-7",  title: "Chapter 7: Being Needed Is Not Being Known", section: "STRATEGY" },
  { id: "ch-8",  title: "Chapter 8: The Courage to Fit",            section: "STRATEGY" },
  // Stewardship
  { id: "ch-9",  title: "Chapter 9: Rest Is Not the Reward",        section: "STEWARDSHIP" },
  { id: "ch-10", title: "Chapter 10: Building for Decades",         section: "STEWARDSHIP" },
  { id: "ch-11", title: "Chapter 11: What You Are Becoming",        section: "STEWARDSHIP" },
  { id: "epilogue", title: "Epilogue: What Rebuilding Made Possible", section: "STEWARDSHIP" },
  // Finished
  { id: "finished", title: "Finished the book ✓", section: null },
];

/** Returns 0–100 progress percentage based on current chapter position. */
export function calcProgress(chapterId: string | null): number {
  if (!chapterId) return 0;
  if (chapterId === "finished") return 100;
  const idx = CHAPTER_ORDER.indexOf(chapterId);
  if (idx < 0) return 0;
  // idx 0 = first chapter = 1/14 complete (14 content chapters before "finished")
  return Math.round(((idx + 1) / (CHAPTER_ORDER.length - 1)) * 100);
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const readingBridgeRouter = router({
  /**
   * Returns the user's current reading chapter, derived section, dismissed flag,
   * and progress percentage (0–100).
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const [user] = await db!
      .select({ readingChapter: users.readingChapter, readingBridgeDismissed: users.readingBridgeDismissed })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);
    const chapter = user?.readingChapter ?? null;
    const dismissed = user?.readingBridgeDismissed ?? false;
    const section = chapter ? (CHAPTER_SECTION_MAP[chapter] ?? null) : null;
    const isFinished = chapter === "finished";
    const progress = calcProgress(chapter);
    return { chapter, section, isFinished, dismissed, progress };
  }),

  /**
   * Sets the user's current reading chapter.
   * Accepts any valid chapter id from CHAPTER_SECTION_MAP.
   */
  setChapter: protectedProcedure
    .input(z.object({
      chapterId: z.string().refine(id => id in CHAPTER_SECTION_MAP, {
        message: "Invalid chapter id",
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      await db!
        .update(users)
        .set({ readingChapter: input.chapterId })
        .where(eq(users.id, ctx.user.id));
      const section = CHAPTER_SECTION_MAP[input.chapterId] ?? null;
      const progress = calcProgress(input.chapterId);
      return { chapter: input.chapterId, section, progress };
    }),

  /**
   * Permanently dismisses the Reading Bridge prompt ("Not reading it").
   */
  dismiss: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    await db!
      .update(users)
      .set({ readingBridgeDismissed: true })
      .where(eq(users.id, ctx.user.id));
    return { dismissed: true };
  }),

  // ─── Notes ─────────────────────────────────────────────────────────────────

  /**
   * Returns all notes for a given chapter (most recent first).
   */
  getNotes: protectedProcedure
    .input(z.object({ chapterId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const notes = await db!
        .select()
        .from(readingBridgeNotes)
        .where(
          and(
            eq(readingBridgeNotes.userId, ctx.user.id),
            eq(readingBridgeNotes.chapterId, input.chapterId),
          )
        )
        .orderBy(desc(readingBridgeNotes.createdAt));
      return notes;
    }),

  /**
   * Adds a quick note to a chapter.
   */
  addNote: protectedProcedure
    .input(z.object({
      chapterId: z.string().refine(id => id in CHAPTER_SECTION_MAP, { message: "Invalid chapter id" }),
      content:   z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      await db!.insert(readingBridgeNotes).values({
        userId:    ctx.user.id,
        chapterId: input.chapterId,
        content:   input.content,
      });
      return { success: true };
    }),

  /**
   * Deletes a note (must belong to the requesting user).
   */
  deleteNote: protectedProcedure
    .input(z.object({ noteId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      await db!
        .delete(readingBridgeNotes)
        .where(
          and(
            eq(readingBridgeNotes.id, input.noteId),
            eq(readingBridgeNotes.userId, ctx.user.id),
          )
        );
      return { success: true };
    }),

  /**
   * Returns a summary of notes across all chapters (for the sidebar/overview).
   * Returns { chapterId, count }[] sorted by chapter order.
   */
  getNoteSummary: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const rows = await db!
      .select({ chapterId: readingBridgeNotes.chapterId })
      .from(readingBridgeNotes)
      .where(eq(readingBridgeNotes.userId, ctx.user.id));
    const counts: Record<string, number> = {};
    for (const r of rows) {
      counts[r.chapterId] = (counts[r.chapterId] ?? 0) + 1;
    }
    return counts;
  }),
});
