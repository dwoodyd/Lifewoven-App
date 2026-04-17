import cron from "node-cron";
import { getDb } from "../db";
import { users, habitLogs, journalEntries, pathwaySessions, checkIns } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import { invokeLLM } from "../_core/llm";

async function sendWeeklyDigestForUser(user: { id: number; name: string | null; email: string | null }) {
  const db = await getDb();
  if (!db) return;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [habits, journals, sessions, checkins] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(habitLogs)
      .where(eq(habitLogs.userId, user.id)),
    db.select({ count: sql<number>`count(*)` }).from(journalEntries)
      .where(eq(journalEntries.userId, user.id)),
    db.select({ count: sql<number>`count(*)` }).from(pathwaySessions)
      .where(eq(pathwaySessions.userId, user.id)),
    db.select({ count: sql<number>`count(*)` }).from(checkIns)
      .where(eq(checkIns.userId, user.id)),
  ]);

  const habitCount = Number(habits[0]?.count ?? 0);
  const journalCount = Number(journals[0]?.count ?? 0);
  const sessionCount = Number(sessions[0]?.count ?? 0);
  const checkinCount = Number(checkins[0]?.count ?? 0);

  const llmResponse = await invokeLLM({
    messages: [
      { role: "system", content: "You are the Lifewoven Oracle writing a warm, brief (3 sentences max) weekly reflection for a user. Be specific, encouraging, and grounded." },
      { role: "user", content: `User: ${user.name ?? "friend"}. This week: ${habitCount} habit logs, ${journalCount} journal entries, ${sessionCount} pathway sessions, ${checkinCount} check-ins. Write a brief reflection.` },
    ],
  });
  const reflection = llmResponse.choices[0]?.message?.content ?? "Keep showing up. Every practice counts.";

  await notifyOwner({
    title: `Weekly Digest — ${user.name ?? user.email ?? "User"}`,
    content: `**${user.name ?? user.email ?? "User"}'s week:**\n- ${habitCount} habit completions\n- ${journalCount} journal entries\n- ${sessionCount} pathway sessions\n- ${checkinCount} check-ins\n\n**Oracle reflection:** ${reflection}`,
  });
}

export function startWeeklyDigestCron() {
  // Every Sunday at 8:00 AM UTC
  cron.schedule("0 8 * * 0", async () => {
    console.log("[WeeklyDigest] Running Sunday digest...");
    try {
      const db = await getDb();
      if (!db) return;
      const allUsers = await db.select({ id: users.id, name: users.name, email: users.email }).from(users);
      for (const user of allUsers) {
        try {
          await sendWeeklyDigestForUser(user);
        } catch (e) {
          console.error(`[WeeklyDigest] Failed for user ${user.id}:`, e);
        }
      }
      console.log(`[WeeklyDigest] Sent digests for ${allUsers.length} users.`);
    } catch (e) {
      console.error("[WeeklyDigest] Cron error:", e);
    }
  });
  console.log("[WeeklyDigest] Cron scheduled: Sundays at 8:00 AM UTC");
}
