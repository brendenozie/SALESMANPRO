const path = require("path");
const fs = require("fs");

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
      file,
      id,
      version,
      name,
      category: catMatch ? catMatch[1] : "",
      variant: varMatch ? varMatch[1] : "",
      shellLayout: shellMatch ? shellMatch[1] : "",
      bodyComponent: bodyMatch ? bodyMatch[1] : "",
    });
  }
}

console.log(`Total templates parsed: ${templates.length}`);
templates.forEach((t, i) => {
  console.log(`${i+1}. [${t.id}] ${t.name} -> Cat: "${t.category}", Var: "${t.variant}", Shell: "${t.shellLayout}", Body: "${t.bodyComponent}"`);
});
