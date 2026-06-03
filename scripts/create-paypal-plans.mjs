/**
 * Creates Lifewoven subscription products and plans in the PayPal sandbox.
 * Run: node scripts/create-paypal-plans.mjs
 *
 * Plans created:
 *   seeker-founding-monthly  $9/mo
 *   seeker-founding-annual   $89/yr
 *   oracle-founding-monthly  $25/mo
 *   oracle-founding-annual   $249/yr
 */

const PAYPAL_BASE = "https://api-m.sandbox.paypal.com";
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");
  process.exit(1);
}

async function getAccessToken() {
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get access token: " + JSON.stringify(data));
  return data.access_token;
}

async function ppFetch(token, path, method = "GET", body = null) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `lifewoven-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      "Prefer": "return=representation",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${PAYPAL_BASE}${path}`, opts);
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

async function createProduct(token, name, description) {
  console.log(`\nCreating product: ${name}`);
  const { status, data } = await ppFetch(token, "/v1/catalogs/products", "POST", {
    name,
    description,
    type: "SERVICE",
    category: "SOFTWARE",
  });
  if (status >= 400) throw new Error(`Product creation failed (${status}): ${JSON.stringify(data)}`);
  console.log(`  ✓ Product ID: ${data.id}`);
  return data.id;
}

async function createPlan(token, productId, name, description, amountValue, intervalUnit, intervalCount = 1) {
  console.log(`\nCreating plan: ${name} — $${amountValue}/${intervalUnit.toLowerCase()}`);
  const { status, data } = await ppFetch(token, "/v1/billing/plans", "POST", {
    product_id: productId,
    name,
    description,
    status: "ACTIVE",
    billing_cycles: [
      {
        frequency: { interval_unit: intervalUnit, interval_count: intervalCount },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0, // 0 = infinite
        pricing_scheme: {
          fixed_price: { value: amountValue, currency_code: "USD" },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: "CONTINUE",
      payment_failure_threshold: 3,
    },
  });
  if (status >= 400) throw new Error(`Plan creation failed (${status}): ${JSON.stringify(data)}`);
  console.log(`  ✓ Plan ID: ${data.id}`);
  return data.id;
}

async function main() {
  const token = await getAccessToken();
  console.log("✓ Access token obtained");

  // Create Seeker product
  const seekerProductId = await createProduct(
    token,
    "Lifewoven — Seeker",
    "Full 5S system, all pathways, habit tracker, belief rewrite, decision journal, and priority support."
  );

  // Create Oracle product
  const oracleProductId = await createProduct(
    token,
    "Lifewoven — Oracle",
    "Everything in Seeker plus unlimited Oracle AI sessions, AI Weave reflections, pattern insights, and the complete Lifewoven library."
  );

  // Create all 4 founding plans
  const seekerFoundingMonthly = await createPlan(
    token, seekerProductId,
    "Seeker — Founding Rate Monthly",
    "Founding member rate: $9/mo (retail $19/mo). Locked for life.",
    "9.00", "MONTH"
  );

  const seekerFoundingAnnual = await createPlan(
    token, seekerProductId,
    "Seeker — Founding Rate Annual",
    "Founding member rate: $89/yr (retail $189/yr). Locked for life.",
    "89.00", "YEAR"
  );

  const oracleFoundingMonthly = await createPlan(
    token, oracleProductId,
    "Oracle — Founding Rate Monthly",
    "Founding member rate: $25/mo (retail $49/mo). Locked for life.",
    "25.00", "MONTH"
  );

  const oracleFoundingAnnual = await createPlan(
    token, oracleProductId,
    "Oracle — Founding Rate Annual",
    "Founding member rate: $249/yr (retail $479/yr). Locked for life.",
    "249.00", "YEAR"
  );

  // Also create retail plans (for non-founding members)
  const seekerRetailMonthly = await createPlan(
    token, seekerProductId,
    "Seeker — Retail Monthly",
    "Standard rate: $19/mo.",
    "19.00", "MONTH"
  );

  const seekerRetailAnnual = await createPlan(
    token, seekerProductId,
    "Seeker — Retail Annual",
    "Standard rate: $189/yr.",
    "189.00", "YEAR"
  );

  const oracleRetailMonthly = await createPlan(
    token, oracleProductId,
    "Oracle — Retail Monthly",
    "Standard rate: $49/mo.",
    "49.00", "MONTH"
  );

  const oracleRetailAnnual = await createPlan(
    token, oracleProductId,
    "Oracle — Retail Annual",
    "Standard rate: $479/yr.",
    "479.00", "YEAR"
  );

  console.log("\n\n=== PLAN IDs (copy to Settings → Secrets) ===\n");
  console.log(`PAYPAL_PLAN_SEEKER_FOUNDING_MONTHLY_ID=${seekerFoundingMonthly}`);
  console.log(`PAYPAL_PLAN_SEEKER_FOUNDING_ANNUAL_ID=${seekerFoundingAnnual}`);
  console.log(`PAYPAL_PLAN_ORACLE_FOUNDING_MONTHLY_ID=${oracleFoundingMonthly}`);
  console.log(`PAYPAL_PLAN_ORACLE_FOUNDING_ANNUAL_ID=${oracleFoundingAnnual}`);
  console.log(`PAYPAL_PLAN_SEEKER_RETAIL_MONTHLY_ID=${seekerRetailMonthly}`);
  console.log(`PAYPAL_PLAN_SEEKER_RETAIL_ANNUAL_ID=${seekerRetailAnnual}`);
  console.log(`PAYPAL_PLAN_ORACLE_RETAIL_MONTHLY_ID=${oracleRetailMonthly}`);
  console.log(`PAYPAL_PLAN_ORACLE_RETAIL_ANNUAL_ID=${oracleRetailAnnual}`);

  // Write to a file for easy reference
  const output = [
    `PAYPAL_PLAN_SEEKER_FOUNDING_MONTHLY_ID=${seekerFoundingMonthly}`,
    `PAYPAL_PLAN_SEEKER_FOUNDING_ANNUAL_ID=${seekerFoundingAnnual}`,
    `PAYPAL_PLAN_ORACLE_FOUNDING_MONTHLY_ID=${oracleFoundingMonthly}`,
    `PAYPAL_PLAN_ORACLE_FOUNDING_ANNUAL_ID=${oracleFoundingAnnual}`,
    `PAYPAL_PLAN_SEEKER_RETAIL_MONTHLY_ID=${seekerRetailMonthly}`,
    `PAYPAL_PLAN_SEEKER_RETAIL_ANNUAL_ID=${seekerRetailAnnual}`,
    `PAYPAL_PLAN_ORACLE_RETAIL_MONTHLY_ID=${oracleRetailMonthly}`,
    `PAYPAL_PLAN_ORACLE_RETAIL_ANNUAL_ID=${oracleRetailAnnual}`,
  ].join("\n") + "\n";

  const fs = await import("fs");
  fs.writeFileSync("/home/ubuntu/lifeos/scripts/paypal-plan-ids.env", output);
  console.log("\n✓ Plan IDs written to scripts/paypal-plan-ids.env");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
