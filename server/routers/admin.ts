import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, orders, journalEntries, communityPosts, enrollments, habits, auditResults, products, subscriptionPlans } from "../../drizzle/schema";
import { desc, count, sql, asc } from "drizzle-orm";
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
      paypalCaptureId: orders.paypalCaptureId,
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

  // ── Products CRUD ────────────────────────────────────────────────────────────
  listProducts: adminProcedure.query(async () => {
    const db = await requireDb();
    return db.select().from(products).orderBy(asc(products.id));
  }),

  createProduct: adminProcedure
    .input(z.object({
      slug: z.string().min(1).max(128),
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      type: z.enum(["course", "workbook", "card_deck", "audio_bundle", "planner", "guide"]),
      price: z.string().regex(/^\d+(\.\d{1,2})?$/),
      thumbnailUrl: z.string().url().optional().or(z.literal("")),
      downloadUrl: z.string().url().optional().or(z.literal("")),
      isPublished: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      await db.insert(products).values({
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        type: input.type,
        price: input.price as unknown as string,
        thumbnailUrl: input.thumbnailUrl || null,
        downloadUrl: input.downloadUrl || null,
        isPublished: input.isPublished,
      });
      return { success: true };
    }),

  updateProduct: adminProcedure
    .input(z.object({
      id: z.number(),
      slug: z.string().min(1).max(128).optional(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      type: z.enum(["course", "workbook", "card_deck", "audio_bundle", "planner", "guide"]).optional(),
      price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
      thumbnailUrl: z.string().url().optional().or(z.literal("")),
      downloadUrl: z.string().url().optional().or(z.literal("")),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      const { id, ...rest } = input;
      const updates: Record<string, unknown> = {};
      if (rest.slug !== undefined) updates.slug = rest.slug;
      if (rest.title !== undefined) updates.title = rest.title;
      if (rest.description !== undefined) updates.description = rest.description;
      if (rest.type !== undefined) updates.type = rest.type;
      if (rest.price !== undefined) updates.price = rest.price;
      if (rest.thumbnailUrl !== undefined) updates.thumbnailUrl = rest.thumbnailUrl || null;
      if (rest.downloadUrl !== undefined) updates.downloadUrl = rest.downloadUrl || null;
      if (rest.isPublished !== undefined) updates.isPublished = rest.isPublished;
      await db.update(products).set(updates).where(eq(products.id, id));
      return { success: true };
    }),

  deleteProduct: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),

  // ── Subscription Plans CRUD ──────────────────────────────────────────────────
  listPlans: adminProcedure.query(async () => {
    const db = await requireDb();
    return db.select().from(subscriptionPlans).orderBy(asc(subscriptionPlans.sortOrder));
  }),

  createPlan: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(128),
      tier: z.enum(["explorer", "seeker", "oracle"]),
      billingInterval: z.enum(["monthly", "annual"]),
      priceUsd: z.string().regex(/^\d+(\.\d{1,2})?$/),
      retailPriceUsd: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
      paypalPlanId: z.string().max(64).optional(),
      isFoundingRate: z.boolean().default(false),
      isActive: z.boolean().default(true),
      features: z.array(z.string()).default([]),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      await db.insert(subscriptionPlans).values({
        name: input.name,
        tier: input.tier,
        billingInterval: input.billingInterval,
        priceUsd: input.priceUsd as unknown as string,
        retailPriceUsd: (input.retailPriceUsd ?? null) as unknown as string | null,
        paypalPlanId: input.paypalPlanId ?? null,
        isFoundingRate: input.isFoundingRate,
        isActive: input.isActive,
        features: input.features,
        sortOrder: input.sortOrder,
      });
      return { success: true };
    }),

  updatePlan: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(128).optional(),
      tier: z.enum(["explorer", "seeker", "oracle"]).optional(),
      billingInterval: z.enum(["monthly", "annual"]).optional(),
      priceUsd: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
      retailPriceUsd: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().or(z.literal("")),
      paypalPlanId: z.string().max(64).optional().or(z.literal("")),
      isFoundingRate: z.boolean().optional(),
      isActive: z.boolean().optional(),
      features: z.array(z.string()).optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      const { id, ...rest } = input;
      const updates: Record<string, unknown> = {};
      if (rest.name !== undefined) updates.name = rest.name;
      if (rest.tier !== undefined) updates.tier = rest.tier;
      if (rest.billingInterval !== undefined) updates.billingInterval = rest.billingInterval;
      if (rest.priceUsd !== undefined) updates.priceUsd = rest.priceUsd;
      if (rest.retailPriceUsd !== undefined) updates.retailPriceUsd = rest.retailPriceUsd || null;
      if (rest.paypalPlanId !== undefined) updates.paypalPlanId = rest.paypalPlanId || null;
      if (rest.isFoundingRate !== undefined) updates.isFoundingRate = rest.isFoundingRate;
      if (rest.isActive !== undefined) updates.isActive = rest.isActive;
      if (rest.features !== undefined) updates.features = rest.features;
      if (rest.sortOrder !== undefined) updates.sortOrder = rest.sortOrder;
      await db.update(subscriptionPlans).set(updates).where(eq(subscriptionPlans.id, id));
      return { success: true };
    }),

  deletePlan: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, input.id));
      return { success: true };
    }),
});
