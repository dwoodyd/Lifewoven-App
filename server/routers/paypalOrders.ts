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
import { getAllProducts, getProductBySlug } from "../products";
import { getAccessLevel } from "./store";
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
    const db = await requireDb();
    const myOrders = await db.select()
      .from(orders)
      .where(eq(orders.userId, ctx.user.id))
      .orderBy(orders.createdAt);
    const completedOrders = myOrders.filter(o => o.status === "completed" && o.productSlug);
    const hasLibraryAccess = ctx.user.storeAccess === "library_during_beta"
      || getAccessLevel(ctx.user.membershipTier ?? "explorer", ctx.user.role ?? "user") === "library";

    if (!hasLibraryAccess) {
      return completedOrders.map(order => ({ ...order, accessSource: "purchase" as const }));
    }

    const ownedSlugs = new Set(completedOrders.map(order => order.productSlug));
    const virtualIncludedOrders = getAllProducts()
      .filter(product => product.s3Key && !ownedSlugs.has(product.slug))
      .map((product, index) => ({
        id: -(index + 1), userId: ctx.user.id, productSlug: product.slug, status: "completed" as const,
        paypalCaptureId: null, items: [], total: "0.00", downloadUrl: null,
        downloadToken: null, downloadExpiresAt: null, createdAt: new Date(),
        accessSource: "membership" as const,
      }));

    return [
      ...completedOrders.map(order => ({ ...order, accessSource: "membership" as const })),
      ...virtualIncludedOrders,
    ];
  }),

  // ── Re-issue a secure token for a completed purchase or included membership item ──
  reissueDownload: protectedProcedure
    .input(z.object({ productSlug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const product = getProductBySlug(input.productSlug);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found." });
      if (!product.s3Key) throw new TRPCError({ code: "BAD_REQUEST", message: "This bundle is delivered as individual products." });

      const [existingOrder] = await db.select().from(orders)
        .where(and(eq(orders.userId, ctx.user.id), eq(orders.productSlug, input.productSlug), eq(orders.status, "completed")))
        .limit(1);
      const hasLibraryAccess = ctx.user.storeAccess === "library_during_beta"
        || getAccessLevel(ctx.user.membershipTier ?? "explorer", ctx.user.role ?? "user") === "library";
      if (!existingOrder && !hasLibraryAccess) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No completed purchase or included membership access found for this product." });
      }

      const newToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
      if (existingOrder) {
        await db.update(orders)
          .set({ downloadToken: newToken, downloadExpiresAt: expiresAt, downloadUrl: product.s3Key })
          .where(eq(orders.id, existingOrder.id));
      } else {
        await db.insert(orders).values({
          userId: ctx.user.id,
          items: [{ type: "product", id: input.productSlug, price: 0 }],
          total: "0.00",
          status: "completed",
          productSlug: input.productSlug,
          downloadUrl: product.s3Key,
          downloadToken: newToken,
          downloadExpiresAt: expiresAt,
        });
      }
      return { token: newToken, accessSource: hasLibraryAccess ? "membership" : "purchase" };
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
