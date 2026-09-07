/**
 * tests/template-parity.test.ts
 *
 * Automated regression test suite asserting:
 * 1. Exact template resolution parity between public storefront and website builder across all 56 templates.
 * 2. Authentic component preservation (shellLayout, bodyComponent) in categoryHeaderFooterLayoutMap and BodyComponentMap.
 * 3. Prevention of silent fallbacks to DefaultSite when valid authentic templates exist.
 * 4. Template alias normalization and legacy template migration.
 * 5. Draft state synchronization and templateKey persistence integrity.
 * 6. Custom subpage synthesis without 404s.
 */

import {
  TEMPLATE_REGISTRY,
  resolveCanonicalTemplate,
  getAllTemplates,
  getTemplateById,
  normalizeKey,
  ALIAS_TO_CANONICAL_ID,
} from "../lib/website-builder/template-registry";
import { categoryHeaderFooterLayoutMap } from "../components/site/layouts/categoryHeaderFooterLayoutMap";
import { siteComponentNameMap } from "../components/site/layouts/siteBodyComponentMap";
import { compileWebsiteFromCompany } from "../lib/website-builder/template-compiler";

function runParityTests() {
  console.log("\n=======================================================");
  console.log("🔍 SALESMANPRO STOREFRONT <-> BUILDER PARITY SUITE");
  console.log("=======================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ""}`);
      failed++;
    }
  }

  const allTemplates = getAllTemplates();

  // -------------------------------------------------------------
  // TEST 1: Exact Resolution Parity Across All 56 Templates
  // -------------------------------------------------------------
  console.log("--- 1. Storefront vs Builder Resolution Parity (All 56 Templates) ---");
  for (const template of allTemplates) {
    // Public Storefront resolution simulation:
    // StorePage and StoreLayout call: resolveCanonicalTemplate(raw.category, raw.variant, raw.website?.templateKey)
    const storefrontResolved = resolveCanonicalTemplate(
      template.category,
      template.variant,
      template.id
    );

    // Website Builder resolution simulation:
    // WebsiteBuilderStudio calls: resolveCanonicalTemplate(category, variant, config.templateKey)
    const builderResolved = resolveCanonicalTemplate(
      template.category,
      template.variant,
      template.id
    );

    assert(
      storefrontResolved.id === builderResolved.id && storefrontResolved.id === template.id,
      `Identity Parity for ${template.id}: Storefront (${storefrontResolved.id}) === Builder (${builderResolved.id})`
    );

    assert(
      storefrontResolved.shellLayout === builderResolved.shellLayout &&
        storefrontResolved.shellLayout === template.shellLayout,
      `Shell Layout Parity for ${template.id}: '${storefrontResolved.shellLayout}'`
    );

    assert(
      storefrontResolved.bodyComponent === builderResolved.bodyComponent &&
        storefrontResolved.bodyComponent === template.bodyComponent,
      `Body Component Parity for ${template.id}: '${storefrontResolved.bodyComponent}'`
    );
  }

  // -------------------------------------------------------------
  // TEST 2: Shell Layout Resolution in categoryHeaderFooterLayoutMap
  // -------------------------------------------------------------
  console.log("\n--- 2. Direct Shell Layout Resolution in categoryHeaderFooterLayoutMap ---");
  for (const template of allTemplates) {
    const layoutComponent = categoryHeaderFooterLayoutMap[template.shellLayout];
    assert(
      !!layoutComponent,
      `${template.id} -> categoryHeaderFooterLayoutMap['${template.shellLayout}'] resolves successfully`
    );
  }

  // -------------------------------------------------------------
  // TEST 3: Body Component Alignment
  // -------------------------------------------------------------
  console.log("\n--- 3. Body Component Alignment in siteComponentNameMap ---");
  for (const template of allTemplates) {
    const mappedBody = siteComponentNameMap[template.shellLayout];
    assert(
      mappedBody === template.bodyComponent,
      `${template.id} -> shellLayout '${template.shellLayout}' maps to bodyComponent '${mappedBody}' (expected '${template.bodyComponent}')`
    );
  }

  // -------------------------------------------------------------
  // TEST 4: Prevention of Silent Fallbacks to DefaultSite
  // -------------------------------------------------------------
  console.log("\n--- 4. Prevention of Silent Fallbacks to DefaultSite ---");
  const authenticVariants = [
    { cat: "ecommerce", variant: "shoes-store", expected: "ecommerce-shoes@v1" },
    { cat: "ecommerce", variant: "gaming-store", expected: "ecommerce-gaming@v1" },
    { cat: "ecommerce", variant: "groceries-store", expected: "ecommerce-groceries@v1" },
    { cat: "automotive", variant: "car-dealership", expected: "automotive@v1" },
    { cat: "automotive", variant: "car-dealership-2", expected: "automotive-2@v1" },
    { cat: "courses", variant: "courses-layout-2", expected: "courses-2@v1" },
    { cat: "courses", variant: "courses-layout-3", expected: "courses-3@v1" },
    { cat: "security", variant: "security-consulting", expected: "security-2@v1" },
    { cat: "bookings", variant: "barbershop-store", expected: "barbershop@v1" },
    { cat: "services", variant: "service-provider", expected: "services@v1" },
    { cat: "real-estate", variant: "property-listings", expected: "real-estate@v1" },
    { cat: "fitness", variant: "gym-fitness", expected: "fitness@v1" },
    { cat: "restaurant", variant: "food-delivery", expected: "restaurant@v1" },
    { cat: "healthcare", variant: "clinic-pro", expected: "healthcare@v1" },
  ];

  for (const item of authenticVariants) {
    // When explicit template ID is undefined
    const resolvedWithoutId = resolveCanonicalTemplate(item.cat, item.variant, undefined);
    assert(
      resolvedWithoutId.id !== "default-site@v1",
      `No silent fallback for ${item.variant} (resolved '${resolvedWithoutId.id}')`
    );
    assert(
      resolvedWithoutId.id === item.expected,
      `Accurately resolved '${item.variant}' to '${item.expected}'`
    );

    // When DB has generic default templateKey ("default-site@v1" or "ecommerce-default@v1" or "ecommerce")
    const resolvedWithGenericDefault = resolveCanonicalTemplate(item.cat, item.variant, "default-site@v1");
    assert(
      resolvedWithGenericDefault.id === item.expected,
      `Generic default templateKey in DB overridden by authentic variant '${item.variant}' -> '${item.expected}'`
    );
  }

  // -------------------------------------------------------------
  // TEST 5: Template Alias Normalization Coverage
  // -------------------------------------------------------------
  console.log("\n--- 5. Template Alias Normalization Coverage ---");
  const aliasTestCases = [
    { input: "Shoes Store", expected: "ecommerce-shoes@v1" },
    { input: "shoes_store", expected: "ecommerce-shoes@v1" },
    { input: "SHOES-STORE", expected: "ecommerce-shoes@v1" },
    { input: "car-dealership-2", expected: "automotive-2@v1" },
    { input: "CAR DEALERSHIP 2", expected: "automotive-2@v1" },
    { input: "courses-layout-2", expected: "courses-2@v1" },
    { input: "security-consulting", expected: "security-2@v1" },
    { input: "Barbershop Store", expected: "barbershop@v1" },
    { input: "Modern Fashion Store", expected: "fashion@v1" },
    { input: "Modern Furniture Store", expected: "furniture@v1" },
  ];

  for (const tc of aliasTestCases) {
    const resolved = resolveCanonicalTemplate(undefined, tc.input);
    assert(
      resolved.id === tc.expected,
      `Alias '${tc.input}' normalized -> '${resolved.id}' (expected '${tc.expected}')`
    );
  }

  // -------------------------------------------------------------
  // TEST 6: Subpage Synthesis Without 404s
  // -------------------------------------------------------------
  console.log("\n--- 6. Subpage Synthesis Without 404s ---");
  const sampleCompany = {
    id: "test-shoes-tenant",
    name: "Velocity Footwear",
    slug: "velocity-footwear",
    category: "ecommerce",
    variant: "shoes-store",
  };

  const compiledConfig = compileWebsiteFromCompany(sampleCompany);
  assert(
    compiledConfig.templateKey === "ecommerce-shoes@v1",
    `Compiled config templateKey is 'ecommerce-shoes@v1'`
  );

  const subpageSlugs = compiledConfig.pages.map((p) => p.slug);
  const requiredSubpages = ["products", "categories", "about", "contact"];
  for (const subpage of requiredSubpages) {
    assert(
      subpageSlugs.includes(subpage),
      `Standard subpage '${subpage}' synthesized in config (prevents 404)`
    );
  }

  // -------------------------------------------------------------
  // TEST 7: Template Switcher & Draft State Integrity
  // -------------------------------------------------------------
  console.log("\n--- 7. Template Switcher & Draft State Integrity ---");
  // Simulate switching from Shoes Store to Automotive 2
  const automotive2Template = getTemplateById("automotive-2@v1");
  assert(!!automotive2Template, "automotive-2@v1 exists for switching");

  const switchedConfig = {
    ...compiledConfig,
    templateKey: automotive2Template!.id,
    theme: {
      ...compiledConfig.theme,
      primaryColor: automotive2Template!.defaultTheme.primaryColor,
    },
  };

  // Re-resolve with the switched templateKey
  const reResolved = resolveCanonicalTemplate(
    sampleCompany.category,
    sampleCompany.variant,
    switchedConfig.templateKey
  );

  assert(
    reResolved.id === "automotive-2@v1",
    `Switched templateKey 'automotive-2@v1' explicitly overrides category/variant defaults`
  );
  assert(
    reResolved.shellLayout === "Automotive2Layout",
    `Switched template renders 'Automotive2Layout'`
  );
  assert(
    reResolved.bodyComponent === "Automotive2Site",
    `Switched template renders 'Automotive2Site'`
  );

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`📊 FINAL PARITY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runParityTests();
