/**
 * Secure download endpoint: GET /api/download/:token
 *
 * Validates the token against the orders table, checks expiry,
 * and redirects to the S3 URL. The S3 URL is never exposed to the client
 * directly — only through this server-side redirect.
 */
import type { Request, Response } from "express";
import { getDb } from "../db";
import { orders } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export async function downloadHandler(req: Request, res: Response) {
  const { token } = req.params;

  if (!token || typeof token !== "string" || token.length < 32) {
    return res.status(400).json({ error: "Invalid download token." });
  }

  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "Database unavailable." });
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

  // Redirect to the S3/CDN URL — the browser will download the PDF
  console.log(`[Download] Token redeemed for order ${order.id} (${order.productSlug})`);
  return res.redirect(302, order.downloadUrl);
}
