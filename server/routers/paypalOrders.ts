/**
 * PayPal Orders Router — handles one-time product purchases and membership status.
 * Subscription procedures are in server/paypal/subscriptions.ts.
 *
 * Procedures:
 *   paypalOrders.joinWaitlist   — public, notify owner of waitlist signup
 *   paypalOrders.getMyOrders    — protected, returns completed product orders for current user
 *   paypalOrders.reissueDownload — protected, re-issues a download token for a purchased product
 *   paypalOrders.getMembershipStatus — protected, returns current tier/subscription info
 */
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";
import { getDb } from "../db";
import { users, orders } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { getProductBySlug } from "../products";
import { TRPCError } from "@trpc/server";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return db;
}

export const paypalOrdersRouter = router({
  // ── Waitlist signup with owner notification ───────────────────────────────
  joinWaitlist: publicProcedure
    .input(z.object({ email: z.string().email(), productName: z.string() }))
    .mutation(async ({ input }) => {
      await notifyOwner({
        title: `✉️ Waitlist: ${input.productName}`,
        content: `${input.email} just joined the waitlist for "${input.productName}".`,
      });
      return { ok: true };
    }),

  // ── Get user's completed product orders ─────────────────────────────────────
  getMyOrders: protectedProcedure.query(async ({ ctx }) => {
    // Admins see all products as accessible (no purchase required)
    if (ctx.user.role === "admin") {
      const ALL_PRODUCT_SLUGS = [
        "alignment-fundamentals", "the-alignment-current", "identity-in-motion",
        "the-meaning-foundation", "belief-rewrite-workbook", "identity-stack-workbook",
        "morning-alignment-audio", "reset-audio", "wisdom-card-deck",
      ];
      return ALL_PRODUCT_SLUGS.map(slug => ({
        id: 0, userId: ctx.user.id, productSlug: slug, status: "completed",
        paypalCaptureId: null,
        downloadUrl: null, downloadToken: null, downloadExpiresAt: null, createdAt: new Date(),
      }));
    }
    const db = await requireDb();
    const myOrders = await db.select()
      .from(orders)
      .where(eq(orders.userId, ctx.user.id))
      .orderBy(orders.createdAt);
    return myOrders.filter(o => o.status === "completed" && o.productSlug);
  }),

  // ── Re-issue a download token for a previously purchased product ────────────
  reissueDownload: protectedProcedure
    .input(z.object({ productSlug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [order] = await db.select().from(orders)
        .where(and(eq(orders.userId, ctx.user.id), eq(orders.productSlug, input.productSlug)))
        .limit(1);
      if (!order || order.status !== "completed") {
        throw new TRPCError({ code: "FORBIDDEN", message: "No completed purchase found for this product." });
      }
      const product = getProductBySlug(input.productSlug);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found." });
      const newToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
      await db.update(orders)
        .set({ downloadToken: newToken, downloadExpiresAt: expiresAt, downloadUrl: product.s3Key })
        .where(eq(orders.id, order.id));
      return { token: newToken };
    }),

  // ── Get current membership status ──────────────────────────────────────────
  getMembershipStatus: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role === "admin") {
      return { tier: "oracle" as const, subscriptionId: null, expiresAt: null, isAdmin: true };
    }
    const db = await requireDb();
    const [user] = await db.select({
      membershipTier: users.membershipTier,
      paypalSubscriptionId: users.paypalSubscriptionId,
      membershipExpiresAt: users.membershipExpiresAt,
    }).from(users).where(eq(users.id, ctx.user.id));
    return {
      tier: (user?.membershipTier ?? "explorer") as "explorer" | "seeker" | "oracle",
      subscriptionId: user?.paypalSubscriptionId ?? null,
      expiresAt: user?.membershipExpiresAt ?? null,
      isAdmin: false,
    };
  }),
});
