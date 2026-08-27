/**
 * Secure download endpoint: GET /api/download/:token
 *
 * Validates the token against the orders table, checks expiry,
 * and redirects to a short-lived storage-provider signed URL. The provider
 * currently issues roughly one-hour URLs, while this endpoint creates a new
 * signed URL each time the still-valid 72-hour download token is redeemed.
 */
import type { Request, Response } from "express";
import { getDb } from "./db";
import { orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sdk } from "./_core/sdk";
import { COOKIE_NAME } from "@shared/const";
import { storageGet } from "./storage";

function wantsJson(req: Request) {
  return req.query.format === "json";
}

function sendDownloadError(req: Request, res: Response, status: number, message: string) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  if (wantsJson(req)) return res.status(status).json({ error: message });
  return res.status(status).type("html").send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Download unavailable | Lifewoven</title><style>body{margin:0;background:#0d1222;color:#f4efe5;font:16px system-ui,sans-serif;display:grid;min-height:100vh;place-items:center}.card{width:min(34rem,calc(100% - 3rem));padding:2.25rem;border:1px solid #514b42;border-radius:1rem;background:#141b31}h1{font-family:Georgia,serif;font-weight:400;margin-top:0}p{color:#c4bfba;line-height:1.6}a{display:inline-block;margin-top:.75rem;padding:.75rem 1rem;border-radius:.5rem;background:#d8b161;color:#17130c;text-decoration:none;font-weight:700}</style></head><body><main class="card"><h1>Your secure download needs a fresh link</h1><p>${message}</p><a href="/downloads">Return to My Downloads</a></main></body></html>`);
}

async function verifySignedStorageUrl(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(url, {
      headers: { Range: "bytes=0-0" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Storage returned ${response.status}`);
  } finally {
    clearTimeout(timeout);
  }
}

export async function downloadHandler(req: Request, res: Response) {
  const { token } = req.params;

  if (!token || typeof token !== "string" || token.length < 32) {
    return sendDownloadError(req, res, 400, "This download link is not valid.");
  }

  const db = await getDb();
  if (!db) {
    return sendDownloadError(req, res, 500, "We could not reach your download record. Please try again shortly.");
  }

  // A 256-bit, expiring token is the primary download capability. This keeps an
  // issued link functional when it opens in a new browser context that does not
  // carry the app session cookie. When a session is available, still bind it to
  // the owning account as a defense-in-depth check.
  const sessionToken = req.cookies?.[COOKIE_NAME];
  let sessionUser: { id: number } | null = null;
  if (sessionToken) {
    try {
      const info = await sdk.verifySession(sessionToken);
      if (info?.openId) {
        const dbConn = await getDb();
        if (dbConn) {
          const { users } = await import("../drizzle/schema");
          const [u] = await dbConn.select({ id: users.id }).from(users).where(eq(users.openId, info.openId)).limit(1);
          sessionUser = u ?? null;
        }
      }
    } catch { /* A stale session does not invalidate an already-issued token. */ }
  }

  // Find the order by download token
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.downloadToken, token))
    .limit(1);

  if (!order) {
    return sendDownloadError(req, res, 404, "This download link was not found. Generate a fresh link from My Downloads.");
  }

  // When a valid session is present, it must belong to the token owner.
  if (sessionUser && order.userId !== sessionUser.id) {
    return sendDownloadError(req, res, 403, "This download link belongs to a different account.");
  }

  if (order.status !== "completed") {
    return sendDownloadError(req, res, 403, "This purchase has not completed yet.");
  }

  if (!order.downloadUrl) {
    return sendDownloadError(req, res, 404, "This file is not currently available. Generate a fresh link or contact support.");
  }

  // Check expiry
  if (order.downloadExpiresAt && new Date() > order.downloadExpiresAt) {
    return sendDownloadError(req, res, 410, "This 72-hour download link has expired. Return to My Downloads and select Generate fresh link.");
  }

  // Generate a short-lived presigned URL from Manus S3 storage.
  // The downloadUrl stored on the order is either:
  //   (a) a full CDN URL (legacy) — serve directly but log a warning
  //   (b) a relative S3 key (new) — generate a presigned URL via storageGet
  console.log(`[Download] Token redeemed for order ${order.id} (${order.productSlug})`);

  const rawUrl = order.downloadUrl;
  const isRelativeKey = !rawUrl.startsWith("http");
  const isManusStorage = rawUrl.includes("cloudfront.net") || rawUrl.includes("manus");

  if (isRelativeKey) {
    // New path: generate a short-lived presigned URL
    try {
      const { url: presignedUrl } = await storageGet(rawUrl);
      // Verify before exposing the redirect. A storage-layer issue therefore
      // remains a branded Lifewoven recovery state rather than a raw XML page.
      await verifySignedStorageUrl(presignedUrl);
      // Do not allow an authenticated redirect capability to be cached.
      res.setHeader("Cache-Control", "private, no-store, max-age=0");
      if (wantsJson(req)) return res.json({ url: presignedUrl });
      return res.redirect(302, presignedUrl);
    } catch (err) {
      console.error(`[Download] storageGet failed for key ${rawUrl}:`, err);
      return sendDownloadError(req, res, 502, "We could not prepare the secure file link. Return to My Downloads and select Generate fresh link.");
    }
  }

  if (!isManusStorage) {
    console.warn(`[Download] Legacy non-Manus URL for order ${order.id}: ${rawUrl}`);
  }

  // Never expose a stored legacy URL, as it may be a stale signed capability.
  return sendDownloadError(req, res, 410, "This older delivery link needs to be refreshed. Return to My Downloads and select Generate fresh link.");
}
