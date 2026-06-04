/**
 * PayPal Subscription routes for membership tiers.
 *
 * POST /api/paypal/subscription/create  — creates a PayPal subscription, returns approvalUrl
 * POST /api/paypal/subscription/capture — saves subscriptionId after user approves
 * POST /api/paypal/subscription/cancel  — cancels the user's active subscription
 * GET  /api/paypal/subscription/status  — returns current subscription info from PayPal
 * POST /api/paypal/subscription/webhook — PayPal webhook for subscription lifecycle events
 *
 * 8 plans: Seeker/Oracle × Founding/Retail × Monthly/Annual
 * Plan IDs are stored in env vars (see PLAN_IDS below).
 */
import { Router, type Request, type Response } from "express";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sdk } from "../_core/sdk";
import { notifyOwner } from "../_core/notification";
import { sendRedemptionConfirmationEmail, sendDay0WelcomeEmail } from "../email";

const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// ── Plan IDs ──────────────────────────────────────────────────────────────────
// Set these in Settings → Secrets after creating plans in PayPal dashboard.
// Founding rates are locked for life; retail rates are standard public pricing.
/** Returns the correct plan ID map based on PAYPAL_ENV */
function getPlanIds(): Record<string, string | undefined> {
  const isLive = process.env.PAYPAL_ENV === "live";
  if (isLive) {
    return {
      "seeker-founding-monthly":  process.env.PAYPAL_LIVE_PLAN_SEEKER_FOUNDING_MONTHLY_ID,
      "seeker-founding-annual":   process.env.PAYPAL_LIVE_PLAN_SEEKER_FOUNDING_ANNUAL_ID,
      "oracle-founding-monthly":  process.env.PAYPAL_LIVE_PLAN_ORACLE_FOUNDING_MONTHLY_ID,
      "oracle-founding-annual":   process.env.PAYPAL_LIVE_PLAN_ORACLE_FOUNDING_ANNUAL_ID,
      "seeker-retail-monthly":    process.env.PAYPAL_LIVE_PLAN_SEEKER_RETAIL_MONTHLY_ID,
      "seeker-retail-annual":     process.env.PAYPAL_LIVE_PLAN_SEEKER_RETAIL_ANNUAL_ID,
      "oracle-retail-monthly":    process.env.PAYPAL_LIVE_PLAN_ORACLE_RETAIL_MONTHLY_ID,
      "oracle-retail-annual":     process.env.PAYPAL_LIVE_PLAN_ORACLE_RETAIL_ANNUAL_ID,
      seeker: process.env.PAYPAL_LIVE_PLAN_SEEKER_FOUNDING_MONTHLY_ID,
      oracle: process.env.PAYPAL_LIVE_PLAN_ORACLE_FOUNDING_MONTHLY_ID,
    };
  }
  return {
    // Sandbox — Founding rates (locked for life)
    "seeker-founding-monthly":  process.env.PAYPAL_PLAN_SEEKER_FOUNDING_MONTHLY_ID,
    "seeker-founding-annual":   process.env.PAYPAL_PLAN_SEEKER_FOUNDING_ANNUAL_ID,
    "oracle-founding-monthly":  process.env.PAYPAL_PLAN_ORACLE_FOUNDING_MONTHLY_ID,
    "oracle-founding-annual":   process.env.PAYPAL_PLAN_ORACLE_FOUNDING_ANNUAL_ID,
    // Sandbox — Retail rates
    "seeker-retail-monthly":    process.env.PAYPAL_PLAN_SEEKER_RETAIL_MONTHLY_ID,
    "seeker-retail-annual":     process.env.PAYPAL_PLAN_SEEKER_RETAIL_ANNUAL_ID,
    "oracle-retail-monthly":    process.env.PAYPAL_PLAN_ORACLE_RETAIL_MONTHLY_ID,
    "oracle-retail-annual":     process.env.PAYPAL_PLAN_ORACLE_RETAIL_ANNUAL_ID,
    // Legacy keys (backwards compat with older frontend code)
    seeker: process.env.PAYPAL_PLAN_SEEKER_FOUNDING_MONTHLY_ID ?? process.env.PAYPAL_PLAN_SEEKER_ID,
    oracle: process.env.PAYPAL_PLAN_ORACLE_FOUNDING_MONTHLY_ID ?? process.env.PAYPAL_PLAN_ORACLE_ID,
  };
}

const TIER_LABELS: Record<string, string> = {
  seeker: "Seeker", oracle: "Oracle",
  "seeker-founding-monthly": "Seeker Founding Monthly",
  "seeker-founding-annual":  "Seeker Founding Annual",
  "oracle-founding-monthly": "Oracle Founding Monthly",
  "oracle-founding-annual":  "Oracle Founding Annual",
  "seeker-retail-monthly":   "Seeker Retail Monthly",
  "seeker-retail-annual":    "Seeker Retail Annual",
  "oracle-retail-monthly":   "Oracle Retail Monthly",
  "oracle-retail-annual":    "Oracle Retail Annual",
};

/** Derive base tier (seeker | oracle) from plan key */
function baseTier(plan: string): "seeker" | "oracle" {
  return plan.startsWith("oracle") ? "oracle" : "seeker";
}

/** Derive store access from tier */
function tierToStoreAccess(tier: "seeker" | "oracle"): "discount" | "library" {
  return tier === "oracle" ? "library" : "discount";
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const isLive = process.env.PAYPAL_ENV === "live";
  const clientId = isLive
    ? (process.env.PAYPAL_LIVE_CLIENT_ID ?? process.env.PAYPAL_CLIENT_ID)
    : process.env.PAYPAL_CLIENT_ID;
  const secret = isLive
    ? (process.env.PAYPAL_LIVE_CLIENT_SECRET ?? process.env.PAYPAL_CLIENT_SECRET)
    : process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal credentials not configured");

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      signal: controller.signal,
    });
    const data = await res.json() as { access_token?: string };
    if (!data.access_token) throw new Error("Failed to get PayPal access token");
    return data.access_token;
  } finally {
    clearTimeout(id);
  }
}

async function paypalFetch(path: string, options: RequestInit = {}): Promise<globalThis.Response> {
  const token = await getAccessToken();
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15_000);
  try {
    return await fetch(`${PAYPAL_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(id);
  }
}

// ── Router ───────────────────────────────────────────────────────────────────

export const paypalSubscriptionRouter = Router();

// POST /api/paypal/subscription/create
paypalSubscriptionRouter.post("/create", async (req: Request, res: Response) => {
  try {
    const { plan, returnUrl, cancelUrl } = req.body as {
      plan: string;
      returnUrl: string;
      cancelUrl: string;
    };

    const user = await sdk.authenticateRequest(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const planId = getPlanIds()[plan];
    if (!planId) {
      return res.status(400).json({
        error: `Unknown plan: ${plan}. Configure the matching PAYPAL_PLAN_*_ID secret in Settings → Secrets.`,
      });
    }

    const body = {
      plan_id: planId,
      subscriber: {
        name: { given_name: user.name ?? "Member" },
        email_address: user.email ?? undefined,
      },
      application_context: {
        brand_name: "Lifewoven",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
      custom_id: `${user.id}:${plan}`, // used in webhook to identify user + tier
    };

    const ppRes = await paypalFetch("/v1/billing/subscriptions", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = await ppRes.json() as {
      id?: string;
      status?: string;
      links?: Array<{ rel: string; href: string }>;
      message?: string;
    };

    if (!data.id) {
      console.error("[PayPal Subscription] Create failed:", data);
      return res.status(500).json({ error: data.message ?? "Failed to create subscription" });
    }

    const approvalLink = data.links?.find((l) => l.rel === "approve");
    return res.json({ subscriptionId: data.id, approvalUrl: approvalLink?.href });
  } catch (err) {
    console.error("[PayPal Subscription] /create error:", err);
    return res.status(500).json({ error: "Subscription creation failed" });
  }
});

// POST /api/paypal/subscription/capture
// Called after user approves on PayPal — saves subscriptionId and upgrades tier
paypalSubscriptionRouter.post("/capture", async (req: Request, res: Response) => {
  try {
    const { subscriptionId, plan } = req.body as { subscriptionId: string; plan: string };
    const user = await sdk.authenticateRequest(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Verify subscription is ACTIVE with PayPal
    const ppRes = await paypalFetch(`/v1/billing/subscriptions/${subscriptionId}`);
    const sub = await ppRes.json() as { status?: string; id?: string };

    if (sub.status !== "ACTIVE" && sub.status !== "APPROVED") {
      return res.status(400).json({ error: `Subscription not active (status: ${sub.status})` });
    }

    const tier = baseTier(plan);
    const storeAccess = tierToStoreAccess(tier);
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });

    await db.update(users)
      .set({
        membershipTier: tier,
        paypalSubscriptionId: subscriptionId,
        billingStatus: "active",
        storeAccess,
      })
      .where(eq(users.id, user.id));

    await notifyOwner({
      title: `🎉 New ${TIER_LABELS[plan] ?? tier} Subscription`,
      content: `${user.name ?? user.email ?? "A user"} just subscribed to the ${TIER_LABELS[plan] ?? tier} plan.\nSubscription ID: ${subscriptionId}`,
    }).catch(() => {});

    // Send welcome email (non-blocking)
    if (user.email) {
      sendRedemptionConfirmationEmail({
        to: user.email,
        name: user.name || user.email,
        tier,
      }).catch((err) => console.error("[PayPal Subscription] Welcome email failed:", err));
    }

    return res.json({ ok: true, tier });
  } catch (err) {
    console.error("[PayPal Subscription] /capture error:", err);
    return res.status(500).json({ error: "Capture failed" });
  }
});

// POST /api/paypal/subscription/cancel
paypalSubscriptionRouter.post("/cancel", async (req: Request, res: Response) => {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });

    const [row] = await db.select().from(users).where(eq(users.id, user.id));
    const subId = row?.paypalSubscriptionId;
    if (!subId) return res.status(400).json({ error: "No active PayPal subscription found" });

    await paypalFetch(`/v1/billing/subscriptions/${subId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason: "User requested cancellation" }),
    });

    // Founding members keep their rate locked; store access reverts to standalone
    await db.update(users)
      .set({
        membershipTier: "explorer",
        paypalSubscriptionId: null,
        billingStatus: row?.foundingMember ? "explorer_tier_founding_rate_waiting" : "explorer_tier",
        storeAccess: "standalone",
      })
      .where(eq(users.id, user.id));

    return res.json({ ok: true });
  } catch (err) {
    console.error("[PayPal Subscription] /cancel error:", err);
    return res.status(500).json({ error: "Cancellation failed" });
  }
});

// GET /api/paypal/subscription/status
paypalSubscriptionRouter.get("/status", async (req: Request, res: Response) => {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });

    const [row] = await db.select().from(users).where(eq(users.id, user.id));

    // Admin always has oracle access
    if (row?.role === "admin") {
      return res.json({ tier: "oracle", subscriptionId: null, status: "admin", isAdmin: true });
    }

    const subId = row?.paypalSubscriptionId;
    if (!subId) {
      return res.json({
        tier: row?.membershipTier ?? "explorer",
        subscriptionId: null,
        status: row?.billingStatus ?? "none",
        billingStatus: row?.billingStatus ?? null,
        foundingMember: row?.foundingMember ?? false,
        betaEndDate: row?.betaEndDate ?? null,
      });
    }

    // Fetch live status from PayPal
    const ppRes = await paypalFetch(`/v1/billing/subscriptions/${subId}`);
    const sub = (await ppRes.json()) as unknown as {
      status?: string;
      billing_info?: { next_billing_time?: string };
    };

    return res.json({
      tier: row?.membershipTier ?? "explorer",
      subscriptionId: subId,
      status: sub.status ?? "unknown",
      billingStatus: row?.billingStatus ?? null,
      nextBillingDate: sub.billing_info?.next_billing_time ?? null,
      foundingMember: row?.foundingMember ?? false,
      betaEndDate: row?.betaEndDate ?? null,
    });
  } catch (err) {
    console.error("[PayPal Subscription] /status error:", err);
    return res.status(500).json({ error: "Status check failed" });
  }
});

// POST /api/paypal/subscription/webhook
// Handles BILLING.SUBSCRIPTION.ACTIVATED, BILLING.SUBSCRIPTION.CANCELLED, PAYMENT.SALE.COMPLETED
paypalSubscriptionRouter.post("/webhook", async (req: Request, res: Response) => {
  try {
    const event = req.body as {
      event_type?: string;
      resource?: {
        id?: string;
        custom_id?: string;
        status?: string;
      };
    };

    const eventType = event.event_type;
    const resource = event.resource;

    console.log(`[PayPal Webhook] ${eventType} — resource: ${resource?.id}`);

    if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED" || eventType === "PAYMENT.SALE.COMPLETED") {
      // custom_id format: "userId:plan"
      const customId = resource?.custom_id ?? "";
      const [userIdStr, plan] = customId.split(":");
      const userId = parseInt(userIdStr, 10);

      if (!userId || !plan) {
        console.warn("[PayPal Webhook] Missing custom_id:", customId);
        return res.json({ ok: true });
      }

      const tier = baseTier(plan);
      const storeAccess = tierToStoreAccess(tier);
      const db = await getDb();
      if (db) {
        await db.update(users)
          .set({
            membershipTier: tier,
            paypalSubscriptionId: resource?.id ?? null,
            billingStatus: "active",
            storeAccess,
          })
          .where(eq(users.id, userId));
        console.log(`[PayPal Webhook] Upgraded user ${userId} to ${tier}`);
        // Send Day-0 welcome email (non-blocking)
        const [upgradedUser] = await db.select({ email: users.email, name: users.name })
          .from(users).where(eq(users.id, userId));
        if (upgradedUser?.email) {
          sendDay0WelcomeEmail({
            to: upgradedUser.email,
            name: upgradedUser.name || upgradedUser.email,
          }).catch((err) => console.error("[PayPal Webhook] Day-0 email failed:", err));
        }
      }
    } else if (
      eventType === "BILLING.SUBSCRIPTION.CANCELLED" ||
      eventType === "BILLING.SUBSCRIPTION.EXPIRED" ||
      eventType === "BILLING.SUBSCRIPTION.SUSPENDED"
    ) {
      const subId = resource?.id;
      if (subId) {
        const db = await getDb();
        if (db) {
          // Look up user to check founding status before downgrade
          const [userRow] = await db.select({ id: users.id, foundingMember: users.foundingMember })
            .from(users)
            .where(eq(users.paypalSubscriptionId, subId));
          await db.update(users)
            .set({
              membershipTier: "explorer",
              paypalSubscriptionId: null,
              billingStatus: userRow?.foundingMember ? "explorer_tier_founding_rate_waiting" : "explorer_tier",
              storeAccess: "standalone",
            })
            .where(eq(users.paypalSubscriptionId, subId));
          console.log(`[PayPal Webhook] Downgraded subscription ${subId} to explorer`);
        }
      }
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("[PayPal Webhook] Error:", err);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
});
