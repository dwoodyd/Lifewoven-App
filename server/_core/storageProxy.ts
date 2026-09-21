import type { Express } from "express";
import { ENV } from "./env";
import { sdk } from "./sdk";

// Private prefixes: keys under these paths contain user-generated content and
// must only be served to the authenticated owner. The userId segment is always
// the first path component after the prefix (e.g. "voice/42/...").
const PRIVATE_PREFIXES = ["voice/", "voice-journal/", "book-covers/", "book-attachments/"];
const PUBLIC_TOP_LEVEL_KEY = /^[A-Za-z0-9][A-Za-z0-9._() -]{0,511}$/;

export type StorageAccess = { kind: "public" } | { kind: "private"; ownerId: number } | { kind: "deny" };

/**
 * Only a known public top-level asset or a strictly owner-scoped private path
 * may reach the presigner. Unknown nested paths (including private products)
 * fail closed rather than becoming public by convention.
 */
export function resolveStorageAccess(rawKey: string): StorageAccess {
  if (!rawKey || rawKey.length > 512 || rawKey.includes("\\") || rawKey.includes("\0")) return { kind: "deny" };
  const segments = rawKey.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) return { kind: "deny" };

  for (const prefix of PRIVATE_PREFIXES) {
    if (rawKey.startsWith(prefix)) {
      const privateSegments = rawKey.slice(prefix.length).split("/");
      const ownerSegment = privateSegments[0];
      // Do not accept parseInt-style prefixes such as "42anything".
      if (!/^[1-9]\d*$/.test(ownerSegment) || privateSegments.length < 2) return { kind: "deny" };
      const ownerId = Number(ownerSegment);
      return Number.isSafeInteger(ownerId) ? { kind: "private", ownerId } : { kind: "deny" };
    }
  }

  return PUBLIC_TOP_LEVEL_KEY.test(rawKey) ? { kind: "public" } : { kind: "deny" };
}

/** Fetch with a hard timeout. Throws AbortError on timeout. */
async function fetchWithTimeout(url: URL | string, init: RequestInit, timeoutMs = 8_000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export function registerStorageProxy(app: Express) {
  // Express 5 requires named splats; preserve the complete storage key.
  app.get("/manus-storage/*key", async (req, res) => {
    const rawKey = (req.params as unknown as Record<string, string | string[]>).key;
    const key = Array.isArray(rawKey) ? rawKey.join("/") : rawKey;
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      console.error("[StorageProxy] forge credentials not configured");
      res.status(500).send("Storage proxy not configured");
      return;
    }

    const access = resolveStorageAccess(key);
    if (access.kind === "deny") {
      // Do not reveal whether an unrecognized private path exists.
      res.status(404).send("Not found");
      return;
    }

    // SECURITY: private prefixes require authentication and exact ownership.
    if (access.kind === "private") {
      const user = await sdk.authenticateRequest(req).catch(() => null);
      if (!user) {
        res.status(401).send("Unauthorized");
        return;
      }
      if (user.id !== access.ownerId) {
        // Return 404 rather than 403 to avoid confirming the resource exists
        res.status(404).send("Not found");
        return;
      }
    }

    try {
      // The permanent downloadUrl route currently produces unsigned CDN URLs for
      // managed media. Those URLs are denied by the CDN, leaving <video> elements
      // at HAVE_NOTHING. A short-lived presigned redirect authorizes only the
      // browser request that needs the asset without exposing the storage key.
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetchWithTimeout(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      }, 8_000);

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error ${forgeResp.status} for key "${key}": ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        console.error(`[StorageProxy] empty URL from forge for key "${key}"`);
        res.status(502).send("Empty URL from storage backend");
        return;
      }
      // Do not cache the redirect itself: each target URL has a short signature
      // lifetime. The signed CDN target remains cacheable by the browser.
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      const isTimeout = err instanceof Error && err.name === "AbortError";
      console.error(`[StorageProxy] ${isTimeout ? "timeout" : "error"} for key "${key}":`, err);
      res.status(502).send(isTimeout ? "Storage backend timed out" : "Storage proxy error");
    }
  });
}
