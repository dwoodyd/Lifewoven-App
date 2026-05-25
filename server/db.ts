import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, authHandoffCodes, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Auth Handoff Code helpers ───────────────────────────────────────────────

/** Create a one-time handoff code valid for 5 minutes. */
export async function createHandoffCode(opts: {
  code: string;
  openId: string;
  name: string | null;
  returnPath: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("[Database] Cannot create handoff code: database not available");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  await db.insert(authHandoffCodes).values({
    code: opts.code,
    openId: opts.openId,
    name: opts.name,
    returnPath: opts.returnPath,
    expiresAt,
  });
}

/** Consume a handoff code (returns null if missing, expired, or already used). */
export async function consumeHandoffCode(code: string): Promise<{ openId: string; name: string | null; returnPath: string } | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(authHandoffCodes).where(eq(authHandoffCodes.code, code)).limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.usedAt) return null;          // already consumed
  if (row.expiresAt < new Date()) return null; // expired
  // Mark as used
  await db.update(authHandoffCodes).set({ usedAt: new Date() }).where(eq(authHandoffCodes.code, code));
  return { openId: row.openId, name: row.name ?? null, returnPath: row.returnPath };
}

// TODO: add feature queries here as your schema grows.
