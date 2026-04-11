import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, orders, journalEntries, communityPosts, enrollments, habits, auditResults } from "../../drizzle/schema";
import { desc, count, sql } from "drizzle-orm";
import { z } from "zod";
import { eq } from "drizzle-orm";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db;
}

export const adminRouter = router({
  stats: adminProcedure.query(async () => {
    const db = await requireDb();
    const [
      [{ total: totalUsers }],
      [{ total: totalOrders }],
      [{ total: totalJournalEntries }],
      [{ total: totalPosts }],
      [{ total: totalEnrollments }],
      recentUsers,
      recentOrders,
    ] = await Promise.all([
      db.select({ total: count() }).from(users),
      db.select({ total: count() }).from(orders),
      db.select({ total: count() }).from(journalEntries),
      db.select({ total: count() }).from(communityPosts),
      db.select({ total: count() }).from(enrollments),
      db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
        .from(users).orderBy(desc(users.createdAt)).limit(10),
      db.select({ id: orders.id, userId: orders.userId, total: orders.total, status: orders.status, productSlug: orders.productSlug, createdAt: orders.createdAt })
        .from(orders).orderBy(desc(orders.createdAt)).limit(10),
    ]);
    return {
      totalUsers,
      totalOrders,
      totalJournalEntries,
      totalPosts,
      totalEnrollments,
      recentUsers,
      recentOrders,
    };
  }),

  users: adminProcedure.query(async () => {
    const db = await requireDb();
    return db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt)).limit(100);
  }),

  setUserRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
      return { success: true };
    }),

  orders: adminProcedure.query(async () => {
    const db = await requireDb();
    return db.select({
      id: orders.id,
      userId: orders.userId,
      total: orders.total,
      status: orders.status,
      productSlug: orders.productSlug,
      downloadUrl: orders.downloadUrl,
      stripeSessionId: orders.stripeSessionId,
      createdAt: orders.createdAt,
    }).from(orders).orderBy(desc(orders.createdAt)).limit(200);
  }),

  contentHealth: adminProcedure.query(async () => {
    const db = await requireDb();
    const [
      [{ total: auditCount }],
      [{ total: habitCount }],
      [{ total: enrollCount }],
    ] = await Promise.all([
      db.select({ total: count() }).from(auditResults),
      db.select({ total: count() }).from(habits),
      db.select({ total: count() }).from(enrollments),
    ]);
    return {
      auditResultsCount: auditCount,
      habitsCount: habitCount,
      enrollmentsCount: enrollCount,
    };
  }),
});
