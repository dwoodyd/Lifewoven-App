/**
 * Creates Lifewoven subscription products and plans in the PayPal LIVE environment.
 * Run once: node scripts/create-paypal-live-plans.mjs
 */

const CLIENT_ID = "AcEz5a9K-AUQ9R4-L5TEKtItYbI-Nc_0FrsQVOTbgTl-da2mAdYWzte5v1DLHxfLAmz7LCKPScdk9XFR";
const CLIENT_SECRET = "EIgkiwbJ5SW4CbREUBJr_kzAUcTrxrWf1MAecv56D5YnagWBndZEVh73YZ66PMSpyR0qQsBZ2UxPB8rf";
const BASE = "https://api-m.paypal.com";

async function getToken() {
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get token: " + JSON.stringify(data));
  return data.access_token;
}

async function pp(token, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal error ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

const PLANS = [
  // Seeker Founding
  { key: "PAYPAL_LIVE_PLAN_SEEKER_FOUNDING_MONTHLY_ID", name: "Seeker — Founding Monthly", interval: "MONTH", cycles: 1, amount: "9.00" },
  { key: "PAYPAL_LIVE_PLAN_SEEKER_FOUNDING_ANNUAL_ID",  name: "Seeker — Founding Annual",  interval: "YEAR",  cycles: 1, amount: "89.00" },
  // Oracle Founding
  { key: "PAYPAL_LIVE_PLAN_ORACLE_FOUNDING_MONTHLY_ID", name: "Oracle — Founding Monthly", interval: "MONTH", cycles: 1, amount: "25.00" },
  { key: "PAYPAL_LIVE_PLAN_ORACLE_FOUNDING_ANNUAL_ID",  name: "Oracle — Founding Annual",  interval: "YEAR",  cycles: 1, amount: "249.00" },
  // Seeker Retail
  { key: "PAYPAL_LIVE_PLAN_SEEKER_RETAIL_MONTHLY_ID",   name: "Seeker — Retail Monthly",   interval: "MONTH", cycles: 1, amount: "19.00" },
  { key: "PAYPAL_LIVE_PLAN_SEEKER_RETAIL_ANNUAL_ID",    name: "Seeker — Retail Annual",    interval: "YEAR",  cycles: 1, amount: "189.00" },
  // Oracle Retail
  { key: "PAYPAL_LIVE_PLAN_ORACLE_RETAIL_MONTHLY_ID",   name: "Oracle — Retail Monthly",   interval: "MONTH", cycles: 1, amount: "49.00" },
  { key: "PAYPAL_LIVE_PLAN_ORACLE_RETAIL_ANNUAL_ID",    name: "Oracle — Retail Annual",    interval: "YEAR",  cycles: 1, amount: "479.00" },
];

async function main() {
  console.log("Getting live access token...");
  const token = await getToken();
  console.log("Token obtained.\n");

  // Create one product for Lifewoven
  console.log("Creating Lifewoven product...");
  const product = await pp(token, "/v1/catalogs/products", {
    name: "Lifewoven Membership",
    description: "Personal transformation platform — Seeker and Oracle membership tiers",
    type: "SERVICE",
    category: "SOFTWARE",
    home_url: "https://app.lifewoven.click",
  });
  const productId = product.id;
  console.log(`Product created: ${productId}\n`);

  const results = {};

  for (const plan of PLANS) {
    console.log(`Creating plan: ${plan.name}...`);
    const created = await pp(token, "/v1/billing/plans", {
      product_id: productId,
      name: `Lifewoven: ${plan.name}`,
      description: `Lifewoven ${plan.name} subscription`,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: { interval_unit: plan.interval, interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // infinite
          pricing_scheme: {
            fixed_price: { value: plan.amount, currency_code: "USD" },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
    });
    results[plan.key] = created.id;
    console.log(`  ✓ ${plan.key}=${created.id}`);
  }

  console.log("\n=== LIVE PLAN IDs (add to Secrets) ===");
  for (const [key, val] of Object.entries(results)) {
    console.log(`${key}=${val}`);
  }
  console.log("\nProduct ID:", productId);
}

main().catch((err) => { console.error(err); process.exit(1); });
