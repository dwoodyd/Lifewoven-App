import { readFileSync } from "node:fs";

const reportFile = process.argv[2] ?? "lighthouse-root-after-split.json";
const report = JSON.parse(readFileSync(new URL(`./${reportFile}`, import.meta.url), "utf8"));
const audit = report.audits["color-contrast"];
const failures = audit.details.items.map((item) => ({
  selector: item.node.selector,
  snippet: item.node.snippet,
  explanation: item.node.explanation,
}));
console.log(JSON.stringify({ score: audit.score, failures }, null, 2));
