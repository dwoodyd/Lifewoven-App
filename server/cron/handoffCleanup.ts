import cron from "node-cron";
import { getDb } from "../db";
import { authHandoffCodes } from "../../drizzle/schema";
import { lt } from "drizzle-orm";

/**
 * Nightly cleanup of expired one-time auth handoff codes.
 * These codes are created during cross-domain OAuth login and expire after 5 minutes.
 * Without cleanup they accumulate indefinitely.
 */
async function cleanupExpiredHandoffCodes() {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  const result = await db
    .delete(authHandoffCodes)
    .where(lt(authHandoffCodes.expiresAt, now));

  const deleted = (result as any)?.[0]?.affectedRows ?? 0;
  if (deleted > 0) {
    console.log(`[HandoffCleanup] Deleted ${deleted} expired auth handoff code(s).`);
  } else {
    console.log("[HandoffCleanup] No expired handoff codes to clean up.");
  }
}

export function startHandoffCleanupCron() {
  // Every night at 2:00 AM UTC
  cron.schedule("0 2 * * *", async () => {
    console.log("[HandoffCleanup] Running nightly cleanup...");
    try {
      await cleanupExpiredHandoffCodes();
    } catch (e) {
      console.error("[HandoffCleanup] Cron error:", e);
    }
  });
  console.log("[HandoffCleanup] Cron scheduled: nightly at 2:00 AM UTC");
}
