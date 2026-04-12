import type { Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "../db";
import { users, orders } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

export async function stripeWebhookHandler(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-03-31.basil" });

  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } else {
      event = JSON.parse(req.body.toString()) as Stripe.Event;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Webhook] Signature verification failed:", msg);
    return res.status(400).json({ error: `Webhook Error: ${msg}` });
  }

  // Test event passthrough — required for webhook verification in Stripe dashboard
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Webhook] Event: ${event.type} | ${event.id}`);

  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "Database unavailable" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id ? parseInt(session.metadata.user_id) : null;
        const plan = session.metadata?.plan as "seeker" | "oracle" | undefined;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        const purchaseType = session.metadata?.purchase_type;

        // Handle product (one-time) purchases
        if (purchaseType === "product" && userId) {
          const productSlug = session.metadata?.product_slug ?? null;
          const downloadUrl = session.metadata?.download_url ?? null;
          const amountTotal = session.amount_total ?? 0;
          await db.insert(orders).values({
            userId,
            items: [{ type: "product", slug: productSlug, price: amountTotal }],
            total: (amountTotal / 100).toFixed(2),
            status: "completed",
            stripeSessionId: session.id,
            productSlug,
            downloadUrl,
          });
          console.log(`[Webhook] Product order created for user ${userId}: ${productSlug}`);
          await notifyOwner({
            title: `💳 New Purchase: ${productSlug}`,
            content: `${session.metadata?.customer_name ?? "Someone"} (${session.metadata?.customer_email ?? ""}) purchased "${productSlug}" for $${(amountTotal / 100).toFixed(2)}.\nDownload: ${downloadUrl ?? "N/A"}`,
          }).catch(() => {});
          break;
        }

        // Handle subscription purchases
        if (userId && plan && customerId && subscriptionId) {
          await db.update(users).set({
            membershipTier: plan,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          }).where(eq(users.id, userId));
          console.log(`[Webhook] User ${userId} upgraded to ${plan}`);
          await notifyOwner({
            title: `🎉 New ${plan} Subscriber`,
            content: `${session.metadata?.customer_name ?? "Someone"} (${session.metadata?.customer_email ?? ""}) subscribed to the ${plan} plan.`,
          }).catch(() => {});
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const plan = sub.metadata?.lifewoven_plan as "seeker" | "oracle" | undefined;

        // Determine tier from price metadata if not in sub metadata
        let tier: "seeker" | "oracle" | "explorer" = "explorer";
        if (plan) {
          tier = plan;
        } else {
          const priceId = sub.items.data[0]?.price?.id;
          if (priceId) {
            const price = await stripe.prices.retrieve(priceId);
            const pricePlan = price.metadata?.lifewoven_plan as "seeker" | "oracle" | undefined;
            if (pricePlan) tier = pricePlan;
          }
        }

        if (sub.status === "active" || sub.status === "trialing") {
          await db.update(users).set({
            membershipTier: tier,
            stripeSubscriptionId: sub.id,
          }).where(eq(users.stripeCustomerId, customerId));
        } else if (["canceled", "unpaid", "past_due"].includes(sub.status)) {
          await db.update(users).set({
            membershipTier: "explorer",
            stripeSubscriptionId: null,
          }).where(eq(users.stripeCustomerId, customerId));
          console.log(`[Webhook] Subscription ${sub.id} ${sub.status} — downgraded to explorer`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await db.update(users).set({
          membershipTier: "explorer",
          stripeSubscriptionId: null,
        }).where(eq(users.stripeCustomerId, customerId));
        console.log(`[Webhook] Subscription deleted — user downgraded to explorer`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("[Webhook] Handler error:", err);
    return res.status(500).json({ error: "Handler error" });
  }

  return res.json({ received: true });
}
