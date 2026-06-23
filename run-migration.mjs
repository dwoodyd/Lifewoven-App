import { readFileSync } from "fs";
import { createConnection } from "mysql2/promise";

const sql = readFileSync("./drizzle/0030_clean_trauma.sql", "utf8");
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL not set");

const conn = await createConnection(url);

// Split on the drizzle statement breakpoint marker and run each statement
const statements = sql
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

for (const stmt of statements) {
  try {
    await conn.execute(stmt);
    console.log("✓", stmt.slice(0, 60).replace(/\n/g, " "));
  } catch (err) {
    if (err.code === "ER_TABLE_EXISTS_ERROR" || err.code === "ER_DUP_KEYNAME") {
      console.log("⚠ already exists, skipping:", stmt.slice(0, 60).replace(/\n/g, " "));
    } else {
      console.error("✗ FAILED:", err.message, "\nStatement:", stmt.slice(0, 120));
    }
  }
}

await conn.end();
console.log("Migration complete.");
