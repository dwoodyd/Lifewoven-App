/**
 * Store Router — tier-aware product access and purchasing
 *
 * Access levels:
 *   oracle  → library (all products included, $0)
 *   seeker  → discount (30% off all standalone products)
 *   explorer → standalone (full price)
 *
 * Admin always gets library-level access.
 */
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { products, orders, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// ── Helpers ──────────────────────────────────────────────────────────────────

export type StoreAccessLevel = "library" | "discount" | "standalone";

export function getAccessLevel(tier: string, role: string): StoreAccessLevel {
  if (role === "admin") return "library";
  if (tier === "oracle") return "library";
  if (tier === "seeker") return "discount";
  return "standalone";
}

const SEEKER_DISCOUNT = 0.30; // 30% off

export function getEffectivePrice(basePrice: number, level: StoreAccessLevel): number {
  if (level === "library") return 0;
  if (level === "discount") return Math.round(basePrice * (1 - SEEKER_DISCOUNT) * 100) / 100;
  return basePrice;
}

// ── Router ───────────────────────────────────────────────────────────────────

export const storeRouter = router({
  /**
   * Returns the current user's store access level and tier.
   * Public — returns "standalone" for unauthenticated users.
   */
  getAccess: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return { level: "standalone" as StoreAccessLevel, tier: "explorer" };
    }
    const level = getAccessLevel(ctx.user.membershipTier ?? "explorer", ctx.user.role ?? "user");
    return { level, tier: ctx.user.membershipTier ?? "explorer" };
  }),

  /**
   * Returns all published products with tier-adjusted effective prices.
   * Public — unauthenticated users see full prices.
   */
  getProducts: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db.select().from(products).where(eq(products.isPublished, true));

    const level: StoreAccessLevel = ctx.user
      ? getAccessLevel(ctx.user.membershipTier ?? "explorer", ctx.user.role ?? "user")
      : "standalone";

    return rows.map((p) => {
      const basePrice = parseFloat(p.price as unknown as string);
      const effectivePrice = getEffectivePrice(basePrice, level);
      return {
        ...p,
        basePrice,
        effectivePrice,
        accessLevel: level,
        isIncluded: level === "library",
        hasDiscount: level === "discount",
        discountPct: level === "discount" ? 30 : 0,
      };
    });
  }),

  /**
   * Returns the current user's purchased product slugs.
   */
  myPurchases: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const userOrders = await db.select().from(orders)
      .where(and(eq(orders.userId, ctx.user.id), eq(orders.status, "completed")));
    return userOrders.map((o) => o.productSlug).filter(Boolean) as string[];
  }),

  /**
   * Creates a PayPal order for a standalone product purchase.
   * Applies Seeker discount server-side — never trust client-side price.
   */
  createOrder: protectedProcedure
    .input(z.object({
      productSlug: z.string(),
      origin: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Fetch the product
      const [product] = await db.select().from(products)
        .where(and(eq(products.slug, input.productSlug), eq(products.isPublished, true)));
      if (!product) throw new Error("Product not found");

      const level = getAccessLevel(ctx.user.membershipTier ?? "explorer", ctx.user.role ?? "user");

      // Oracle users already have access — no purchase needed
      if (level === "library") {
        return { alreadyIncluded: true, checkoutUrl: null };
      }

      const basePrice = parseFloat(product.price as unknown as string);
      const effectivePrice = getEffectivePrice(basePrice, level);

      // Create PayPal order
      const clientId = process.env.PAYPAL_CLIENT_ID;
      const secret = process.env.PAYPAL_CLIENT_SECRET;
      if (!clientId || !secret) throw new Error("PayPal not configured");

      const paypalBase = process.env.PAYPAL_ENV === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

      // Get access token
      const tokenRes = await fetch(`${paypalBase}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });
      const tokenData = await tokenRes.json() as { access_token?: string };
      if (!tokenData.access_token) throw new Error("PayPal auth failed");

      // Create order
      const orderRes = await fetch(`${paypalBase}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [{
            reference_id: `${ctx.user.id}-${input.productSlug}`,
            description: product.title,
            amount: {
              currency_code: "USD",
              value: effectivePrice.toFixed(2),
            },
            custom_id: JSON.stringify({
              userId: ctx.user.id,
              productSlug: input.productSlug,
              tier: ctx.user.membershipTier,
              discountApplied: level === "discount" ? 30 : 0,
            }),
          }],
          application_context: {
            brand_name: "Lifewoven",
            landing_page: "BILLING",
            user_action: "PAY_NOW",
            return_url: `${input.origin}/store/success?product=${input.productSlug}`,
            cancel_url: `${input.origin}/store`,
          },
        }),
      });

      const orderData = await orderRes.json() as {
        id?: string;
        links?: Array<{ rel: string; href: string }>;
      };

      if (!orderData.id) throw new Error("Failed to create PayPal order");

      const approvalLink = orderData.links?.find((l) => l.rel === "approve")?.href;
      if (!approvalLink) throw new Error("No PayPal approval URL");

      // Create a pending order record
      await db.insert(orders).values({
        userId: ctx.user.id,
        items: [{ type: "product", id: product.id, price: effectivePrice }],
        total: effectivePrice.toFixed(2) as unknown as string,
        status: "pending",
        productSlug: input.productSlug,
        paypalCaptureId: orderData.id,
      });

      return { alreadyIncluded: false, checkoutUrl: approvalLink };
    }),

  /**
   * Captures a PayPal order after user approval and grants download access.
   */
  captureOrder: protectedProcedure
    .input(z.object({
      paypalOrderId: z.string(),
      productSlug: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const clientId = process.env.PAYPAL_CLIENT_ID;
      const secret = process.env.PAYPAL_CLIENT_SECRET;
      if (!clientId || !secret) throw new Error("PayPal not configured");

      const paypalBase = process.env.PAYPAL_ENV === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

      // Get access token
      const tokenRes = await fetch(`${paypalBase}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });
      const tokenData = await tokenRes.json() as { access_token?: string };
      if (!tokenData.access_token) throw new Error("PayPal auth failed");

      // Capture the order
      const captureRes = await fetch(`${paypalBase}/v2/checkout/orders/${input.paypalOrderId}/capture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
      });
      const captureData = await captureRes.json() as { status?: string };

      if (captureData.status !== "COMPLETED") {
        throw new Error("Payment capture failed");
      }

      // Get the product for download URL
      const [product] = await db.select().from(products)
        .where(eq(products.slug, input.productSlug));

      // Update the order to completed
      await db.update(orders)
        .set({
          status: "completed",
          downloadUrl: product?.downloadUrl ?? null,
        })
        .where(and(
          eq(orders.userId, ctx.user.id),
          eq(orders.paypalCaptureId, input.paypalOrderId),
        ));

      return {
        success: true,
        downloadUrl: product?.downloadUrl ?? null,
      };
    }),
});
