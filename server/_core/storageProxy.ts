import type { Express } from "express";
import { ENV } from "./env";
import { sdk } from "./sdk";

// Private prefixes: keys under these paths contain user-generated content and
// must only be served to the authenticated owner. The userId segment is always
// the first path component after the prefix (e.g. "voice/42/...").
const PRIVATE_PREFIXES = ["voice/", "voice-journal/", "book-covers/", "book-attachments/"];

function extractOwnerIdFromKey(key: string): number | null {
  for (const prefix of PRIVATE_PREFIXES) {
    if (key.startsWith(prefix)) {
      const rest = key.slice(prefix.length);
      const segment = rest.split("/")[0];
      const id = parseInt(segment, 10);
      return isNaN(id) ? null : id;
    }
  }
  return null; // public key — no ownership restriction
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
  // Express 4 wildcard: use "/*" and read req.params[0]
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as unknown as Record<string, string>)["0"];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      console.error("[StorageProxy] forge credentials not configured");
      res.status(500).send("Storage proxy not configured");
      return;
    }

    // SECURITY: private prefixes require authentication and ownership check.
    const ownerId = extractOwnerIdFromKey(key);
    if (ownerId !== null) {
      const user = await sdk.authenticateRequest(req).catch(() => null);
      if (!user) {
        res.status(401).send("Unauthorized");
        return;
      }
      if (user.id !== ownerId) {
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
