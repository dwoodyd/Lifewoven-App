import { readFileSync } from "node:fs";

const reportFile = process.argv[2] ?? "lighthouse-root.json";
const report = JSON.parse(readFileSync(new URL(`./${reportFile}`, import.meta.url), "utf8"));
const categories = Object.fromEntries(
  Object.entries(report.categories).map(([id, category]) => [id, Math.round(category.score * 100)]),
);
const failingAudits = Object.values(report.audits)
  .filter((audit) => audit.scoreDisplayMode !== "notApplicable" && audit.score !== null && audit.score < 1)
  .map((audit) => ({ id: audit.id, score: audit.score, title: audit.title, displayValue: audit.displayValue ?? null }))
  .sort((a, b) => a.score - b.score || a.id.localeCompare(b.id));

console.log(JSON.stringify({ categories, failingAudits }, null, 2));
