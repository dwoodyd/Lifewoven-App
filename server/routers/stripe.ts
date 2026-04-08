import Stripe from "stripe";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { PLANS, type PlanTier } from "../stripe/products";
import { TRPCError } from "@trpc/server";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return db;
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });
  return new Stripe(key, { apiVersion: "2025-03-31.basil" });
}

export const stripeRouter = router({
  // ── Get current subscription status ────────────────────────────────────────
  status: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      const [user] = await db.select({
        membershipTier: users.membershipTier,
        stripeSubscriptionId: users.stripeSubscriptionId,
        membershipExpiresAt: users.membershipExpiresAt,
      }).from(users).where(eq(users.id, ctx.user.id));

    return {
      tier: (user?.membershipTier ?? "explorer") as PlanTier,
      subscriptionId: user?.stripeSubscriptionId ?? null,
      expiresAt: user?.membershipExpiresAt ?? null,
    };
  }),

  // ── Create checkout session ─────────────────────────────────────────────────
  createCheckout: protectedProcedure
    .input(z.object({
      plan: z.enum(["seeker", "oracle"]),
      origin: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      const db = await requireDb();
      const planConfig = PLANS[input.plan];

      // Get or create Stripe customer
      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id));
      let customerId = user?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email ?? undefined,
          name: ctx.user.name ?? undefined,
          metadata: { userId: ctx.user.id.toString() },
        });
        customerId = customer.id;
        await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, ctx.user.id));
      }

      // Look up or create the price for this plan
      const prices = await stripe.prices.list({ active: true, limit: 100 });
      let price = prices.data.find((p: Stripe.Price) =>
        p.metadata?.lifewoven_plan === input.plan && p.recurring?.interval === "month"
      );

      if (!price) {
        // Create product + price on first use
        const product = await stripe.products.create({
          name: `Lifewoven ${planConfig.name}`,
          description: planConfig.description,
          metadata: { lifewoven_plan: input.plan },
        });
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: planConfig.price,
          currency: "usd",
          recurring: { interval: "month" },
          metadata: { lifewoven_plan: input.plan },
        });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: price.id, quantity: 1 }],
        success_url: `${input.origin}/settings?tab=billing&success=1`,
        cancel_url: `${input.origin}/pricing`,
        allow_promotion_codes: true,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email ?? "",
          customer_name: ctx.user.name ?? "",
          plan: input.plan,
        },
      });

      return { url: session.url };
    }),

  // ── Customer portal (manage/cancel) ────────────────────────────────────────
  createPortal: protectedProcedure
    .input(z.object({ origin: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      const db = await requireDb();
      const [user] = await db.select({ stripeCustomerId: users.stripeCustomerId })
        .from(users).where(eq(users.id, ctx.user.id));

      if (!user?.stripeCustomerId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No billing account found." });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${input.origin}/settings?tab=billing`,
      });

      return { url: session.url };
    }),
});
