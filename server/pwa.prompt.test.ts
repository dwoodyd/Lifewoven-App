import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("PWA install prompt timing", () => {
  it("does not schedule an automatic install prompt on a first visit", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/PWAInstallPrompt.tsx"), "utf8");
    expect(source).toContain('PWA_INSTALL_REQUEST_EVENT = "lifewoven:open-install"');
    expect(source).toContain('window.addEventListener(PWA_INSTALL_REQUEST_EVENT, openInstallPrompt)');
    expect(source).not.toContain("20_000");
    expect(source).not.toContain("30_000");
  });
});
