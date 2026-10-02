const path = require("path");
const fs = require("fs");

const chfContent = fs.readFileSync(path.join(__dirname, "../components/site/layouts/categoryHeaderFooterLayoutMap.ts"), "utf-8");
const dumpScript = require("./dump-templates.js");

const registryDir = path.join(__dirname, "../lib/website-builder/registry");
const files = fs.readdirSync(registryDir).filter(f => f.endsWith(".ts") && f !== "aliases.ts" && f !== "helpers.ts");

const templates = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(registryDir, file), "utf-8");
  const idRegex = /id:\s*["']([^"']+)["'],\s*\n\s*version:\s*["']([^"']+)["'],\s*\n\s*name:\s*["']([^"']+)["'],/g;
  let match;
  while ((match = idRegex.exec(content)) !== null) {
    const id = match[1];
    const name = match[3];

    const blockStart = match.index;
    const block = content.slice(blockStart, blockStart + 800);

    const catMatch = block.match(/category:\s*["']([^"']+)["']/);
    const varMatch = block.match(/variant:\s*["']([^"']+)["']/);
    const shellMatch = block.match(/shellLayout:\s*["']([^"']+)["']/);
    const bodyMatch = block.match(/bodyComponent:\s*["']([^"']+)["']/);

    templates.push({
      id,
      name,
      shellLayout: shellMatch ? shellMatch[1] : "",
      bodyComponent: bodyMatch ? bodyMatch[1] : "",
    });
  }
}

console.log("\n--- AUDITING ALL 56 SHELL LAYOUTS IN categoryHeaderFooterLayoutMap ---");
const missingShells = [];
for (const t of templates) {
  // Check if shellLayout is in categoryHeaderFooterLayoutMap
  const hasShell = chfContent.includes(`"${t.shellLayout}"`) || chfContent.includes(`'${t.shellLayout}'`) || chfContent.includes(`${t.shellLayout}:`);
  if (!hasShell) {
    missingShells.push({ id: t.id, shellLayout: t.shellLayout });
    console.log(`❌ MISSING SHELL: [${t.id}] -> shellLayout "${t.shellLayout}" not found in categoryHeaderFooterLayoutMap!`);
  } else {
    // console.log(`✅ Shell found: [${t.id}] -> ${t.shellLayout}`);
  }
}

console.log(`Total missing shells: ${missingShells.length}`);
