/**
 * Reading Bridge router
 * Connects Lifewoven to "Build a Life That Does Not Break You" by DeWayne Woods.
 * Stores the user's current chapter and exposes it to Oracle + Dashboard.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";

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

// ─── Router ───────────────────────────────────────────────────────────────────
export const readingBridgeRouter = router({
  /**
   * Returns the user's current reading chapter, derived section, and dismissed flag.
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
    return { chapter, section, isFinished, dismissed };
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
      return { chapter: input.chapterId, section };
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
});
