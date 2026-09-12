import { execSync } from "child_process";
import fs from "fs";

function run(cmd: string) {
  return execSync(cmd, {
    cwd: process.cwd(),
    encoding: "utf-8",
    env: { ...process.env, GIT_PAGER: "cat", PAGER: "cat" },
    maxBuffer: 10 * 1024 * 1024,
  });
}

console.log("=== 1. GIT STATUS ===");
console.log(run("git status --short"));

console.log("\n=== 2. RECENT COMMITS (ONELINE) ===");
console.log(run("git log -n 25 --oneline"));

console.log("\n=== 3. TRACKED WEBSITE BUILDER FILES ===");
const patterns = [
  "components/site/**",
  "components/website-builder/**",
  "lib/website-builder/**",
  "contexts/EditableContentContext.tsx",
  "app/site/**",
  "app/admin/**/website-builder/**",
  "prisma/**",
  "tests/**",
];

const trackedFiles = run(`git ls-files ${patterns.map(p => `"${p}"`).join(" ")}`)
  .split("\n")
  .map(s => s.trim())
  .filter(Boolean)
  .sort();

console.log(`Total tracked files in builder scope: ${trackedFiles.length}`);

fs.writeFileSync("scratch/tracked-files-inventory.json", JSON.stringify(trackedFiles, null, 2));

console.log("\n=== 4. PRISMA SCHEMA FOR WEBSITE BUILDER ===");
if (fs.existsSync("prisma/schema.prisma")) {
  const schema = fs.readFileSync("prisma/schema.prisma", "utf-8");
  const modelMatches = schema.match(/model\s+(\w+)\s*\{[\s\S]*?\}/g) || [];
  const websiteModels = modelMatches.filter(m => 
    m.toLowerCase().includes("website") || 
    m.toLowerCase().includes("section") || 
    m.toLowerCase().includes("template") ||
    m.toLowerCase().includes("store")
  );
  console.log("Relevant Models in schema.prisma:");
  websiteModels.forEach(m => {
    const nameMatch = m.match(/model\s+(\w+)/);
    console.log(`- ${nameMatch ? nameMatch[1] : "Unknown"}`);
  });
}
