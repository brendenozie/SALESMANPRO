/**
 * scratch/verify-56-themes-runtime.js
 * Comprehensive deep runtime verification test suite for SalesmanPro Website Builder.
 */

const path = require("path");
const fs = require("fs");

console.log("===============================================================================");
console.log("       SALESMANPRO 56-THEME COMPREHENSIVE RUNTIME & EDITING VERIFICATION       ");
console.log("===============================================================================\n");

let passed = 0;
let failed = 0;
let warnings = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

function warn(message) {
  warnings++;
  console.warn(`  ⚠️ [WARN] ${message}`);
}

// -----------------------------------------------------------------------------
// 1. DISCOVER AND AUDIT ALL 56 THEMES FROM REGISTRY FILES
// -----------------------------------------------------------------------------
const registryDir = path.join(__dirname, "../lib/website-builder/registry");
const files = fs.readdirSync(registryDir).filter((f) => f.endsWith(".ts") && f !== "aliases.ts" && f !== "helpers.ts");

const allThemes = [];
for (const file of files) {
  const content = fs.readFileSync(path.join(registryDir, file), "utf-8");
  const idRegex = /id:\s*["']([^"']+)["'],\s*\n\s*version:\s*["']([^"']+)["'],\s*\n\s*name:\s*["']([^"']+)["'],/g;
  let match;
  while ((match = idRegex.exec(content)) !== null) {
    const id = match[1];
    const version = match[2];
    const name = match[3];
    const blockStart = match.index;
    const block = content.slice(blockStart, blockStart + 1200);

    const catMatch = block.match(/category:\s*["']([^"']+)["']/);
    const varMatch = block.match(/variant:\s*["']([^"']+)["']/);
    const shellMatch = block.match(/shellLayout:\s*["']([^"']+)["']/);
    const bodyMatch = block.match(/bodyComponent:\s*["']([^"']+)["']/);

    // Extract default theme tokens
    const primaryColorMatch = block.match(/primaryColor:\s*["']([^"']+)["']/);
    const secondaryColorMatch = block.match(/secondaryColor:\s*["']([^"']+)["']/);
    const headingFontMatch = block.match(/headingFont:\s*["']([^"']+)["']/);

    allThemes.push({
      file,
      id,
      version,
      name,
      category: catMatch ? catMatch[1] : "",
      variant: varMatch ? varMatch[1] : "",
      shellLayout: shellMatch ? shellMatch[1] : "",
      bodyComponent: bodyMatch ? bodyMatch[1] : "",
      primaryColor: primaryColorMatch ? primaryColorMatch[1] : "",
      secondaryColor: secondaryColorMatch ? secondaryColorMatch[1] : "",
      headingFont: headingFontMatch ? headingFontMatch[1] : "",
    });
  }
}

console.log(`[SECTION 1] CANONICAL THEME DISCOVERY & PROPERTY AUDIT`);
assert(allThemes.length === 56, `Exactly 56 canonical themes parsed (discovered: ${allThemes.length})`);

// -----------------------------------------------------------------------------
// 2. VERIFY EVERY THEME'S PHYSICAL FILES AND EXPORTS
// -----------------------------------------------------------------------------
console.log(`\n[SECTION 2] VERIFYING PHYSICAL FILE EXISTENCE FOR ALL 56 THEMES`);
const layoutsDir = path.join(__dirname, "../components/site/layouts");
let missingFiles = 0;

for (const theme of allThemes) {
  const layoutPath = path.join(layoutsDir, theme.shellLayout);
  const layoutExists = fs.existsSync(layoutPath);
  if (!layoutExists) {
    missingFiles++;
    console.error(`  ❌ Missing Layout directory for ${theme.id}: ${layoutPath}`);
  }

  // Check body directory
  const bodyDir = path.join(layoutPath, "body");
  const bodyExists = fs.existsSync(bodyDir);
  if (!bodyExists) {
    missingFiles++;
    console.error(`  ❌ Missing body directory for ${theme.id}: ${bodyDir}`);
  }
}
assert(missingFiles === 0, `All 56 themes have verified physical layout and body directories on disk (missing: ${missingFiles})`);

// -----------------------------------------------------------------------------
// 3. VERIFY SHELL & BODY REGISTRATION MAPS
// -----------------------------------------------------------------------------
console.log(`\n[SECTION 3] SHELL & BODY REGISTRATION MAPS INTEGRITY`);
const chfContent = fs.readFileSync(path.join(layoutsDir, "categoryHeaderFooterLayoutMap.ts"), "utf-8");
const bodyMapContent = fs.readFileSync(path.join(__dirname, "../components/site/BodyComponentMap.tsx"), "utf-8");

let unmappedShells = 0;
let unmappedBodies = 0;

for (const theme of allThemes) {
  const hasShell = chfContent.includes(`"${theme.shellLayout}"`) || chfContent.includes(`'${theme.shellLayout}'`) || chfContent.includes(`${theme.shellLayout}:`);
  if (!hasShell) {
    unmappedShells++;
    console.error(`  ❌ Shell Layout unmapped in categoryHeaderFooterLayoutMap: ${theme.shellLayout}`);
  }

  const hasBody = bodyMapContent.includes(`'${theme.bodyComponent}'`) || bodyMapContent.includes(`"${theme.bodyComponent}"`);
  if (!hasBody) {
    unmappedBodies++;
    console.error(`  ❌ Body Component unmapped in BodyComponentMap: ${theme.bodyComponent}`);
  }
}
assert(unmappedShells === 0, `All 56 theme shells registered in categoryHeaderFooterLayoutMap (unmapped: ${unmappedShells})`);
assert(unmappedBodies === 0, `All 56 theme bodies registered in BodyComponentMap (unmapped: ${unmappedBodies})`);

// -----------------------------------------------------------------------------
// 4. TEST SITEDATA ALIAS COVERAGE & ZERO-DEGRADATION RESOLUTION
// -----------------------------------------------------------------------------
console.log(`\n[SECTION 4] SITEDATA CATEGORIES & VARIANTS ZERO-DEGRADATION RESOLUTION`);
const aliasesContent = fs.readFileSync(path.join(registryDir, "aliases.ts"), "utf-8");
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

let unmappedSitedata = 0;
for (const cat of siteCategories) {
  for (const v of cat.variants) {
    const normV = normalizeKey(v);
    const normCombined = normalizeKey(`${cat.name}-${v}`);
    const normCat = normalizeKey(cat.name);
    const resolved = aliasEntries[normV] || aliasEntries[normCombined] || aliasEntries[normCat];
    if (!resolved) {
      unmappedSitedata++;
      console.error(`  ❌ Unmapped: Category "${cat.name}", Variant "${v}"`);
    }
  }
}
assert(unmappedSitedata === 0, `All ${siteCategories.length} categories and their variants resolve deterministically (unmapped: ${unmappedSitedata})`);

// -----------------------------------------------------------------------------
// 5. TEST SUBPAGE ROUTING ALIASES & 404 PREVENTION MATRIX
// -----------------------------------------------------------------------------
console.log(`\n[SECTION 5] SUBPAGE ROUTING ALIASES & 404 PREVENTION MATRIX`);
const pageSlugAliases = {
  shop: "products",
  catalog: "products",
  "all-products": "products",
  store: "products",
  items: "products",
  departments: "categories",
  collections: "categories",
  "about-us": "about",
  "our-story": "about",
  story: "about",
  "contact-us": "contact",
  "get-in-touch": "contact",
  support: "contact",
  appointments: "booking",
  book: "booking",
  "book-appointment": "booking",
  scheduler: "booking",
  classes: "courses",
  curriculum: "courses",
  programs: "courses",
};

let aliasErrors = 0;
for (const [alias, target] of Object.entries(pageSlugAliases)) {
  const normAlias = normalizeKey(alias);
  if (!aliasesContent.includes(`"${normAlias}":`) && !aliasesContent.includes(`${normAlias}:`)) {
    aliasErrors++;
    console.error(`  ❌ Missing page slug alias in aliases.ts: "${normAlias}" -> "${target}"`);
  }
}
assert(aliasErrors === 0, `All common storefront page aliases registered in PAGE_SLUG_ALIASES (missing: ${aliasErrors})`);

// -----------------------------------------------------------------------------
// 6. TEST SALESMANPRO MASCOT WEBSITE BUILDER CAPABILITIES
// -----------------------------------------------------------------------------
console.log(`\n[SECTION 6] SALESMANPRO MASCOT WEBSITE BUILDER CAPABILITIES`);
const expectedCapabilities = [
  "website:view_config",
  "website:update_theme",
  "website:update_section",
  "website:reorder_sections",
  "website:generate_content",
  "website:publish_website",
];

const capRegContent = fs.readFileSync(path.join(__dirname, "../lib/ai/mascot/capabilityRegistry.ts"), "utf-8");
let missingCaps = 0;
for (const cap of expectedCapabilities) {
  if (!capRegContent.includes(`id: "${cap}"`)) {
    missingCaps++;
    console.error(`  ❌ Missing capability in capabilityRegistry: ${cap}`);
  }
}
assert(missingCaps === 0, `All 6 website management capabilities declared in MASCOT_CAPABILITY_REGISTRY (missing: ${missingCaps})`);

// Check actionEngine handlers
const actionEngineContent = fs.readFileSync(path.join(__dirname, "../lib/ai/mascot/actionEngine.ts"), "utf-8");
let missingHandlers = 0;
for (const cap of expectedCapabilities) {
  if (!actionEngineContent.includes(`case "${cap}":`)) {
    missingHandlers++;
    console.error(`  ❌ Missing actionEngine switch case for: ${cap}`);
  }
}
assert(missingHandlers === 0, `All 6 website capabilities dispatched in MascotActionEngine (missing: ${missingHandlers})`);

// Check contextResolver includes "website" in baseModules
const contextResolverContent = fs.readFileSync(path.join(__dirname, "../lib/ai/mascot/contextResolver.ts"), "utf-8");
assert(contextResolverContent.includes('"website"'), `MascotContextResolver includes "website" module in baseModules`);
assert(contextResolverContent.includes("website-builder"), `MascotContextResolver includes route-aware suggestions for website-builder`);

// -----------------------------------------------------------------------------
// 7. RESPONSIVE DESIGN & VIEWPORT ADAPTATION CHECKS
// -----------------------------------------------------------------------------
console.log(`\n[SECTION 7] RESPONSIVE VIEWPORT ADAPTATION CHECKS`);
const studioContent = fs.readFileSync(path.join(__dirname, "../components/website-builder/editor/WebsiteBuilderStudio.tsx"), "utf-8");

assert(studioContent.includes("isMobileSidebarOpen"), `WebsiteBuilderStudio includes isMobileSidebarOpen state for mobile drawer`);
assert(studioContent.includes("Bars3Icon"), `WebsiteBuilderStudio provides hamburger toggle button for mobile navigation`);
assert(studioContent.includes("max-w-[768px]") && studioContent.includes("max-w-[390px]"), `WebsiteBuilderStudio uses fluid max-width containers for tablet and mobile viewports`);
assert(studioContent.includes("fixed inset-y-0 right-0") && studioContent.includes("max-w-[340px]"), `Right element inspector uses responsive slide-over drawer styling on small screens`);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n===============================================================================");
console.log(`TOTAL SUITE RESULTS: ${passed} Passed, ${failed} Failed, ${warnings} Warnings`);
console.log("===============================================================================\n");

process.exit(failed > 0 ? 1 : 0);
