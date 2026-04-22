/**
 * PayPal payment routes for one-time product purchases.
 *
 * POST /api/paypal/create-order   — creates a PayPal order, returns orderId
 * POST /api/paypal/capture-order  — captures payment, issues secure download token
 */
import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import { getDb } from "../db";
import { orders, referralCredits } from "../../drizzle/schema";
import { getProductBySlug, getAllProducts } from "../products";
import { notifyOwner } from "../_core/notification";
import { sdk } from "../_core/sdk";

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
    // C3: Require authentication — userId always comes from the session, never the body
    const user = await sdk.authenticateRequest(req).catch(() => null);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { productSlug, useCredit } = req.body as { productSlug: string; useCredit?: boolean };

    const product = getProductBySlug(productSlug);
    if (!product) return res.status(404).json({ error: "Product not found" });

    let displayPrice = product.priceUsd;
    let creditApplied = 0;
    // Apply referral credit for the authenticated user only
    if (useCredit) {
      const db = await getDb();
      if (db) {
        const { eq } = await import("drizzle-orm");
        const [cr] = await db.select().from(referralCredits).where(eq(referralCredits.userId, user.id)).limit(1);
        if (cr && cr.balanceCents > 0) {
          creditApplied = Math.min(cr.balanceCents, Math.round(displayPrice * 100));
          displayPrice = Math.max(0.5, displayPrice - creditApplied / 100);
        }
      }
    }

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
            value: displayPrice.toFixed(2),
          },
          // custom_id stores only the authenticated userId — no credit amounts (M6 fix)
          custom_id: String(user.id),
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

    return res.json({ orderId: order.id, creditApplied, finalPrice: displayPrice });
  } catch (err) {
    console.error("[PayPal] create-order error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Capture Order ─────────────────────────────────────────────────────────────
paypalRouter.post("/api/paypal/capture-order", async (req: Request, res: Response) => {
  try {
    // C4: Require authentication — userId always comes from the session, never the body
    const user = await sdk.authenticateRequest(req).catch(() => null);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { orderId, productSlug } = req.body as {
      orderId: string;
      productSlug: string;
    };

    if (!orderId || !productSlug) {
      return res.status(400).json({ error: "Missing orderId or productSlug" });
    }

    const product = getProductBySlug(productSlug);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const isBundle = productSlug === "complete-bundle";
    const bundleProducts = isBundle
      ? getAllProducts().filter(p => p.type !== "bundle" && p.s3Url)
      : null;

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

    // C4: Validate that the order was created by the authenticated user
    const orderOwner = captureUnit?.custom_id ? parseInt(captureUnit.custom_id) : null;
    if (orderOwner !== null && orderOwner !== user.id) {
      console.error(`[PayPal] Order ownership mismatch: order owner=${orderOwner}, requester=${user.id}`);
      return res.status(403).json({ error: "Order does not belong to this user" });
    }

    // Generate secure download token (72-hour expiry)
    const downloadToken = crypto.randomBytes(32).toString("hex");
    const downloadExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const db = await getDb();

    // M6: Credit deduction based on server-computed difference (full price - amount paid)
    // Never trust custom_id suffix for credit amounts
    const fullPriceCents = product ? Math.round(product.priceUsd * 100) : 0;
    const paidCents = Math.round(amountPaid * 100);
    const creditUsedCents = Math.max(0, fullPriceCents - paidCents);
    if (db && creditUsedCents > 0) {
      const { eq, sql } = await import("drizzle-orm");
      await db.update(referralCredits)
        .set({ balanceCents: sql`GREATEST(0, balance_cents - ${creditUsedCents})` })
        .where(eq(referralCredits.userId, user.id))
        .catch(() => {});
    }
    if (db) {
      if (isBundle && bundleProducts) {
        // Insert one order row per product in the bundle
        const bundleRows = bundleProducts.map(bp => ({
          userId: user.id,
          items: [{ type: "product", slug: bp.slug, price: bp.priceCents }],
          total: bp.priceUsd.toFixed(2),
          status: "completed" as const,
          stripeSessionId: null,
          paypalCaptureId,
          productSlug: bp.slug,
          downloadUrl: bp.s3Url,
          downloadToken: crypto.randomBytes(32).toString("hex"),
          downloadExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        }));
        await db.insert(orders).values(bundleRows);
        await notifyOwner({
          title: `💳 Bundle Purchase (PayPal): Complete Bundle`,
          content: `User ${user.id} purchased the Complete Bundle for $${amountPaid.toFixed(2)} via PayPal. Capture ID: ${paypalCaptureId}`,
        }).catch(() => {});
      } else {
        await db.insert(orders).values({
          userId: user.id,
          items: [{ type: "product", slug: productSlug, price: Math.round(amountPaid * 100) }],
          total: amountPaid.toFixed(2),
          status: "completed",
          stripeSessionId: null,
          paypalCaptureId,
          productSlug,
          downloadUrl: product.s3Url,
          downloadToken,
          downloadExpiresAt,
        });
        await notifyOwner({
          title: `💳 New Purchase (PayPal): ${product.title}`,
          content: `User ${user.id} purchased "${product.title}" for $${amountPaid.toFixed(2)} via PayPal. Capture ID: ${paypalCaptureId}`,
        }).catch(() => {});
      }
    }

    // C4: Do NOT return downloadToken in the response body.
    // The client must fetch orders via the authenticated tRPC stripe.getMyOrders procedure.
    return res.json({
      status: "COMPLETED",
      productTitle: isBundle ? "Complete Lifewoven Bundle (9 products)" : product.title,
      isBundle,
    });
  } catch (err) {
    console.error("[PayPal] capture-order error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// C2: The unauthenticated GET /api/paypal/my-purchases/:userId endpoint has been
// permanently removed. Use the authenticated tRPC procedure stripe.getMyOrders instead.
