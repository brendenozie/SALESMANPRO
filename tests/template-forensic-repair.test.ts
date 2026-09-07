/**
 * tests/template-forensic-repair.test.ts
 *
 * Automated verification suite for the SalesmanPro Template Registry,
 * canonical resolution pipeline, authentic component preservation,
 * and compiler integrity.
 */

import {
  TEMPLATE_REGISTRY,
  resolveCanonicalTemplate,
  getAllTemplates,
  getTemplateById,
  getTemplateForCompany,
} from "../lib/website-builder/template-registry";
import { compileWebsiteFromCompany } from "../lib/website-builder/template-compiler";
import { folderMap, siteComponentNameMap } from "../components/site/layouts/siteBodyComponentMap";

function runTests() {
  console.log("\n=======================================================");
  console.log("🛠️  SALESMANPRO TEMPLATE FORENSIC REPAIR TEST SUITE");
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

  // -------------------------------------------------------------
  // TEST 1: Registry Inventory
  // -------------------------------------------------------------
  console.log("--- 1. Template Registry Inventory ---");
  const allTemplates = getAllTemplates();
  assert(allTemplates.length >= 50, `Registry contains all major templates (count: ${allTemplates.length})`);

  // Verify key specialized templates exist
  const requiredTemplates = [
    "ecommerce-shoes@v1",
    "ecommerce-gaming@v1",
    "ecommerce-agrovet@v1",
    "ecommerce-meat@v1",
    "ecommerce-hardware@v1",
    "ecommerce-watch@v1",
    "ecommerce-flowers@v1",
    "ecommerce-groceries@v1",
    "fashion@v1",
    "furniture@v1",
    "courses@v1",
    "courses-2@v1",
    "courses-3@v1",
    "automotive@v1",
    "automotive-2@v1",
    "security@v1",
    "security-2@v1",
    "consultancy@v1",
    "public-speaking@v1",
    "services@v1",
    "bookings@v1",
    "barbershop@v1",
    "drycleaning@v1",
    "real-estate@v1",
    "restaurant@v1",
    "healthcare@v1",
    "fitness@v1",
    "finance@v1",
    "travel@v1",
    "saas@v1",
    "marketplace@v1",
    "portfolio@v1",
    "blog@v1",
    "media@v1",
    "nonprofit@v1",
    "default-site@v1",
  ];

  for (const tid of requiredTemplates) {
    const t = getTemplateById(tid);
    assert(!!t, `Template ${tid} exists in registry`);
    if (t) {
      assert(t.capabilities.length > 0, `${tid} declares capabilities: [${t.capabilities.join(", ")}]`);
      assert(t.defaultPages.length > 0, `${tid} declares default pages (count: ${t.defaultPages.length})`);
    }
  }

  // -------------------------------------------------------------
  // TEST 2: Canonical Resolution & Alias Normalization
  // -------------------------------------------------------------
  console.log("\n--- 2. Canonical Resolution & Normalization ---");
  
  const testCases = [
    { cat: "ecommerce", variant: "shoes-store", expected: "ecommerce-shoes@v1" },
    { cat: "ecommerce", variant: "Shoes Store", expected: "ecommerce-shoes@v1" },
    { cat: "ecommerce", variant: "gaming-store", expected: "ecommerce-gaming@v1" },
    { cat: "courses", variant: "courses-layout-2", expected: "courses-2@v1" },
    { cat: "courses", variant: "courses layout 3", expected: "courses-3@v1" },
    { cat: "automotive", variant: "car-dealership-2", expected: "automotive-2@v1" },
    { cat: "security", variant: "security-consulting", expected: "security-2@v1" },
    { cat: "bookings", variant: "barbershop-store", expected: "barbershop@v1" },
    { cat: "consultancy", variant: "consultant-coach", expected: "consultancy@v1" },
    { cat: "unknown-cat", variant: "unknown-var", expected: "default-site@v1" },
  ];

  for (const tc of testCases) {
    const resolved = resolveCanonicalTemplate(tc.cat, tc.variant);
    assert(
      resolved.id === tc.expected,
      `Resolved ('${tc.cat}', '${tc.variant}') -> '${resolved.id}' (expected '${tc.expected}')`
    );
  }

  // -------------------------------------------------------------
  // TEST 3: Shell & Body Mapping Alignment
  // -------------------------------------------------------------
  console.log("\n--- 3. Shell & Body Mapping Alignment ---");
  for (const t of allTemplates) {
    const componentValid = !!siteComponentNameMap[t.shellLayout];
    assert(
      componentValid,
      `${t.id} -> shellLayout '${t.shellLayout}' aligns with siteComponentNameMap (body: '${t.bodyComponent}')`
    );
  }

  // -------------------------------------------------------------
  // TEST 4: Compiler Fidelity (Preserving Authentic Shoes Design)
  // -------------------------------------------------------------
  console.log("\n--- 4. Compiler Fidelity (Authentic Shoes Store) ---");
  const mockShoesCompany = {
    id: "comp-shoes-1",
    name: "Apex Kicks & Footwear",
    slug: "apex-kicks",
    category: "ecommerce",
    variant: "shoes-store",
    tagline: "Unmatched Comfort & Style",
    bannerUrl: "https://example.com/shoes-banner.jpg",
    themeSettings: {
      primaryColor: "#0F172A",
    },
    heroSlides: [
      {
        id: "slide-hero-1",
        headline: "Air Pulse 2026 Drop",
        subline: "Limited Release Sneakers",
        ctaText: "Shop Sneaker Drops",
        ctaLink: "/products",
      },
    ],
  };

  const compiled = compileWebsiteFromCompany(mockShoesCompany);
  assert(compiled.templateKey === "ecommerce-shoes@v1", `Compiled templateKey is 'ecommerce-shoes@v1' (got '${compiled.templateKey}')`);
  
  const homePage = compiled.pages.find((p) => p.isHomepage);
  assert(!!homePage, "Compiled website contains Home page");
  assert(homePage!.sections.length === 15, `Authentic Shoes component tree preserved with 15 sections (got ${homePage!.sections.length})`);

  // Verify specific authentic components are present
  const sectionIds = homePage!.sections.map((s) => s.id);
  assert(sectionIds.some((id) => id.includes("shoes-hero-slider")), "HeroSlider preserved");
  assert(sectionIds.some((id) => id.includes("shoes-popular-products")), "PopularProducts preserved");
  assert(sectionIds.some((id) => id.includes("shoes-daily-best-sells")), "DailyBestSells preserved");
  assert(sectionIds.some((id) => id.includes("shoes-sleeptape-ad")), "SleepTapeAd preserved");
  assert(sectionIds.some((id) => id.includes("shoes-all-products")), "AllProducts preserved");
  assert(sectionIds.some((id) => id.includes("shoes-newsletter")), "NewsletterSection preserved");

  // Verify subpages
  const pageSlugs = compiled.pages.map((p) => p.slug);
  assert(pageSlugs.includes("products"), "Subpage 'products' preserved");
  assert(pageSlugs.includes("categories"), "Subpage 'categories' preserved");
  assert(pageSlugs.includes("about"), "Subpage 'about' preserved");
  assert(pageSlugs.includes("contact"), "Subpage 'contact' preserved");
  assert(pageSlugs.includes("cart"), "Subpage 'cart' preserved");
  assert(pageSlugs.includes("checkout"), "Subpage 'checkout' preserved");

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
