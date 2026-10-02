const path = require("path");
const fs = require("fs");

const aliasesContent = fs.readFileSync(path.join(__dirname, "../lib/website-builder/registry/aliases.ts"), "utf-8");
const sitedataContent = fs.readFileSync(path.join(__dirname, "../utils/sitedata.ts"), "utf-8");

function normalizeKey(value) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Extract variants from sitedata
const catRegex = /name:\s*["']([^"']+)["'],\s*\n\s*(?:icon:[^,]+,\s*)?variants:\s*\[([\s\S]*?)\]/g;
let catMatch;
const siteCategories = [];

while ((catMatch = catRegex.exec(sitedataContent)) !== null) {
  const catName = catMatch[1];
  const variantsBlock = catMatch[2];
  const varRegex = /name:\s*["']([^"']+)["']/g;
  let varMatch;
  const variants = [];
  while ((varMatch = varRegex.exec(variantsBlock)) !== null) {
    variants.push(varMatch[1]);
  }
  siteCategories.push({ name: catName, variants });
}

console.log("Extracted categories from sitedata:", siteCategories.length);

// Extract ALIAS_TO_CANONICAL_ID
const aliasEntries = {};
const aliasRegex = /["']([^"']+)["']:\s*["']([^"']+)["']/g;
const startIdx = aliasesContent.indexOf("export const ALIAS_TO_CANONICAL_ID");
const endIdx = aliasesContent.indexOf("};", startIdx);
const aliasBlock = aliasesContent.slice(startIdx, endIdx);

let aMatch;
while ((aMatch = aliasRegex.exec(aliasBlock)) !== null) {
  aliasEntries[aMatch[1]] = aMatch[2];
}

console.log("Static alias entries count:", Object.keys(aliasEntries).length);

// Check each variant in sitedata against aliasEntries
console.log("\n--- AUDITING SITEDATA VARIANTS AGAINST ALIAS_TO_CANONICAL_ID ---");
const unmapped = [];
for (const cat of siteCategories) {
  for (const v of cat.variants) {
    const normV = normalizeKey(v);
    const normCombined = normalizeKey(`${cat.name}-${v}`);
    const normCat = normalizeKey(cat.name);

    const matchV = aliasEntries[normV];
    const matchCombined = aliasEntries[normCombined];
    const matchCat = aliasEntries[normCat];

    if (!matchV && !matchCombined && !matchCat) {
      unmapped.push({ cat: cat.name, variant: v, normV, normCat });
      console.log(`❌ UNMAPPED: Cat: "${cat.name}", Variant: "${v}" (normV: "${normV}", normCat: "${normCat}")`);
    } else {
      console.log(`✅ Mapped: Cat: "${cat.name}", Variant: "${v}" -> ${matchV || matchCombined || matchCat}`);
    }
  }
}

console.log(`\nTotal unmapped variants in sitedata: ${unmapped.length}`);
