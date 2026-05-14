/**
 * Founding Member Lifecycle Cron
 *
 * Runs daily at 9:00 AM UTC.
 * Sends timed emails to founding members based on days since betaStartDate:
 *   Day 0  → Welcome (sent immediately on redeem, not here)
 *   Day 3  → Day-3 Check-in
 *   Day 7  → Day-7 Recap
 *   Day 30 → Day-30 Milestone
 *   Day 75 → Founder Note (soft upgrade nudge)
 *   Day 91 → Transition (beta ended, choose your plan)
 *
 * Uses the `events` table to track which emails have been sent (event = 'founding_email_dayN')
 * so emails are never sent twice even if the cron runs multiple times.
 */
import cron from "node-cron";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq, sql, and, isNotNull } from "drizzle-orm";
import {
  sendDay3CheckinEmail,
  sendDay7RecapInactive,
  sendDay30MilestoneEmail,
  sendDay75FounderNote,
  sendDay91TransitionNotice,
} from "../email";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Returns how many full days have elapsed since a UTC timestamp */
function daysSince(tsMs: number): number {
  return Math.floor((Date.now() - tsMs) / DAY_MS);
}

/** Checks whether an event has already been recorded for this user */
async function hasEvent(db: any, userId: number, event: string): Promise<boolean> {
  const rows = await db.execute(
    sql`SELECT 1 FROM events WHERE userId = ${userId} AND event = ${event} LIMIT 1`
  ) as any;
  const list = rows[0] as any[];
  return Array.isArray(list) && list.length > 0;
}

/** Records an event so the email is never sent twice */
async function recordEvent(db: any, userId: number, event: string): Promise<void> {
  await db.execute(
    sql`INSERT IGNORE INTO events (userId, event, createdAt) VALUES (${userId}, ${event}, ${Date.now()})`
  );
}

interface LifecycleEmail {
  day: number;
  event: string;
  send: (name: string, email: string) => Promise<unknown>;
}

const LIFECYCLE_EMAILS: LifecycleEmail[] = [
  { day: 3,  event: "founding_email_day3",  send: (n, e) => sendDay3CheckinEmail({ to: e, name: n }) },
  { day: 7,  event: "founding_email_day7",  send: (n, e) => sendDay7RecapInactive({ to: e, name: n }) },
  { day: 30, event: "founding_email_day30", send: (n, e) => sendDay30MilestoneEmail({ to: e, name: n, auditCompleted: false, recommendedPathway: undefined, weaveEntries: 0, checkinCount: 0, pathwaysTried: 0, returnsAfterGap: 0, dynamicInsight: undefined }) },
  { day: 75, event: "founding_email_day75", send: (n, e) => sendDay75FounderNote({ to: e, name: n }) },
  { day: 91, event: "founding_email_day91", send: (n, e) => sendDay91TransitionNotice({ to: e, name: n }) },
];

async function runFoundingLifecycle() {
  const db = await getDb();
  if (!db) return;

  // Fetch all founding members who have a betaStartDate and are still in beta
  const foundingMembers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      betaStartDate: users.betaStartDate,
      billingStatus: users.billingStatus,
    })
    .from(users)
    .where(
      and(
        eq(users.foundingMember, true),
        isNotNull(users.betaStartDate),
      )
    );

  let sent = 0;
  let skipped = 0;

  for (const member of foundingMembers) {
    if (!member.email || !member.betaStartDate) { skipped++; continue; }

    const days = daysSince(Number(member.betaStartDate));

    for (const lifecycle of LIFECYCLE_EMAILS) {
      // Only send if today is on or after the target day
      if (days < lifecycle.day) continue;

      // Skip if already sent
      const alreadySent = await hasEvent(db, member.id, lifecycle.event);
      if (alreadySent) continue;

      // Skip Day-91 transition if user has already subscribed
      if (lifecycle.day === 91 && member.billingStatus === "active") {
        await recordEvent(db, member.id, lifecycle.event); // mark as handled
        continue;
      }

      try {
        await lifecycle.send(member.name ?? "friend", member.email);
        await recordEvent(db, member.id, lifecycle.event);
        console.log(`[FoundingLifecycle] Sent day-${lifecycle.day} email to user ${member.id} (${member.email})`);
        sent++;
      } catch (err) {
        console.error(`[FoundingLifecycle] Failed day-${lifecycle.day} email for user ${member.id}:`, err);
      }
    }
  }

  console.log(`[FoundingLifecycle] Done — sent: ${sent}, skipped: ${skipped}`);
}

export function startFoundingLifecycleCron() {
  // Run daily at 9:00 AM UTC
  cron.schedule("0 9 * * *", async () => {
    console.log("[FoundingLifecycle] Running daily lifecycle check...");
    try {
      await runFoundingLifecycle();
    } catch (e) {
      console.error("[FoundingLifecycle] Cron error:", e);
    }
  });
  console.log("[FoundingLifecycle] Cron scheduled: daily at 9:00 AM UTC");
}
