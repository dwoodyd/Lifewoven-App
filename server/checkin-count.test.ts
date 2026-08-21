import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("check-in count persistence safeguards", () => {
  it("returns a total check-in count separately from the seven-record dashboard preview", () => {
    const router = source("server/routers.ts");
    expect(router).toContain("checkInCount: Number(checkInTotal[0]?.total ?? 0)");
    expect(router).toContain("sql<number>`count(*)`");
    expect(router).toContain(".limit(7)");
  });

  it("uses the all-time count for the Profile statistic instead of the recent preview length", () => {
    const profile = source("client/src/pages/Profile.tsx");
    expect(profile).toContain('label: "Check-ins", value: dashData.checkInCount ?? 0');
    expect(profile).not.toContain('label: "Check-ins", value: dashData.recentCheckIns?.length ?? 0');
  });
});
