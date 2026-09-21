import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveStorageAccess } from "./_core/storageProxy";
import { getTrustedCheckoutOrigin } from "./routers/store";

const root = resolve(process.cwd());
const source = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

describe("tenant isolation security regressions", () => {
  it("fails closed for unknown storage paths and accepts only explicit public or owner paths", () => {
    expect(resolveStorageAccess("lifewoven-original-mark_811eea16.png")).toEqual({ kind: "public" });
    expect(resolveStorageAccess("private/products/8/course.pdf")).toEqual({ kind: "deny" });
    expect(resolveStorageAccess("generated/171234.png")).toEqual({ kind: "deny" });
    expect(resolveStorageAccess("voice/42/recording.webm")).toEqual({ kind: "private", ownerId: 42 });
    expect(resolveStorageAccess("voice/42anything/recording.webm")).toEqual({ kind: "deny" });
    expect(resolveStorageAccess("voice/42")).toEqual({ kind: "deny" });
    expect(resolveStorageAccess("book-attachments/42/9/notes.pdf")).toEqual({ kind: "private", ownerId: 42 });
    expect(resolveStorageAccess("book-covers/42/../other.png")).toEqual({ kind: "deny" });
  });

  it("validates a Library session owner and resource before reading or writing chat history", () => {
    const library = source("server/routers/library.ts");
    expect(library).toContain("eq(librarySessions.id, input.sessionId)");
    expect(library).toContain("eq(librarySessions.userId, userId)");
    expect(library).toContain("eq(librarySessions.resourceId, input.resourceId)");
    expect(library).toContain("if (!session) throw new TRPCError({ code: \"NOT_FOUND\" })");
    expect(library).toContain("eq(libraryMessages.userId, userId)");
    expect(library).toContain("eq(libraryMessages.resourceId, input.resourceId)");
    expect(library).toContain("sessionId: session.id");
  });

  it("rejects an unowned Oracle conversation before model work and scopes the update", () => {
    const routers = source("server/routers.ts");
    const oracleStart = routers.indexOf("const oracleRouter = router({");
    const oracle = routers.slice(oracleStart, routers.indexOf("insights: protectedProcedure", oracleStart));
    expect(oracle).toContain("if (!conversation) throw new TRPCError({ code: \"NOT_FOUND\" })");
    expect(oracle).toContain("eq(oracleConversations.id, input.conversationId)");
    expect(oracle).toContain("eq(oracleConversations.userId, ctx.user.id)");
    expect(oracle.indexOf("if (!conversation)")).toBeLessThan(oracle.indexOf("invokeMeteredLLM({"));
  });

  it("requires a caller-owned parent book before creating notes, journal entries, or attachments", () => {
    const character = source("server/routers/character.ts");
    expect(character).toContain("where(and(eq(books.id, input.bookId), eq(books.userId, ctx.user.id)))");
    expect(character).toContain("if (!book) throw new TRPCError({ code: \"NOT_FOUND\" })");
    expect(character).toContain("const db = await requireDb();\n      const [book] = await db");
  });

  it("limits credentialed production CORS to explicit Lifewoven origins", () => {
    const index = source("server/_core/index.ts");
    expect(index).toContain('"https://app.lifewoven.click"');
    expect(index).toContain("const productionOrigins = new Set");
    expect(index).not.toContain("/^https:\\/\\/([a-z0-9-]+\\.)?lifewoven\\.click$/");
    expect(index).not.toContain("/\\.manus\\.space$/");
  });

  it("uses only trusted Lifewoven origins for hosted checkout returns", () => {
    expect(getTrustedCheckoutOrigin("https://app.lifewoven.click")).toBe("https://app.lifewoven.click");
    expect(() => getTrustedCheckoutOrigin("https://checkout.example")).toThrow("Unsupported checkout return origin.");
  });

  it("schema-validates raw PayPal order bodies and keeps identity server-derived", () => {
    const paypal = source("server/paypal/paypal.ts");
    const button = source("client/src/components/PayPalButton.tsx");
    expect(paypal).toContain("createOrderInputSchema.safeParse(req.body)");
    expect(paypal).toContain("captureOrderInputSchema.safeParse(req.body)");
    expect(paypal).toContain("Invalid order request");
    expect(paypal).toContain("Invalid capture request");
    expect(button).toContain("JSON.stringify({ productSlug, useCredit: true })");
    expect(button).not.toContain("userId: user?.id");
  });
});
