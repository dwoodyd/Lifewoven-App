/**
 * Vitest global setup.
 *
 * Loads the committed sandbox PayPal plan IDs (scripts/paypal-plan-ids.env) into
 * process.env so the suite is self-contained on a fresh clone / in CI, where the
 * hosting platform's injected secrets are not present. Existing env vars are never
 * overwritten, so a real deployment environment keeps its own values.
 */
import { config } from "dotenv";
import path from "path";

config({
  path: path.resolve(import.meta.dirname, "..", "scripts", "paypal-plan-ids.env"),
  override: false,
  quiet: true,
});
