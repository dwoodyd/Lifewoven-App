import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("catalog format and pricing integrity", () => {
  it("uses scripts rather than unsupported audio programs and reprices the Reset Protocol", () => {
    const products = source("server/products.ts");
    const store = source("client/src/pages/Store.tsx");
    const detail = source("client/src/pages/ProductDetail.tsx");
    const pricing = source("client/src/pages/Pricing.tsx");

    for (const content of [products, store, detail, pricing]) {
      expect(content).toContain("The Reset Protocol");
      expect(content).not.toContain("Reset Audio");
      expect(content).not.toContain("$607");
    }

    expect(products).toContain("priceUsd: 12");
    expect(products).toContain("priceCents: 1200");
    expect(store).toContain("price: 12");
    expect(detail).toContain("price: \"$12\"");

    expect(products).toContain('type: "script"');
    expect(store).toContain('{ id: "scripts", label: "Scripts"');
    expect(detail).not.toContain("Audio Preview");
    expect(detail).not.toContain("MP3 audio download");
    expect(detail).not.toContain("Printable PDF");
  });

  it("keeps the Resource Library’s filter aligned with the document-based guided practices", () => {
    const library = source("client/src/pages/ResourceLibrary.tsx");

    expect(library).toContain('category: "guided-practice"');
    expect(library).toContain('{ id: "guided-practice", label: "Guided Practices"');
    expect(library).not.toContain('{ id: "audio", label: "Audio"');
    expect(library).not.toContain("Original Lifewoven audio content.");
  });
});
