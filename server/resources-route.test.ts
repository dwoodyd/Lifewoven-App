import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("legacy Resources route", () => {
  it("redirects /resources to the canonical Resource Library", () => {
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    expect(appSource).toContain('<Route path="/resources"><Redirect to="/library" replace /></Route>');
  });
});
