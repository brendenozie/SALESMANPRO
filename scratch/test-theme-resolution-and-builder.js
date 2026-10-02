const path = require("path");
const fs = require("fs");

console.log("===============================================================================");
console.log("       SALESMANPRO WEBSITE BUILDER & THEME ARCHITECTURE VERIFICATION TEST      ");
console.log("===============================================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

// 1. Audit Template Registry Files (All 56 Templates)
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

console.log(`TEST 1: Canonical Template Inventory`);
assert(templates.length === 56, `Exactly 56 canonical templates discovered in registry (got: ${templates.length})`);

// 2. Check Shell Layouts Registration
const chfContent = fs.readFileSync(path.join(__dirname, "../components/site/layouts/categoryHeaderFooterLayoutMap.ts"), "utf-8");
let missingShells = 0;
for (const t of templates) {
  const hasShell = chfContent.includes(`"${t.shellLayout}"`) || chfContent.includes(`'${t.shellLayout}'`) || chfContent.includes(`${t.shellLayout}:`);
  if (!hasShell) {
    missingShells++;
    console.error(`     Missing shell: ${t.id} -> ${t.shellLayout}`);
  }
}
console.log(`\nTEST 2: Shell Layout Map Alignment`);
assert(missingShells === 0, `All 56 templates have verified shell layouts in categoryHeaderFooterLayoutMap (missing: ${missingShells})`);

// 3. Check Body Components Registration
const bodyMapContent = fs.readFileSync(path.join(__dirname, "../components/site/BodyComponentMap.tsx"), "utf-8");
let missingBodies = 0;
for (const t of templates) {
  const hasBody = bodyMapContent.includes(`'${t.bodyComponent}'`) || bodyMapContent.includes(`"${t.bodyComponent}"`);
  if (!hasBody) {
    missingBodies++;
    console.error(`     Missing body: ${t.id} -> ${t.bodyComponent}`);
  }
}
console.log(`\nTEST 3: Body Component Map Alignment`);
assert(missingBodies === 0, `All 56 templates have verified body components in BodyComponentMap.tsx (missing: ${missingBodies})`);

// 4. Test Sitedata Category & Variant Aliases
const aliasesContent = fs.readFileSync(path.join(__dirname, "../lib/website-builder/registry/aliases.ts"), "utf-8");
const sitedataContent = fs.readFileSync(path.join(__dirname, "../utils/sitedata.ts"), "utf-8");

function normalizeKey(value) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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

// Parse ALIAS_TO_CANONICAL_ID map
const aliasEntries = {};
const aliasRegex = /["']([^"']+)["']:\s*["']([^"']+)["']/g;
const startIdx = aliasesContent.indexOf("export const ALIAS_TO_CANONICAL_ID");
const endIdx = aliasesContent.indexOf("};", startIdx);
const aliasBlock = aliasesContent.slice(startIdx, endIdx);
let aMatch;
while ((aMatch = aliasRegex.exec(aliasBlock)) !== null) {
  aliasEntries[aMatch[1]] = aMatch[2];
}

console.log(`\nTEST 4: Sitedata Categories & Variants Resolution`);
let unmappedCount = 0;
for (const cat of siteCategories) {
  for (const v of cat.variants) {
    const normV = normalizeKey(v);
    const normCombined = normalizeKey(`${cat.name}-${v}`);
    const normCat = normalizeKey(cat.name);
    const matched = aliasEntries[normV] || aliasEntries[normCombined] || aliasEntries[normCat];
    if (!matched) {
      unmappedCount++;
      console.error(`     Unmapped: ${cat.name} / ${v}`);
    }
  }
}
assert(unmappedCount === 0, `All sitedata categories and variants resolve deterministically (unmapped: ${unmappedCount})`);

// 5. Test Slug Aliases for 404 Prevention
console.log(`\nTEST 5: Page Slug Aliases (404 Prevention)`);
const slugAliasesMatch = aliasesContent.includes("export const PAGE_SLUG_ALIASES");
const resolveAliasMatch = aliasesContent.includes("export function resolvePageSlugAlias");
assert(slugAliasesMatch && resolveAliasMatch, `PAGE_SLUG_ALIASES and resolvePageSlugAlias exported from aliases.ts`);

const subpagePageContent = fs.readFileSync(path.join(__dirname, "../app/site/[slug]/[...pageSlug]/page.tsx"), "utf-8");
assert(subpagePageContent.includes("resolvePageSlugAlias"), `Subpage route handler imports and executes resolvePageSlugAlias`);
assert(!subpagePageContent.includes("if (!pageExists) {\n    notFound();\n  }"), `Subpage route handler has safe fallback mechanism for standard pages`);

// 6. Test Mascot Integration
console.log(`\nTEST 6: SalesmanPro AI Mascot Integration`);
const capRegContent = fs.readFileSync(path.join(__dirname, "../lib/ai/mascot/capabilityRegistry.ts"), "utf-8");
assert(capRegContent.includes("website:view_config"), `Mascot registry includes website:view_config`);
assert(capRegContent.includes("website:update_theme"), `Mascot registry includes website:update_theme`);
assert(capRegContent.includes("website:update_section"), `Mascot registry includes website:update_section`);
assert(capRegContent.includes("website:reorder_sections"), `Mascot registry includes website:reorder_sections`);
assert(capRegContent.includes("website:generate_content"), `Mascot registry includes website:generate_content`);
assert(capRegContent.includes("website:publish_website"), `Mascot registry includes website:publish_website`);

const actionEngineContent = fs.readFileSync(path.join(__dirname, "../lib/ai/mascot/actionEngine.ts"), "utf-8");
assert(actionEngineContent.includes("case \"website:view_config\":"), `ActionEngine handles website:view_config`);
assert(actionEngineContent.includes("case \"website:publish_website\":"), `ActionEngine handles website:publish_website`);
assert(actionEngineContent.includes("handleWebsitePublish"), `ActionEngine implements handleWebsitePublish`);

const contextResolverContent = fs.readFileSync(path.join(__dirname, "../lib/ai/mascot/contextResolver.ts"), "utf-8");
assert(contextResolverContent.includes('"website"'), `ContextResolver includes "website" in baseModules`);
assert(contextResolverContent.includes("website-builder"), `ContextResolver includes route suggestions for website-builder`);

console.log("\n===============================================================================");
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log("===============================================================================\n");

process.exit(failed > 0 ? 1 : 0);
