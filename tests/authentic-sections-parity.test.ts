/**
 * tests/authentic-sections-parity.test.ts
 *
 * Verifies that:
 * 1. Every authentic template in TEMPLATE_REGISTRY defines authentic sections specific to its design.
 * 2. No specialized template falls back to STANDARD_ECOMMERCE_SECTIONS.
 * 3. Compiling websites for different store categories (Delivery, Fashion, Furniture, Agrovet, SaaS, etc.)
 *    yields authentic sections matching the template's authentic components.
 * 4. getEditableComponent returns FULLY_EDITABLE with editable properties for authentic components.
 */

import {
  TEMPLATE_REGISTRY,
  getAllTemplates,
  resolveCanonicalTemplate,
  STANDARD_ECOMMERCE_SECTIONS,
} from "../lib/website-builder/template-registry";
import { compileWebsiteFromCompany } from "../lib/website-builder/template-compiler";
import { getEditableComponent } from "../lib/website-builder/editable-adapters";

function runAuthenticSectionsTests() {
  console.log("\n=======================================================");
  console.log("🔍 AUTHENTIC SECTIONS & EDITABILITY AUDIT SUITE");
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

  // Test 1: No template in TEMPLATE_REGISTRY falls back to STANDARD_ECOMMERCE_SECTIONS
  console.log("--- 1. Verification of Authentic Sections per Template ---");
  let standardEcommerceCount = 0;
  allTemplates.forEach((tpl) => {
    if (tpl.authenticSections === STANDARD_ECOMMERCE_SECTIONS) {
      standardEcommerceCount++;
      assert(false, `${tpl.id} should NOT use generic STANDARD_ECOMMERCE_SECTIONS`);
    } else {
      assert(
        tpl.authenticSections.length > 0,
        `${tpl.id} has ${tpl.authenticSections.length} authentic sections defined`
      );
    }
  });
  assert(
    standardEcommerceCount === 0,
    `Zero templates fall back to generic ecommerce sections (found: ${standardEcommerceCount})`
  );

  // Test 2: Specific store categories compile their authentic section sets
  console.log("\n--- 2. Store Builder Compilation Yields Authentic Sections ---");
  const testCases = [
    {
      category: "delivery",
      variant: "delivery",
      explicitId: "delivery@v1",
      expectedSections: ["delivery-heroslider", "delivery-servicessection", "delivery-bookingsection"],
      expectedCount: 12,
    },
    {
      category: "fashion",
      variant: "modern-fashion-store",
      explicitId: "fashion@v1",
      expectedSections: ["fashion-heroslider", "fashion-categoriessection", "fashion-dynamicpopularproducts"],
      expectedCount: 13,
    },
    {
      category: "furniture",
      variant: "modern-furniture-store",
      explicitId: "furniture@v1",
      expectedSections: ["furniture-heroslider", "furniture-roomsection", "furniture-weeklyproducts"],
      expectedCount: 15,
    },
    {
      category: "ecommerce",
      variant: "agrovet-supplies",
      explicitId: "ecommerce-agrovet@v1",
      expectedSections: ["agrovet-heroslider", "agrovet-categorysection", "agrovet-promosection"],
      expectedCount: 12,
    },
    {
      category: "saas",
      variant: "saas-starter",
      explicitId: "saas@v1",
      expectedSections: ["saas-hero", "saas-features", "saas-pricing"],
      expectedCount: 5,
    },
    {
      category: "marketplace",
      variant: "multi-vendor-marketplace",
      explicitId: "marketplace@v1",
      expectedSections: ["marketplace-herobanner", "marketplace-categorycarousel", "marketplace-storepagesection"],
      expectedCount: 4,
    },
    {
      category: "ghuba",
      variant: "african-marketplace",
      explicitId: "ghuba@v1",
      expectedSections: ["ghuba-bannerslider", "ghuba-flashdeals", "ghuba-topcate"],
      expectedCount: 8,
    },
  ];

  testCases.forEach((tc) => {
    const canonical = resolveCanonicalTemplate(tc.category, tc.variant, tc.explicitId);
    assert(
      canonical.id !== "ecommerce-default@v1",
      `Resolved ${tc.category}/${tc.variant} to authentic template ${canonical.id}`
    );

    // Verify canonical template has authentic sections
    tc.expectedSections.forEach((secId) => {
      const authSec = canonical.authenticSections.find((as) => as.id === secId || as.id.toLowerCase().includes(secId.split("-")[1].toLowerCase()));
      assert(
        authSec !== undefined,
        `Authentic section registry contains '${secId}' for template ${canonical.id}`
      );
    });

    const compiled = compileWebsiteFromCompany({
      id: "company-test",
      name: `Test ${tc.category} Store`,
      category: tc.category,
      variant: tc.variant,
      website: { templateKey: canonical.id },
    } as any);

    const homeSections = compiled.pages[0]?.sections || [];
    assert(
      homeSections.length === tc.expectedCount,
      `${tc.category} storefront has exact ${homeSections.length} compiled homepage sections (expected ${tc.expectedCount})`
    );

    // Check that compiled sections preserved the authentic section IDs
    tc.expectedSections.forEach((expectedPrefix) => {
      const found = homeSections.some((s) => s.id.toLowerCase().includes(expectedPrefix.toLowerCase()) || s.id.toLowerCase().includes(expectedPrefix.split("-")[1].toLowerCase()));
      assert(
        found,
        `${tc.category} compiled section matches '${expectedPrefix}' (found in sections)`
      );
    });
  });

  // Test 3: Editable adapters return FULLY_EDITABLE for authentic components
  console.log("\n--- 3. Universal Component Adapter Returns FULLY_EDITABLE ---");
  const sampleComponents = [
    "HeroSection",
    "HeroSlider",
    "FurnitureHero",
    "AgrovetHero",
    "SaaSHero",
    "MarketplaceHero",
    "GhubaHero",
    "SecurityHero",
    "ConsultancyHero",
    "LogisticsHero",
    "RealEstateHero",
    "HealthcareHero",
  ];

  sampleComponents.forEach((compName) => {
    const adapter = getEditableComponent(compName);
    assert(
      adapter !== undefined,
      `Adapter found for authentic component '${compName}'`
    );
    assert(
      adapter?.status === "FULLY_EDITABLE",
      `Component '${compName}' status is FULLY_EDITABLE (got '${adapter?.status}')`
    );
    const propCount = Object.keys(adapter?.properties || {}).length;
    assert(
      propCount >= 3,
      `Component '${compName}' defines ${propCount} editable properties (e.g. headline, subline, buttonText)`
    );
  });

  console.log("\n=======================================================");
  console.log(`📊 FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthenticSectionsTests();
