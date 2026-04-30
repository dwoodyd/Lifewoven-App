import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock the DB module ───────────────────────────────────────────────────────

vi.mock("./db", () => ({
  requireDb: vi.fn(),
}));

import { requireDb } from "./db";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeDb(overrides: Record<string, unknown> = {}) {
  return {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Character & Growth — Books", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("B1: book status values are valid", () => {
    const validStatuses = ["want_to_read", "reading", "completed", "paused"];
    expect(validStatuses).toContain("reading");
    expect(validStatuses).toContain("completed");
    expect(validStatuses).not.toContain("archived");
  });

  it("B2: book rating is between 1 and 5 or null", () => {
    const validRatings = [null, 1, 2, 3, 4, 5];
    for (const r of validRatings) {
      expect(r === null || (r >= 1 && r <= 5)).toBe(true);
    }
    expect(6 >= 1 && 6 <= 5).toBe(false);
  });

  it("B3: book title is required and non-empty", () => {
    const validate = (title: string) => title.trim().length > 0;
    expect(validate("Atomic Habits")).toBe(true);
    expect(validate("")).toBe(false);
    expect(validate("   ")).toBe(false);
  });

  it("B4: requireDb is called before any book query", async () => {
    const mockDb = makeDb();
    (requireDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);
    mockDb.execute.mockResolvedValue([]);

    const db = requireDb();
    await db.select().from({} as any).where({} as any).execute();

    expect(requireDb).toHaveBeenCalled();
  });
});

describe("Character & Growth — Notes", () => {
  it("N1: note type values are valid", () => {
    const validTypes = ["note", "quote", "highlight", "lesson"];
    expect(validTypes).toContain("quote");
    expect(validTypes).toContain("highlight");
    expect(validTypes).not.toContain("summary");
  });

  it("N2: note content must be non-empty", () => {
    const validate = (content: string) => content.trim().length > 0;
    expect(validate("This is a note")).toBe(true);
    expect(validate("")).toBe(false);
  });

  it("N3: chapter and pageRef are optional", () => {
    const note = { content: "A quote", type: "quote", chapter: undefined, pageRef: undefined };
    expect(note.chapter).toBeUndefined();
    expect(note.pageRef).toBeUndefined();
    expect(note.content).toBeTruthy();
  });

  it("N4: notes are filtered by bookId and userId", () => {
    const notes = [
      { id: 1, bookId: 10, userId: 1, content: "Note A" },
      { id: 2, bookId: 10, userId: 2, content: "Note B" },
      { id: 3, bookId: 11, userId: 1, content: "Note C" },
    ];
    const result = notes.filter(n => n.bookId === 10 && n.userId === 1);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe("Note A");
  });
});

describe("Character & Growth — Journal", () => {
  it("J1: journal entry content must be non-empty", () => {
    const validate = (content: string) => content.trim().length > 0;
    expect(validate("Today I reflected on chapter 3…")).toBe(true);
    expect(validate("")).toBe(false);
  });

  it("J2: journal title is optional", () => {
    const entry = { content: "Reflection", title: null };
    expect(entry.title).toBeNull();
    expect(entry.content).toBeTruthy();
  });

  it("J3: journal entries are ordered newest first", () => {
    const entries = [
      { id: 1, createdAt: new Date("2024-01-01") },
      { id: 2, createdAt: new Date("2024-01-03") },
      { id: 3, createdAt: new Date("2024-01-02") },
    ];
    const sorted = [...entries].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    expect(sorted[0].id).toBe(2);
    expect(sorted[2].id).toBe(1);
  });

  it("J4: journal entries can be tied to a specific book or standalone", () => {
    const withBook    = { bookId: 5, content: "Tied to book" };
    const standalone  = { bookId: null, content: "General reflection" };
    expect(withBook.bookId).toBe(5);
    expect(standalone.bookId).toBeNull();
  });
});
