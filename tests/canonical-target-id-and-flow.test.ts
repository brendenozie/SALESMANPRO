/**
 * tests/canonical-target-id-and-flow.test.ts
 *
 * Automated regression test asserting:
 * 1. Canonical Target ID formatting: [templateKey].[pageSlug].[sectionKey].[componentKey].[instanceKey].[fieldKey]
 * 2. Parsing canonical target IDs and extracting all 6 segments plus itemIndex
 * 3. getCanonicalLookupKeys(targetId): Multi-tier fallback resolution preserving dotted legacy formats
 * 4. EditableComponent adapter realism: Authentic components return FULLY_EDITABLE, unknown components return VIEW_ONLY
 * 5. Deterministic Header, Footer, and Hero field resolution
 */

import {
  buildCanonicalTargetId,
  parseCanonicalTargetId,
  getCanonicalLookupKeys,
} from "../lib/website-builder/canonical-target-id";
import {
  getEditableComponent,
  buildUniversalComponentAdapter,
} from "../lib/website-builder/editable-adapters";

function runCanonicalTargetIdTests() {
  console.log("\n=======================================================");
  console.log("🔍 CANONICAL TARGET ID & EDITING DATA FLOW TEST SUITE");
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

  // 1. Canonical ID Formatting
  console.log("--- 1. Canonical Target ID Construction ---");
  const id1 = buildCanonicalTargetId({
    templateKey: "ecommerce-shoes",
    pageSlug: "home",
    sectionKey: "hero",
    componentKey: "HeroSlider",
    instanceKey: "slide-0",
    fieldKey: "headline",
  });
  assert(
    id1 === "ecommerce-shoes.home.hero.HeroSlider.slide-0.headline",
    "HeroSlider slide 0 headline canonical ID formatted correctly"
  );

  const idHeader = buildCanonicalTargetId({
    templateKey: "global",
    pageSlug: "global",
    sectionKey: "header",
    componentKey: "Header",
    instanceKey: "main",
    fieldKey: "storeName",
  });
  assert(
    idHeader === "global.global.header.Header.main.storeName",
    "Header storeName canonical ID formatted correctly"
  );

  const idNav = buildCanonicalTargetId({
    templateKey: "global",
    pageSlug: "global",
    sectionKey: "header",
    componentKey: "Header",
    instanceKey: "nav-2",
    fieldKey: "label",
  });
  assert(
    idNav === "global.global.header.Header.nav-2.label",
    "Header nav item 2 label canonical ID formatted correctly"
  );

  // 2. Canonical Target ID Parsing
  console.log("\n--- 2. Canonical Target ID Parsing ---");
  const parsed1 = parseCanonicalTargetId("ecommerce-shoes.home.hero.HeroSlider.slide-0.headline");
  assert(parsed1.isCanonical === true, "Identified as canonical target ID");
  assert(parsed1.templateKey === "ecommerce-shoes", "Extracted templateKey: ecommerce-shoes");
  assert(parsed1.pageSlug === "home", "Extracted pageSlug: home");
  assert(parsed1.sectionKey === "hero", "Extracted sectionKey: hero");
  assert(parsed1.componentKey === "HeroSlider", "Extracted componentKey: HeroSlider");
  assert(parsed1.instanceKey === "slide-0", "Extracted instanceKey: slide-0");
  assert(parsed1.fieldKey === "headline", "Extracted fieldKey: headline");
  assert(parsed1.itemIndex === 0, "Extracted itemIndex: 0");

  const parsedLegacy = parseCanonicalTargetId("HeroSection.slide0.headline");
  assert(parsedLegacy.isCanonical === false, "Legacy target ID identified as non-canonical");
  assert(parsedLegacy.componentKey === "HeroSection", "Legacy extracted componentKey: HeroSection");
  assert(parsedLegacy.fieldKey === "headline", "Legacy extracted fieldKey: headline");
  assert(parsedLegacy.itemIndex === 0, "Legacy extracted itemIndex: 0");

  // 3. Multi-tier Lookup Chain (Backwards Compatibility Guarantee)
  console.log("\n--- 3. Multi-Tier Alias Lookup Chain ---");
  const lookupKeys = getCanonicalLookupKeys("ecommerce-shoes.home.hero.HeroSlider.slide-0.headline");
  assert(lookupKeys.includes("ecommerce-shoes.home.hero.HeroSlider.slide-0.headline"), "Includes exact canonical key");
  assert(lookupKeys.includes("HeroSlider.slide0.headline"), "Includes legacy slide0 alias");
  assert(lookupKeys.includes("HeroSlider.headline"), "Includes top-level component.field alias");
  assert(lookupKeys.includes("home.hero-slider.slides.0.headline"), "Includes scoped template alias");

  // Simulate mock override store resolving via getCanonicalLookupKeys
  const mockOverrides: Record<string, string> = {
    "HeroSlider.slide0.headline": "Legacy Stored Headline",
  };

  function resolveOverride(targetId: string): string | undefined {
    const candidates = getCanonicalLookupKeys(targetId);
    for (const key of candidates) {
      if (mockOverrides[key] !== undefined) {
        return mockOverrides[key];
      }
    }
    return undefined;
  }

  const resolved = resolveOverride("ecommerce-shoes.home.hero.HeroSlider.slide-0.headline");
  assert(
    resolved === "Legacy Stored Headline",
    "Canonical target ID resolves existing legacy override key in store"
  );

  // 4. Universal Component Adapter Realism
  console.log("\n--- 4. Component Adapter Truthfulness ---");
  const unverified = buildUniversalComponentAdapter("UnknownCustomComponent");
  assert(unverified.status === "VIEW_ONLY", "Unverified component has VIEW_ONLY status");
  assert(Object.keys(unverified.properties).length === 0, "Unverified component has zero fictitious properties");
  assert(
    unverified.missingProperties?.includes("unverified_component_fields") === true,
    "Unverified component flags unverified_component_fields"
  );

  const heroSlider = getEditableComponent("HeroSlider");
  assert(heroSlider !== undefined, "HeroSlider adapter is registered");
  assert(heroSlider?.status === "FULLY_EDITABLE", "HeroSlider has FULLY_EDITABLE status");
  assert(heroSlider?.properties["headline"] !== undefined, "HeroSlider exposes real headline field");

  const header = getEditableComponent("Header");
  assert(header !== undefined, "Header adapter is registered");
  assert(header?.properties["storeName"] !== undefined, "Header exposes storeName field");
  assert(header?.properties["nav.0.label"] !== undefined, "Header exposes nav.0.label field");

  const footer = getEditableComponent("Footer");
  assert(footer !== undefined, "Footer adapter is registered");
  assert(footer?.properties["brandName"] !== undefined, "Footer exposes brandName field");
  assert(footer?.properties["copyrightText"] !== undefined, "Footer exposes copyrightText field");

  console.log("\n=======================================================");
  console.log(`📊 CANONICAL DATA FLOW RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runCanonicalTargetIdTests();
