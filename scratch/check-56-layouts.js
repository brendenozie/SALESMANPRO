const path = require("path");
const fs = require("fs");

const registryDir = path.join(__dirname, "../lib/website-builder/registry");
const files = fs.readdirSync(registryDir).filter(f => f.endsWith(".ts") && f !== "aliases.ts" && f !== "helpers.ts");
const layoutsDir = path.join(__dirname, "../components/site/layouts");

for (const file of files) {
  const content = fs.readFileSync(path.join(registryDir, file), "utf-8");
  const idMatch = content.match(/id:\s*["']([^"']+)["']/);
  const shellMatch = content.match(/shellLayout:\s*["']([^"']+)["']/);
  if (idMatch && shellMatch) {
    const id = idMatch[1];
    const shell = shellMatch[1];
    const layoutPath = path.join(layoutsDir, shell);
    if (!fs.existsSync(layoutPath)) {
      console.log("LAYOUT DIR DOES NOT EXIST:", id, shell);
    } else {
      const dirFiles = fs.readdirSync(layoutPath);
      const hasIndex = fs.existsSync(path.join(layoutPath, "index.tsx")) || 
                       fs.existsSync(path.join(layoutPath, `${shell}.tsx`)) ||
                       fs.existsSync(path.join(layoutPath, "Layout.tsx"));
      if (!hasIndex) {
        console.log("NO index.tsx or Layout.tsx in:", id, shell, "Found files:", dirFiles);
      }
    }
  }
}
