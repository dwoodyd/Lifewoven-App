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

export function registerStorageProxy(app: Express) {
  // Express 4 wildcard: use "/*" and read req.params[0]
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as unknown as Record<string, string>)["0"];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
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
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
