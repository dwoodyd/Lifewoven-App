import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const baseUrl = process.env.LOAD_TEST_BASE_URL ?? "http://127.0.0.1:3000";
const sessionToken = process.env.LOAD_TEST_SESSION_TOKEN;
const outputDir = process.env.LOAD_TEST_OUTPUT_DIR ?? join(process.cwd(), "validation", "load-test-results");
const includeAi = process.env.LOAD_TEST_INCLUDE_AI === "1";
if (!sessionToken) throw new Error("LOAD_TEST_SESSION_TOKEN is required");
if (!/^https?:\/\//.test(baseUrl)) throw new Error("LOAD_TEST_BASE_URL must be an http(s) URL");

mkdirSync(outputDir, { recursive: true });
const cookie = `app_session_id=${sessionToken}`;
const dashboardInput = encodeURIComponent(JSON.stringify({ "0": { json: null } }));
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

const scenarios = [
  { name: "dashboard-c10", method: "GET", path: `/api/trpc/profile.dashboard?batch=1&input=${dashboardInput}`, connections: 10, amount: 150 },
  { name: "dashboard-c25", method: "GET", path: `/api/trpc/profile.dashboard?batch=1&input=${dashboardInput}`, connections: 25, amount: 150 },
  { name: "dashboard-c50", method: "GET", path: `/api/trpc/profile.dashboard?batch=1&input=${dashboardInput}`, connections: 50, amount: 150 },
  { name: "dashboard-c75", method: "GET", path: `/api/trpc/profile.dashboard?batch=1&input=${dashboardInput}`, connections: 75, amount: 150 },
  { name: "checkin-c10", method: "POST", path: "/api/trpc/checkIn.create", connections: 10, amount: 40, body: JSON.stringify({ json: { emotionalScore: 7, energyLevel: 7, clarityLevel: 7, note: "Staging load test", module: "load" } }) },
  ...(includeAi ? [{ name: "ai-journal-prompt-c4", method: "POST", path: "/api/trpc/journal.generatePrompt", connections: 4, amount: 4, body: JSON.stringify({ json: { module: "staging", pathway: "align", recentEntries: ["Staging load test request"] } }) }] : []),
];

function runScenario(scenario, scenarioIndex) {
  const file = join(outputDir, `${timestamp}-${scenario.name}.json`);
  const args = [
    "dlx", "autocannon",
    "--json",
    "--connections", String(scenario.connections),
    ...(scenario.duration ? ["--duration", String(scenario.duration)] : ["--amount", String(scenario.amount)]),
    "--method", scenario.method,
    "--headers", `cookie=${cookie}`,
    "--headers", `x-forwarded-for=203.0.113.${10 + scenarioIndex}`,
    "--headers", "content-type=application/json",
    "--headers", "accept=application/json",
    ...(scenario.body ? ["--body", scenario.body] : []),
    `${baseUrl}${scenario.path}`,
  ];
  const result = spawnSync("pnpm", args, { cwd: process.cwd(), encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  writeFileSync(file, result.stdout || result.stderr || "");
  if (result.status !== 0) {
    throw new Error(`${scenario.name} failed with code ${result.status}; see ${file}`);
  }
  return { scenario: scenario.name, file };
}

const completed = scenarios.map(runScenario);
console.log(JSON.stringify({ baseUrl, includeAi, completed }, null, 2));
