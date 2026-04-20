import cron from "node-cron";
import { getDb } from "../db";
import { betaAccess, events, users } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

async function checkBetaExpiringSoon() {
  const db = await getDb();
  if (!db) return;
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const soon = now + sevenDaysMs;

  const rows = await db.execute(
    sql`SELECT ba.userId, ba.expiresAt, u.name, u.email
        FROM beta_access ba
        JOIN users u ON u.id = ba.userId
        WHERE ba.expiresAt > ${now} AND ba.expiresAt <= ${soon}
          AND NOT EXISTS (
            SELECT 1 FROM events e
            WHERE e.userId = ba.userId AND e.event = 'beta_converted'
          )`
  ) as any;

  const expiring = rows[0] as any[];
  if (!expiring || expiring.length === 0) {
    console.log("[BetaExpiryCheck] No users expiring in 7 days.");
    return;
  }

  const names = expiring
    .map((r: any) => `${r.name ?? "Unknown"} (${r.email ?? ""}) — expires ${new Date(Number(r.expiresAt)).toLocaleDateString()}`)
    .join("\n");

  await notifyOwner({
    title: `⏰ ${expiring.length} Beta Trial${expiring.length > 1 ? "s" : ""} Expiring in 7 Days`,
    content: `The following beta users haven't converted yet and expire soon:\n\n${names}\n\nConsider reaching out personally.`,
  }).catch(() => {});

  console.log(`[BetaExpiryCheck] Notified about ${expiring.length} expiring users.`);
}

export function startBetaExpiryCheckCron() {
  // Every Monday at 9:00 AM UTC
  cron.schedule("0 9 * * 1", async () => {
    console.log("[BetaExpiryCheck] Running Monday expiry check...");
    try {
      await checkBetaExpiringSoon();
    } catch (e) {
      console.error("[BetaExpiryCheck] Cron error:", e);
    }
  });
  console.log("[BetaExpiryCheck] Cron scheduled: Mondays at 9:00 AM UTC");
}
