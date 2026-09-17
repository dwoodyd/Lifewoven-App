import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calcProgress } from "./routers/readingBridge";

const root = resolve(import.meta.dirname, "..");
const source = (relative: string) => readFileSync(resolve(root, relative), "utf8");

describe("Reading Bridge", () => {
  it("calculates an ordered, bounded reading progress value", () => {
    expect(calcProgress(null)).toBe(0);
    expect(calcProgress("start-here")).toBeGreaterThan(0);
    expect(calcProgress("ch-6")).toBeGreaterThan(calcProgress("ch-1"));
    expect(calcProgress("finished")).toBe(100);
    expect(calcProgress("unknown-chapter")).toBe(0);
  });

  it("offers a non-modal third-session invitation with explicit reader choices", () => {
    const prompt = source("client/src/components/ReadingBridgePrompt.tsx");
    const dashboard = source("client/src/pages/Dashboard.tsx");

    expect(prompt).toContain('const PROMPT_SESSION_THRESHOLD = 3');
    expect(prompt).toContain('aria-label="Reading Bridge invitation"');
    expect(prompt).toContain("Set my chapter");
    expect(prompt).toContain("Not reading it");
    expect(prompt).toContain("readingBridge.dismiss.useMutation");
    expect(dashboard).toContain('<ReadingBridgePrompt enabled={isAuthenticated} />');
  });

  it("keeps chapter context optional, bounded, and weekly-reader-aware in Oracle", () => {
    const router = source("server/routers.ts");
    const readingBridge = source("server/routers/readingBridge.ts");
    const oracle = source("client/src/pages/Oracle.tsx");

    expect(readingBridge).toContain('.set({ readingChapter: input.chapterId, readingBridgeDismissed: false })');
    expect(router).toContain("const readingContext = rbChapterForOracle");
    expect(router).toContain("Reference these concepts naturally when relevant, but do not force it.");
    expect(router).toContain("Do not reference chapters or sections they have not yet reached.");
    expect(oracle).toContain("Weekly reading check-in");
    expect(oracle).toContain("oracle_reading_prompt_week");
  });
});
