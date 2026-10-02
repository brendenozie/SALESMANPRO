const path = require("path");
const fs = require("fs");

// Read and parse all maps
const aliasesFile = fs.readFileSync(path.join(__dirname, "../lib/website-builder/registry/aliases.ts"), "utf-8");
const siteBodyCompFile = fs.readFileSync(path.join(__dirname, "../components/site/layouts/siteBodyComponentMap.ts"), "utf-8");
const bodyCompMapFile = fs.readFileSync(path.join(__dirname, "../components/site/BodyComponentMap.tsx"), "utf-8");
const catHeaderFooterFile = fs.readFileSync(path.join(__dirname, "../components/site/layouts/categoryHeaderFooterLayoutMap.ts"), "utf-8");

// Load dumped templates
const dumpScript = require("./dump-templates.js");

console.log("\n=== COMPARING TEMPLATES TO BODY COMPONENT MAP & LAYOUT MAP ===");
// Let's verify every template's bodyComponent exists in BodyComponentMap.tsx
// and shellLayout exists in categoryHeaderFooterLayoutMap.ts
