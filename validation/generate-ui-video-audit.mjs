import { readdirSync, readFileSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const registryPath = join(root, "client/src/data/lumin.ts");
const outputDir = join(root, "validation/ui-video-audit-2026-09-22");
const sheetDir = join(outputDir, "contact-sheets");
const baseUrl = "http://127.0.0.1:3000";

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path);
    return path;
  });
}

function safeFileName(value) {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "");
}

function run(command, args) {
  return spawnSync(command, args, { encoding: "utf8" });
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(sheetDir, { recursive: true });

const registry = readFileSync(registryPath, "utf8");
const entryPattern = new RegExp(
  String.raw`\{\s*id:\s*"([^"]+)",\s*url:\s*"([^"]+)",\s*action:\s*"([^"]+)",\s*role:\s*"([^"]+)",\s*duration:\s*(\d+)`,
  "gs",
);
const entries = [...registry.matchAll(entryPattern)].map((match) => ({
  id: match[1],
  url: match[2],
  action: match[3],
  role: match[4],
  declaredDuration: Number(match[5]),
}));

if (!entries.length) throw new Error("No Lumin video registry entries parsed.");

const scanRoots = [join(root, "client"), join(root, "shared")];
const sourceFiles = scanRoots.flatMap(walk).filter((path) => /\.(ts|tsx|html|css)$/i.test(path));
const literals = new Map();
for (const file of sourceFiles) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/(?:\/manus-storage\/|https?:\/\/[^"'`\s)]+\/)[^"'`\s)]+\.(?:mp4|mov|webm)(?:\?[^"'`\s)]*)?/gi)) {
    const url = match[0];
    const references = literals.get(url) ?? [];
    references.push(relative(root, file));
    literals.set(url, references);
  }
}

const registryUrls = new Set(entries.map((entry) => entry.url));
const unregisteredLiterals = [...literals.entries()]
  .filter(([url]) => !registryUrls.has(url))
  .map(([url, references]) => ({ url, references: [...new Set(references)].sort() }));

const report = [];
for (const entry of entries) {
  const filename = `${String(report.length + 1).padStart(2, "0")}-${safeFileName(entry.id)}.jpg`;
  const sheetPath = join(sheetDir, filename);
  const source = `${baseUrl}${entry.url}`;
  const probe = run("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_name,width,height", "-select_streams", "v:0", "-of", "json", source]);
  let probeData = null;
  try { probeData = JSON.parse(probe.stdout); } catch { /* included in failure details */ }
  const render = run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y", "-i", source,
    "-vf", "fps=1,scale=960:-2,tile=4x2:padding=4:color=black",
    "-frames:v", "1", sheetPath,
  ]);
  report.push({
    ...entry,
    source,
    contactSheet: relative(root, sheetPath),
    sourceReferences: [...new Set(literals.get(entry.url) ?? [])].sort(),
    probe: probeData,
    rendered: render.status === 0,
    failure: render.status === 0 ? null : (render.stderr || probe.stderr).trim(),
  });
}

const manifest = {
  createdAt: new Date().toISOString(),
  scope: "All video registry entries in client/src/data/lumin.ts plus direct literal video URL scan of client and shared source.",
  registryCount: report.length,
  directLiteralCount: literals.size,
  unregisteredLiterals,
  videos: report,
};
writeFileSync(join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2));
writeFileSync(join(outputDir, "README.md"), `# UI Video Audit Assets\n\nGenerated contact sheets for ${report.length} registered Lumin videos. Each sheet has eight one-second samples from its source video in reading order: left-to-right across the first row, then left-to-right across the second. The manifest records source paths, roles, static source references, probe data, and render outcomes.\n`);

const failed = report.filter((entry) => !entry.rendered);
console.log(JSON.stringify({ registryCount: report.length, directLiteralCount: literals.size, unregisteredLiterals, failed: failed.map(({ id, failure }) => ({ id, failure })) }, null, 2));
if (failed.length) process.exitCode = 1;
