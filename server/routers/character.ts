import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { books, bookNotes, characterJournal } from "../../drizzle/schema";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db;
}

const bookStatusEnum = z.enum(["want_to_read", "reading", "completed", "paused"]);

export const characterRouter = router({
  // ── Books ──────────────────────────────────────────────────────────────────

  listBooks: protectedProcedure
    .input(z.object({ status: bookStatusEnum.optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await requireDb();
      const conditions: ReturnType<typeof eq>[] = [eq(books.userId, ctx.user.id)];
      if (input?.status) conditions.push(eq(books.status, input.status));
      return db.select().from(books).where(and(...conditions)).orderBy(desc(books.updatedAt));
    }),

  getBook: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await requireDb();
      const [book] = await db
        .select()
        .from(books)
        .where(and(eq(books.id, input.id), eq(books.userId, ctx.user.id)));
      return book ?? null;
    }),

  addBook: protectedProcedure
    .input(z.object({
      title:    z.string().min(1).max(255),
      author:   z.string().max(255).optional(),
      coverUrl: z.string().url().max(2048).optional(),
      category: z.string().max(64).optional(),
      status:   bookStatusEnum.optional().default("want_to_read"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [result] = await db.insert(books).values({
        userId:   ctx.user.id,
        title:    input.title,
        author:   input.author ?? null,
        coverUrl: input.coverUrl ?? null,
        category: input.category ?? null,
        status:   input.status,
      });
      return { id: (result as any).insertId as number };
    }),

  updateBook: protectedProcedure
    .input(z.object({
      id:         z.number().int().positive(),
      title:      z.string().min(1).max(255).optional(),
      author:     z.string().max(255).optional(),
      coverUrl:   z.string().url().max(2048).optional().nullable(),
      category:   z.string().max(64).optional(),
      status:     bookStatusEnum.optional(),
      rating:     z.number().int().min(1).max(5).optional().nullable(),
      startedAt:  z.string().datetime().optional().nullable(),
      finishedAt: z.string().datetime().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const { id, ...fields } = input;
      const update: Record<string, unknown> = {};
      if (fields.title      !== undefined) update.title      = fields.title;
      if (fields.author     !== undefined) update.author     = fields.author;
      if (fields.coverUrl   !== undefined) update.coverUrl   = fields.coverUrl;
      if (fields.category   !== undefined) update.category   = fields.category;
      if (fields.status     !== undefined) update.status     = fields.status;
      if (fields.rating     !== undefined) update.rating     = fields.rating;
      if (fields.startedAt  !== undefined) update.startedAt  = fields.startedAt ? new Date(fields.startedAt) : null;
      if (fields.finishedAt !== undefined) update.finishedAt = fields.finishedAt ? new Date(fields.finishedAt) : null;
      await db.update(books).set(update).where(and(eq(books.id, id), eq(books.userId, ctx.user.id)));
      return { success: true } as const;
    }),

  deleteBook: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.transaction(async (tx) => {
        await tx.delete(bookNotes).where(and(eq(bookNotes.bookId, input.id), eq(bookNotes.userId, ctx.user.id)));
        await tx.delete(characterJournal).where(and(eq(characterJournal.bookId, input.id), eq(characterJournal.userId, ctx.user.id)));
        await tx.delete(books).where(and(eq(books.id, input.id), eq(books.userId, ctx.user.id)));
      });
      return { success: true } as const;
    }),

  // ── Book Notes / Quotes / Highlights ──────────────────────────────────────

  listNotes: protectedProcedure
    .input(z.object({
      bookId: z.number().int().positive(),
      type:   z.enum(["note", "quote", "highlight", "lesson"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await requireDb();
      const conditions: ReturnType<typeof eq>[] = [
        eq(bookNotes.bookId, input.bookId),
        eq(bookNotes.userId, ctx.user.id),
      ];
      if (input.type) conditions.push(eq(bookNotes.type, input.type));
      return db.select().from(bookNotes).where(and(...conditions)).orderBy(desc(bookNotes.createdAt));
    }),

  addNote: protectedProcedure
    .input(z.object({
      bookId:  z.number().int().positive(),
      type:    z.enum(["note", "quote", "highlight", "lesson"]).default("note"),
      content: z.string().min(1).max(10000),
      chapter: z.string().max(128).optional(),
      pageRef: z.string().max(32).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [result] = await db.insert(bookNotes).values({
        bookId:  input.bookId,
        userId:  ctx.user.id,
        type:    input.type,
        content: input.content,
        chapter: input.chapter ?? null,
        pageRef: input.pageRef ?? null,
      });
      return { id: (result as any).insertId as number };
    }),

  updateNote: protectedProcedure
    .input(z.object({
      id:      z.number().int().positive(),
      content: z.string().min(1).max(10000).optional(),
      chapter: z.string().max(128).optional().nullable(),
      pageRef: z.string().max(32).optional().nullable(),
      type:    z.enum(["note", "quote", "highlight", "lesson"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const { id, ...fields } = input;
      const update: Record<string, unknown> = {};
      if (fields.content !== undefined) update.content = fields.content;
      if (fields.chapter !== undefined) update.chapter = fields.chapter;
      if (fields.pageRef !== undefined) update.pageRef = fields.pageRef;
      if (fields.type    !== undefined) update.type    = fields.type;
      await db.update(bookNotes).set(update).where(and(eq(bookNotes.id, id), eq(bookNotes.userId, ctx.user.id)));
      return { success: true } as const;
    }),

  deleteNote: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.delete(bookNotes).where(and(eq(bookNotes.id, input.id), eq(bookNotes.userId, ctx.user.id)));
      return { success: true } as const;
    }),

  // ── Character Journal ──────────────────────────────────────────────────────

  listJournal: protectedProcedure
    .input(z.object({ bookId: z.number().int().positive().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await requireDb();
      const conditions: ReturnType<typeof eq>[] = [eq(characterJournal.userId, ctx.user.id)];
      if (input?.bookId) conditions.push(eq(characterJournal.bookId, input.bookId));
      return db.select().from(characterJournal).where(and(...conditions)).orderBy(desc(characterJournal.createdAt));
    }),

  addJournalEntry: protectedProcedure
    .input(z.object({
      bookId:  z.number().int().positive().optional(),
      title:   z.string().max(255).optional(),
      content: z.string().min(1).max(10000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [result] = await db.insert(characterJournal).values({
        userId:  ctx.user.id,
        bookId:  input.bookId ?? null,
        title:   input.title ?? null,
        content: input.content,
      });
      return { id: (result as any).insertId as number };
    }),

  updateJournalEntry: protectedProcedure
    .input(z.object({
      id:      z.number().int().positive(),
      title:   z.string().max(255).optional().nullable(),
      content: z.string().min(1).max(10000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const { id, ...fields } = input;
      const update: Record<string, unknown> = {};
      if (fields.title   !== undefined) update.title   = fields.title;
      if (fields.content !== undefined) update.content = fields.content;
      await db.update(characterJournal).set(update).where(and(eq(characterJournal.id, id), eq(characterJournal.userId, ctx.user.id)));
      return { success: true } as const;
    }),

  deleteJournalEntry: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.delete(characterJournal).where(and(eq(characterJournal.id, input.id), eq(characterJournal.userId, ctx.user.id)));
      return { success: true } as const;
    }),
});
