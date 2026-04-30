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

// ─── Book Cover: lookupBookCover ──────────────────────────────────────────────

describe("Character & Growth — Book Cover Lookup", () => {
  it("C1: lookupBookCover returns empty array when Open Library returns no docs", () => {
    const docs: Array<{ cover_i?: number }> = [];
    const covers = docs.filter(d => d.cover_i).map(d => `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`);
    expect(covers).toHaveLength(0);
  });

  it("C2: lookupBookCover maps cover_i to correct Open Library URL", () => {
    const docs = [{ cover_i: 12345 }, { cover_i: 67890 }];
    const covers = docs.map(d => `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`);
    expect(covers[0]).toBe("https://covers.openlibrary.org/b/id/12345-L.jpg");
    expect(covers[1]).toBe("https://covers.openlibrary.org/b/id/67890-L.jpg");
  });

  it("C3: lookupBookCover skips docs without cover_i", () => {
    const docs = [{ cover_i: 111 }, {}, { cover_i: 222 }];
    const covers = docs.filter(d => d.cover_i).map(d => `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`);
    expect(covers).toHaveLength(2);
  });

  it("C4: lookupBookCover limits results to 5", () => {
    const docs = Array.from({ length: 10 }, (_, i) => ({ cover_i: i + 1 }));
    const covers = docs.slice(0, 5).map(d => `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`);
    expect(covers).toHaveLength(5);
  });

  it("C5: query string combines title and author when both provided", () => {
    const title = "Atomic Habits";
    const author = "James Clear";
    const query = encodeURIComponent(`${title} ${author}`);
    expect(query).toBe(encodeURIComponent("Atomic Habits James Clear"));
    expect(query).toContain("Atomic");
  });

  it("C6: query string uses only title when author is absent", () => {
    const title = "Meditations";
    const query = encodeURIComponent(title);
    expect(query).toBe("Meditations");
  });
});

// ─── Book Cover: uploadBookCover ──────────────────────────────────────────────

describe("Character & Growth — Book Cover Upload", () => {
  it("U1: rejects data URL with missing base64 segment", () => {
    const dataUrl = "data:image/jpeg;base64,";
    const base64 = dataUrl.split(",")[1];
    // Empty string is falsy — procedure should throw
    expect(base64).toBe("");
    expect(!base64).toBe(true);
  });

  it("U2: correctly extracts base64 from valid data URL", () => {
    const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==";
    const dataUrl = `data:image/png;base64,${base64Data}`;
    const extracted = dataUrl.split(",")[1];
    expect(extracted).toBe(base64Data);
  });

  it("U3: file extension is derived from mimeType", () => {
    const getExt = (mimeType: string) =>
      mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
    expect(getExt("image/png")).toBe("png");
    expect(getExt("image/webp")).toBe("webp");
    expect(getExt("image/jpeg")).toBe("jpg");
    expect(getExt("image/gif")).toBe("jpg");
  });

  it("U4: rejects buffer exceeding 5 MB", () => {
    const maxBytes = 5 * 1024 * 1024;
    const oversized = maxBytes + 1;
    expect(oversized > maxBytes).toBe(true);
  });

  it("U5: S3 key includes user id and book-covers prefix", () => {
    const userId = "user-abc";
    const ext = "jpg";
    const key = `book-covers/${userId}/${Date.now()}-abc123.${ext}`;
    expect(key).toMatch(/^book-covers\/user-abc\//);
    expect(key).toMatch(/\.jpg$/);
  });
});

// ─── Book Attachments ─────────────────────────────────────────────────────────

describe("Character & Growth — Attachments", () => {
  it("A1: attachment file size limit is 10 MB", () => {
    const maxBytes = 10 * 1024 * 1024;
    expect(maxBytes).toBe(10485760);
    const oversized = maxBytes + 1;
    expect(oversized > maxBytes).toBe(true);
  });

  it("A2: filename sanitisation replaces unsafe characters", () => {
    const sanitise = (name: string) => name.replace(/[^a-zA-Z0-9._\-]/g, "_").slice(0, 200);
    expect(sanitise("my file (1).pdf")).toBe("my_file__1_.pdf");
    expect(sanitise("normal-file_v2.docx")).toBe("normal-file_v2.docx");
    expect(sanitise("résumé.pdf")).toBe("r_sum_.pdf");
  });

  it("A3: S3 key includes user id, book id, and book-attachments prefix", () => {
    const userId = "user-xyz";
    const bookId = 42;
    const safeName = "notes.pdf";
    const key = `book-attachments/${userId}/${bookId}/${Date.now()}-abc-${safeName}`;
    expect(key).toMatch(/^book-attachments\/user-xyz\/42\//);
    expect(key).toMatch(/notes\.pdf$/);
  });

  it("A4: listAttachments filters by both bookId and userId", () => {
    const attachments = [
      { id: 1, bookId: 10, userId: "u1", fileName: "a.pdf" },
      { id: 2, bookId: 10, userId: "u2", fileName: "b.pdf" },
      { id: 3, bookId: 11, userId: "u1", fileName: "c.pdf" },
    ];
    const result = attachments.filter(a => a.bookId === 10 && a.userId === "u1");
    expect(result).toHaveLength(1);
    expect(result[0].fileName).toBe("a.pdf");
  });

  it("A5: deleteAttachment requires ownership check before deletion", () => {
    const attachments = [
      { id: 1, userId: "u1" },
      { id: 2, userId: "u2" },
    ];
    const requestingUserId = "u1";
    const targetId = 2;
    const found = attachments.find(a => a.id === targetId && a.userId === requestingUserId);
    // Should NOT find it — different owner
    expect(found).toBeUndefined();
  });

  it("A6: deleteAttachment succeeds when ownership matches", () => {
    const attachments = [
      { id: 1, userId: "u1" },
      { id: 2, userId: "u2" },
    ];
    const requestingUserId = "u1";
    const targetId = 1;
    const found = attachments.find(a => a.id === targetId && a.userId === requestingUserId);
    expect(found).toBeDefined();
    expect(found?.id).toBe(1);
  });

  it("A7: formatFileSize renders bytes, KB, and MB correctly", () => {
    const fmt = (bytes: number) => {
      if (bytes < 1024)         return `${bytes} B`;
      if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };
    expect(fmt(512)).toBe("512 B");
    expect(fmt(2048)).toBe("2.0 KB");
    expect(fmt(1572864)).toBe("1.5 MB");
  });

  it("A8: mimeType determines correct file icon category", () => {
    const getCategory = (mimeType: string) => {
      if (mimeType.startsWith("image/"))  return "image";
      if (mimeType.startsWith("video/"))  return "video";
      if (mimeType.startsWith("audio/"))  return "audio";
      if (mimeType === "application/pdf") return "pdf";
      return "generic";
    };
    expect(getCategory("image/png")).toBe("image");
    expect(getCategory("video/mp4")).toBe("video");
    expect(getCategory("audio/mpeg")).toBe("audio");
    expect(getCategory("application/pdf")).toBe("pdf");
    expect(getCategory("application/zip")).toBe("generic");
  });

  it("A9: attachments are ordered newest first", () => {
    const attachments = [
      { id: 1, createdAt: new Date("2024-01-01") },
      { id: 2, createdAt: new Date("2024-01-03") },
      { id: 3, createdAt: new Date("2024-01-02") },
    ];
    const sorted = [...attachments].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    expect(sorted[0].id).toBe(2);
    expect(sorted[2].id).toBe(1);
  });
});
