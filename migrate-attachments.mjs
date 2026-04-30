import { createConnection } from "mysql2/promise";
import { readFileSync } from "fs";
import { config } from "dotenv";
config();

const sql = readFileSync("./drizzle/0017_thankful_white_queen.sql", "utf8");
const statements = sql.split("--> statement-breakpoint").map(s => s.trim()).filter(Boolean);

const conn = await createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

let ok = 0, skip = 0;
for (const stmt of statements) {
  try {
    await conn.execute(stmt);
    ok++;
    console.log("✓", stmt.slice(0, 60));
  } catch (e) {
    if (e.code === "ER_TABLE_EXISTS_ERROR" || e.code === "ER_DUP_KEYNAME" || e.message?.includes("Duplicate")) {
      skip++;
      console.log("⚠ skip (already exists):", stmt.slice(0, 60));
    } else {
      console.error("✗ FAILED:", e.message, "\n  SQL:", stmt.slice(0, 120));
    }
  }
}
await conn.end();
console.log(`\nDone: ${ok} applied, ${skip} skipped.`);
