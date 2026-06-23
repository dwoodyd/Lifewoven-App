/**
 * dimensions.ts — tRPC router for the 6 Dimensions Life Map.
 *
 * The 6 Dimensions are the Soul Engineer Method's quarterly reflection lens:
 *   Emotional, Physical, Spiritual, Creative, Identity, Purpose.
 *
 * Procedures:
 *  - getAll     → fetch the user's most recent entry per dimension
 *  - saveEntry  → upsert a journal entry for a given dimension
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { dimensionEntries } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

const DIMENSIONS = ["emotional", "physical", "spiritual", "creative", "identity", "purpose"] as const;
type Dimension = typeof DIMENSIONS[number];

export const dimensionsRouter = router({
  /** Fetch the most recent entry for each of the 6 dimensions for the current user. */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { emotional: null, physical: null, spiritual: null, creative: null, identity: null, purpose: null };
    const userId = ctx.user.id;

    const entries = await db
      .select()
      .from(dimensionEntries)
      .where(eq(dimensionEntries.userId, userId))
      .orderBy(desc(dimensionEntries.updatedAt));

    // Return the most recent entry per dimension (or null if none)
    const result: Record<Dimension, { id: number; content: string; becomingQuestion: string | null; updatedAt: Date } | null> = {
      emotional: null,
      physical: null,
      spiritual: null,
      creative: null,
      identity: null,
      purpose: null,
    };

    for (const entry of entries) {
      const dim = entry.dimension as Dimension;
      if (!result[dim]) {
        result[dim] = {
          id: entry.id,
          content: entry.content,
          becomingQuestion: entry.becomingQuestion ?? null,
          updatedAt: entry.updatedAt,
        };
      }
    }

    return result;
  }),

  /** Save (insert) a new journal entry for a dimension. */
  saveEntry: protectedProcedure
    .input(z.object({
      dimension: z.enum(DIMENSIONS),
      content: z.string().min(1).max(10000),
      becomingQuestion: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const userId = ctx.user.id;

      const [inserted] = await db
        .insert(dimensionEntries)
        .values({
          userId,
          dimension: input.dimension,
          content: input.content,
          becomingQuestion: input.becomingQuestion ?? null,
        })
        .$returningId();

      return { id: inserted.id, success: true };
    }),
});
