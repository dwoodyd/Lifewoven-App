import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("catalog format and pricing integrity", () => {
  it("keeps verified PDF delivery and $607 pricing while withdrawing only unsupported recording claims", () => {
    const products = source("server/products.ts");
    const store = source("client/src/pages/Store.tsx");
    const detail = source("client/src/pages/ProductDetail.tsx");
    const pricing = source("client/src/pages/Pricing.tsx");

    for (const content of [products, store, detail, pricing]) {
      expect(content).toContain("The Reset Protocol");
      expect(content).not.toContain("Reset Audio");
    }

    expect(products).toContain("priceUsd: 27");
    expect(products).toContain("priceCents: 2700");
    expect(store).toContain("price: 27");
    expect(detail).toContain('price: "$27"');
    expect(pricing).toContain("Combined retail: $607");

    expect(products).toContain('type: "script"');
    expect(store).toContain('{ id: "scripts", label: "Scripts"');
    expect(detail).not.toContain("Audio Preview");
    expect(detail).not.toContain("MP3 audio download");
    expect(detail).not.toContain("AI-voiced");
    expect(detail).not.toContain("guided audio recording");
    expect(detail).toContain("Workbook PDF");
    expect(detail).toContain("Audio Scripts PDF");
    expect(detail).toContain("Digital Card Deck PDF");
  });

  it("keeps the Resource Library’s filter aligned with the document-based guided practices", () => {
    const library = source("client/src/pages/ResourceLibrary.tsx");

    expect(library).toContain('category: "guided-practice"');
    expect(library).toContain('{ id: "guided-practice", label: "Guided Practices"');
    expect(library).not.toContain('{ id: "audio", label: "Audio"');
    expect(library).not.toContain("Original Lifewoven audio content.");
  });
});
