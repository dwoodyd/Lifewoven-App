/**
 * Secure download endpoint: GET /api/download/:token
 *
 * Validates the token against the orders table, checks expiry,
 * and redirects to a short-lived presigned S3 URL. The presigned URL
 * expires in 60 seconds — enough for the browser to initiate the download
 * but not long enough to share or bookmark.
 */
import type { Request, Response } from "express";
import { getDb } from "./db";
import { orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sdk } from "./_core/sdk";
import { COOKIE_NAME } from "@shared/const";
import { storageGet } from "./storage";

export async function downloadHandler(req: Request, res: Response) {
  const { token } = req.params;

  if (!token || typeof token !== "string" || token.length < 32) {
    return res.status(400).json({ error: "Invalid download token." });
  }

  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "Database unavailable." });
  }

  // Require authentication — bind download token to the session user
  const sessionToken = req.cookies?.[COOKIE_NAME];
  if (!sessionToken) {
    return res.status(401).json({ error: "Authentication required to download." });
  }
  let sessionUser: { id: number } | null = null;
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
  } catch { /* invalid session */ }
  if (!sessionUser) {
    return res.status(401).json({ error: "Invalid or expired session." });
  }

  // Find the order by download token
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.downloadToken, token))
    .limit(1);

  if (!order) {
    return res.status(404).json({ error: "Download link not found or already used." });
  }

  // Verify the order belongs to the authenticated user
  if (order.userId !== sessionUser.id) {
    return res.status(403).json({ error: "This download link does not belong to your account." });
  }

  if (order.status !== "completed") {
    return res.status(403).json({ error: "Purchase not completed." });
  }

  if (!order.downloadUrl) {
    return res.status(404).json({ error: "Download file not found." });
  }

  // Check expiry
  if (order.downloadExpiresAt && new Date() > order.downloadExpiresAt) {
    return res.status(410).json({
      error: "This download link has expired. Please contact support to get a new link.",
    });
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
      return res.redirect(302, presignedUrl);
    } catch (err) {
      console.error(`[Download] storageGet failed for key ${rawUrl}:`, err);
      return res.status(500).json({ error: "Failed to generate download link. Please try again." });
    }
  }

  if (!isManusStorage) {
    console.warn(`[Download] Legacy non-Manus URL for order ${order.id}: ${rawUrl}`);
  }

  // Legacy path: redirect directly to the stored URL
  return res.redirect(302, rawUrl);
}
