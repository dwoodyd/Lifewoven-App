import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("legacy Resources route", () => {
  it("redirects legacy reader vocabulary to canonical app routes", () => {
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    expect(appSource).toContain('<Route path="/resources"><Redirect to="/library" replace /></Route>');
    expect(appSource).toContain('<Route path="/today"><Redirect to="/dashboard" replace /></Route>');
    expect(appSource).toContain('<Route path="/assessment"><Redirect to="/audit" replace /></Route>');
    expect(appSource).toContain('<Route path="/survey"><Redirect to="/audit" replace /></Route>');
    expect(appSource).toContain('<Route path="/ground-check"><Redirect to="/ground/ground-check" replace /></Route>');
    expect(appSource).toContain('<Route path="/check-in"><Redirect to="/dashboard" replace /></Route>');
    expect(appSource).toContain('<Route path="/mood"><Redirect to="/mood-rhythm" replace /></Route>');
  });
});
