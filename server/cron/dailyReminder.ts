import cron from "node-cron";
import webpush from "web-push";
import { and, eq } from "drizzle-orm";
import { pushSubscriptions } from "../../drizzle/schema";
import { getDb } from "../db";

function currentLocalTime(timezone: string): string | null {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    const hour = parts.find(p => p.type === "hour")?.value;
    const minute = parts.find(p => p.type === "minute")?.value;
    return hour && minute ? `${hour}:${minute}` : null;
  } catch { return null; }
}

export async function runDailyReminderDispatch(): Promise<void> {
  const db = await getDb();
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!db || !publicKey || !privateKey) return;
  webpush.setVapidDetails("mailto:hello@lifewoven.click", publicKey, privateKey);
  const subscriptions = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.enabled, true));
  for (const subscription of subscriptions) {
    if (currentLocalTime(subscription.timezone) !== subscription.reminderTime) continue;
    try {
      await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, JSON.stringify({ title: "Lifewoven", body: "A small return to The Ground can change the shape of your day.", url: "/ground/enter" }));
    } catch (error: any) {
      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await db.update(pushSubscriptions).set({ enabled: false }).where(and(eq(pushSubscriptions.id, subscription.id), eq(pushSubscriptions.userId, subscription.userId)));
      } else console.error("[DailyReminder] Delivery failed", subscription.id, error);
    }
  }
}

export function startDailyReminderCron(): void {
  cron.schedule("* * * * *", () => void runDailyReminderDispatch());
  console.log("[DailyReminder] Cron scheduled: every minute with per-user local-time matching");
}
