const path = require("path");
const fs = require("fs");

const dumpScript = require("./dump-templates.js");

const layoutsDir = path.join(__dirname, "../components/site/layouts");

// Map of all 56 templates
// We want to check each bodyComponent file
const registryDir = path.join(__dirname, "../lib/website-builder/registry");
const files = fs.readdirSync(registryDir).filter(f => f.endsWith(".ts") && f !== "aliases.ts" && f !== "helpers.ts");

const templates = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(registryDir, file), "utf-8");
  const idRegex = /id:\s*["']([^"']+)["'],\s*\n\s*version:\s*["']([^"']+)["'],\s*\n\s*name:\s*["']([^"']+)["'],/g;
  let match;
  while ((match = idRegex.exec(content)) !== null) {
    const id = match[1];
    const version = match[2];
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

// Find body component file for each template
const layoutFolders = fs.readdirSync(layoutsDir).filter(f => fs.statSync(path.join(layoutsDir, f)).isDirectory());

console.log(`Checking ${templates.length} templates...\n`);

let dynamicCount = 0;
let staticCount = 0;
let missingFileCount = 0;

templates.forEach((t, i) => {
  // Find where bodyComponent is defined
  let foundFile = null;
  let foundDir = null;

  for (const lf of layoutFolders) {
    const bodyDir = path.join(layoutsDir, lf, "body");
    if (fs.existsSync(bodyDir)) {
      const candidates = fs.readdirSync(bodyDir).filter(f => f.endsWith(".tsx") || f.endsWith(".jsx"));
      for (const c of candidates) {
        if (c.replace(/\.(tsx|jsx)$/, "") === t.bodyComponent) {
          foundFile = path.join(bodyDir, c);
          foundDir = lf;
          break;
        }
      }
    }
    if (foundFile) break;
  }

  if (!foundFile) {
    console.log(`❌ ${i+1}. [${t.id}] ${t.bodyComponent}: FILE NOT FOUND in any layout/body!`);
    missingFileCount++;
    return;
  }

  const fileContent = fs.readFileSync(foundFile, "utf-8");
  const usesThemeSectionContainer = fileContent.includes("ThemeSectionContainer");
  const handlesSectionsProp = fileContent.includes("pageData?.sections") || fileContent.includes("pageData.sections") || fileContent.includes("sections=");

  if (usesThemeSectionContainer) {
    dynamicCount++;
    // console.log(`✅ ${i+1}. [${t.id}] ${t.bodyComponent} uses ThemeSectionContainer`);
  } else {
    staticCount++;
    console.log(`⚠️ ${i+1}. [${t.id}] ${t.bodyComponent} (${foundDir}): DOES NOT use ThemeSectionContainer (handlesSectionsProp: ${handlesSectionsProp})`);
  }
});

console.log(`\nSummary:`);
console.log(`Dynamic (uses ThemeSectionContainer): ${dynamicCount}`);
console.log(`Static (does not use ThemeSectionContainer): ${staticCount}`);
console.log(`Missing file: ${missingFileCount}`);
