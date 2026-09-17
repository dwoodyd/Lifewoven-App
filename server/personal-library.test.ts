import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const source = (relative: string) => readFileSync(resolve(root, relative), "utf8");

describe("Personal Library lifecycle", () => {
  it("starts a selected resource chat session from an effect, not render initialization", () => {
    const library = source("client/src/pages/MyLibrary.tsx");

    expect(library).toContain('import { useEffect, useMemo, useState } from "react"');
    expect(library).toContain("useEffect(() => {\n    getOrCreateSession.mutate({ resourceId });");
    expect(library).not.toContain("useState(() => {\n    getOrCreateSession.mutate({ resourceId });");
  });

  it("keeps the server session owner-scoped", () => {
    const router = source("server/routers/library.ts");

    expect(router).toContain("eq(librarySessions.resourceId, input.resourceId), eq(librarySessions.userId, userId)");
    expect(router).toContain("eq(librarySessions.id, input.sessionId), eq(librarySessions.userId, userId)");
  });

  it("offers stable pathway filtering and an accessible list-or-grid view", () => {
    const library = source("client/src/pages/MyLibrary.tsx");

    expect(library).toContain('const [pathwayFilter, setPathwayFilter] = useState("all")');
    expect(library).toContain("const libraryQueryInput = useMemo(");
    expect(library).toContain("trpc.library.list.useQuery(libraryQueryInput");
    expect(library).toContain('aria-label="Show library as a list"');
    expect(library).toContain('aria-label="Show library as a grid"');
    expect(library).toContain('viewMode === "grid" ? "grid gap-3 sm:grid-cols-2" : "space-y-3"');
  });
});
