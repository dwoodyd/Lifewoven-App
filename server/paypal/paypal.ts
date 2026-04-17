/**
 * PayPal payment routes for one-time product purchases.
 *
 * POST /api/paypal/create-order   — creates a PayPal order, returns orderId
 * POST /api/paypal/capture-order  — captures payment, issues secure download token
 */
import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import { getDb } from "../db";
import { orders } from "../../drizzle/schema";
import { getProductBySlug } from "../products";
import { notifyOwner } from "../_core/notification";

const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal credentials not configured");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json() as { access_token?: string; error_description?: string };
  if (!data.access_token) throw new Error(data.error_description ?? "Failed to get PayPal token");
  return data.access_token;
}

export const paypalRouter = Router();

// ── Create Order ─────────────────────────────────────────────────────────────
paypalRouter.post("/api/paypal/create-order", async (req: Request, res: Response) => {
  try {
    const { productSlug, userId } = req.body as { productSlug: string; userId?: number };

    const product = getProductBySlug(productSlug);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const token = await getAccessToken();

    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `lifewoven-${productSlug}-${Date.now()}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: productSlug,
          description: product.title,
          amount: {
            currency_code: "USD",
            value: product.priceUsd.toFixed(2),
          },
          custom_id: userId ? String(userId) : undefined,
        }],
        application_context: {
          brand_name: "Lifewoven",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
        },
      }),
    });

    const order = await orderRes.json() as { id?: string; message?: string };
    if (!order.id) {
      console.error("[PayPal] Create order failed:", order);
      return res.status(500).json({ error: order.message ?? "Failed to create PayPal order" });
    }

    return res.json({ orderId: order.id });
  } catch (err) {
    console.error("[PayPal] create-order error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Capture Order ─────────────────────────────────────────────────────────────
paypalRouter.post("/api/paypal/capture-order", async (req: Request, res: Response) => {
  try {
    const { orderId, productSlug, userId } = req.body as {
      orderId: string;
      productSlug: string;
      userId?: number;
    };

    if (!orderId || !productSlug) {
      return res.status(400).json({ error: "Missing orderId or productSlug" });
    }

    const product = getProductBySlug(productSlug);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const token = await getAccessToken();

    const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const capture = await captureRes.json() as {
      status?: string;
      id?: string;
      purchase_units?: Array<{
        payments?: { captures?: Array<{ id: string; amount: { value: string } }> };
        custom_id?: string;
      }>;
      message?: string;
    };

    if (capture.status !== "COMPLETED") {
      console.error("[PayPal] Capture failed:", capture);
      return res.status(400).json({ error: capture.message ?? "Payment not completed" });
    }

    // Extract payment details
    const captureUnit = capture.purchase_units?.[0];
    const captureDetail = captureUnit?.payments?.captures?.[0];
    const amountPaid = parseFloat(captureDetail?.amount?.value ?? "0");
    const paypalCaptureId = captureDetail?.id ?? orderId;
    const resolvedUserId = userId ?? (captureUnit?.custom_id ? parseInt(captureUnit.custom_id) : null);

    // Generate secure download token (72-hour expiry)
    const downloadToken = crypto.randomBytes(32).toString("hex");
    const downloadExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const db = await getDb();
    if (db && resolvedUserId) {
      await db.insert(orders).values({
        userId: resolvedUserId,
        items: [{ type: "product", slug: productSlug, price: Math.round(amountPaid * 100) }],
        total: amountPaid.toFixed(2),
        status: "completed",
        stripeSessionId: null,
        paypalCaptureId: paypalCaptureId,
        productSlug,
        downloadUrl: product.s3Url,
        downloadToken,
        downloadExpiresAt,
      });

      await notifyOwner({
        title: `💳 New Purchase (PayPal): ${product.title}`,
        content: `User ${resolvedUserId} purchased "${product.title}" for $${amountPaid.toFixed(2)} via PayPal. Capture ID: ${paypalCaptureId}`,
      }).catch(() => {});
    }

    return res.json({
      status: "COMPLETED",
      downloadToken,
      downloadExpiresAt: downloadExpiresAt.toISOString(),
      productTitle: product.title,
    });
  } catch (err) {
    console.error("[PayPal] capture-order error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Get user's purchases (for download links) ─────────────────────────────────
paypalRouter.get("/api/paypal/my-purchases/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (!userId) return res.status(400).json({ error: "Invalid userId" });

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });

    const { eq } = await import("drizzle-orm");
    const myOrders = await db
      .select({
        id: orders.id,
        productSlug: orders.productSlug,
        status: orders.status,
        downloadToken: orders.downloadToken,
        downloadExpiresAt: orders.downloadExpiresAt,
        createdAt: orders.createdAt,
        total: orders.total,
      })
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(orders.createdAt);

    return res.json(myOrders.filter(o => o.status === "completed" && o.productSlug));
  } catch (err) {
    console.error("[PayPal] my-purchases error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
