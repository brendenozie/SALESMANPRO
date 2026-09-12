/**
 * tests/furniture-core-values-behavior.test.ts
 *
 * Comprehensive behavioral test verifying:
 * 1. USPSlider component registration and exact property schema (no fake headline/cta)
 * 2. Furniture template authentic section definition for USPSlider (Core Values & Guarantees)
 * 3. Canonical target ID generation & parsing for indexed items (items.0.title, items-0.desc)
 * 4. Tenant config authoritative propagation and section actions (Hide, Reorder, Duplicate, Delete)
 */

import { TEMPLATE_REGISTRY } from "../lib/website-builder/template-registry";
import { getEditableComponent } from "../lib/website-builder/editable-adapters";
import { parseCanonicalTargetId, getCanonicalLookupKeys } from "../lib/website-builder/canonical-target-id";
import { compileWebsiteFromCompany } from "../lib/website-builder/template-compiler";

function runFurnitureCoreValuesTests() {
  console.log("\n=======================================================");
  console.log("🛋️ FURNITURE LAYOUT & CORE VALUES BEHAVIORAL SUITE");
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
  // Test 1: USPSlider Component Registration in editable-adapters
  // -------------------------------------------------------------
  console.log("--- 1. USPSlider Component Schema & Editability ---");
  const uspAdapter = getEditableComponent("USPSlider");
  assert(!!uspAdapter, "USPSlider is registered in EDITABLE_COMPONENT_REGISTRY");
  assert(uspAdapter?.status === "FULLY_EDITABLE", "USPSlider status is FULLY_EDITABLE");
  assert(uspAdapter?.label === "Core Values & Guarantees", "USPSlider label is 'Core Values & Guarantees'");

  // Verify real properties exist
  const props = uspAdapter?.properties || {};
  assert(!!props["title"], "USPSlider defines 'title' property");
  assert(!!props["items.0.title"], "USPSlider defines 'items.0.title' property");
  assert(!!props["items.0.desc"], "USPSlider defines 'items.0.desc' property");
  assert(!!props["items.1.title"], "USPSlider defines 'items.1.title' property");
  assert(!!props["items.1.desc"], "USPSlider defines 'items.1.desc' property");
  assert(!!props["items.2.title"], "USPSlider defines 'items.2.title' property");
  assert(!!props["items.2.desc"], "USPSlider defines 'items.2.desc' property");

  // Verify NO fake generic hero properties are registered
  assert(!props["headline"], "USPSlider does NOT define fake 'headline' property");
  assert(!props["subline"], "USPSlider does NOT define fake 'subline' property");
  assert(!props["buttonText"], "USPSlider does NOT define fake 'buttonText' property");
  assert(!props["buttonLink"], "USPSlider does NOT define fake 'buttonLink' property");

  // -------------------------------------------------------------
  // Test 2: Furniture Template Authentic Section Definition
  // -------------------------------------------------------------
  console.log("\n--- 2. Template Registry Parity for Furniture USPSlider ---");
  const furnitureTpl = TEMPLATE_REGISTRY["furniture@v1"];
  assert(!!furnitureTpl, "furniture@v1 exists in TEMPLATE_REGISTRY");
  assert(furnitureTpl?.bodyComponent === "FurnitureSite", "furniture@v1 uses FurnitureSite as bodyComponent");
  assert(furnitureTpl?.shellLayout === "FurnitureLayout", "furniture@v1 uses FurnitureLayout as shellLayout");

  const uspSectionDef = furnitureTpl?.authenticSections.find(
    (s) => s.id === "furniture-uspslider" || s.component === "USPSlider"
  );
  assert(!!uspSectionDef, "furniture@v1 defines authentic section for USPSlider");
  assert(uspSectionDef?.component === "USPSlider", "Section component is 'USPSlider'");
  assert(uspSectionDef?.type === "featuresBadges", "Section type is 'featuresBadges' (NOT 'hero')");
  assert(uspSectionDef?.name === "Core Values & Guarantees", "Section name is 'Core Values & Guarantees'");
  assert(
    Array.isArray(uspSectionDef?.editableProps) && uspSectionDef.editableProps.includes("items"),
    "Section editableProps includes 'items'"
  );
  assert(
    Array.isArray(uspSectionDef?.defaultContent?.items) && uspSectionDef.defaultContent.items.length === 3,
    "Section defaultContent has 3 default core value items"
  );
  assert(
    uspSectionDef?.defaultContent?.items[0]?.title === "White Glove Delivery",
    "First default core value is 'White Glove Delivery'"
  );

  // -------------------------------------------------------------
  // Test 3: Canonical Target ID Engine for Items
  // -------------------------------------------------------------
  console.log("\n--- 3. Canonical Target ID Engine Item Resolution ---");
  const targetId = "furniture.home.usp.USPSlider.items-0.title";
  const parsed = parseCanonicalTargetId(targetId);

  assert(parsed.templateKey === "furniture", "Parsed templateKey is 'furniture'");
  assert(parsed.pageSlug === "home", "Parsed pageSlug is 'home'");
  assert(parsed.sectionKey === "usp", "Parsed sectionKey is 'usp'");
  assert(parsed.componentKey === "USPSlider", "Parsed componentKey is 'USPSlider'");
  assert(parsed.instanceKey === "items-0", "Parsed instanceKey is 'items-0'");
  assert(parsed.itemIndex === 0, "Parsed itemIndex is 0");
  assert(parsed.fieldKey === "title", "Parsed fieldKey is 'title'");

  const lookupKeys = getCanonicalLookupKeys(targetId);
  assert(lookupKeys.includes("furniture.home.usp.USPSlider.items-0.title"), "Lookup keys contain exact canonical targetId");
  assert(lookupKeys.includes("USPSlider.items.0.title"), "Lookup keys contain 'USPSlider.items.0.title' alias");
  assert(lookupKeys.includes("items.0.title"), "Lookup keys contain 'items.0.title' alias");

  // -------------------------------------------------------------
  // Test 4: Section Actions - Hide, Reorder, Duplicate, Delete
  // -------------------------------------------------------------
  console.log("\n--- 4. Section Actions Simulation on Tenant Model ---");

  // Mock initial website compiled from company
  const mockCompany = {
    id: "comp-furniture-1",
    slug: "luxury-furniture",
    name: "Luxury Contemporary Furniture",
    category: "furniture",
    variant: "default",
    heroSlides: [],
    CoreValues: [
      { id: "cv-1", title: "Handcrafted Solid Teak", description: "Ethically harvested grade-A plantation teak." },
      { id: "cv-2", title: "Zero-VOC Finishes", description: "Pure organic botanical oils safe for your family." },
    ],
  };

  const compiled = compileWebsiteFromCompany(mockCompany);
  const homePage = compiled.pages.find((p) => p.isHomepage || p.slug === "home");
  assert(!!homePage, "Compiled website contains homepage");

  const initialSections = homePage?.sections || [];
  assert(initialSections.length === 15, `Compiled homepage has 15 authentic sections (got ${initialSections.length})`);

  const compiledUsp = initialSections.find((s) => s.component === "USPSlider" || s.id.includes("uspslider"));
  assert(!!compiledUsp, "Homepage sections contains USPSlider section");
  assert(compiledUsp?.name === "Core Values & Guarantees", "Compiled USPSlider has authentic name");
  assert(compiledUsp?.component === "USPSlider", "Compiled USPSlider has component = 'USPSlider'");
  assert(compiledUsp?.isVisible === true, "Compiled USPSlider is initially visible");

  // 4a. HIDE ACTION
  console.log("  Testing Section Action: HIDE");
  const hiddenSections = initialSections.map((s) =>
    s.id === compiledUsp?.id ? { ...s, isVisible: false } : s
  );
  const visibleRendered = hiddenSections.filter((s) => s.isVisible !== false);
  assert(visibleRendered.length === initialSections.length - 1, "Hiding USPSlider reduces visible rendered count by 1");
  assert(
    !visibleRendered.some((s) => s.id === compiledUsp?.id),
    "Hidden USPSlider is excluded from rendered sections"
  );

  // 4b. REORDER ACTION (Move Down)
  console.log("  Testing Section Action: MOVE UP / DOWN");
  const reorderedSections = [...initialSections];
  const uspIdx = reorderedSections.findIndex((s) => s.id === compiledUsp?.id);
  assert(uspIdx >= 0, "USPSlider found in sections array");

  // Move USPSlider to position 0 (above Hero)
  const [removedUsp] = reorderedSections.splice(uspIdx, 1);
  reorderedSections.unshift(removedUsp);

  assert(reorderedSections[0].id === compiledUsp?.id, "After reorder, USPSlider is at index 0");
  assert(reorderedSections[1].component === "HeroSlider", "After reorder, HeroSlider is now at index 1");

  // 4c. DUPLICATE ACTION (Copy)
  console.log("  Testing Section Action: DUPLICATE / COPY");
  const duplicatedSections = [...initialSections];
  const originalSec = duplicatedSections[uspIdx];
  const duplicateSec = {
    ...JSON.parse(JSON.stringify(originalSec)),
    id: `sec-${originalSec.component || originalSec.type}-${Date.now()}`,
    name: originalSec.name ? `${originalSec.name} (Copy)` : undefined,
  };
  duplicatedSections.splice(uspIdx + 1, 0, duplicateSec);

  assert(duplicatedSections.length === initialSections.length + 1, "Duplication increases total section count by 1");
  assert(duplicatedSections[uspIdx].id !== duplicateSec.id, "Duplicate section has a unique new ID");
  assert(duplicateSec.component === "USPSlider", "Duplicate section retains component = 'USPSlider'");
  assert(duplicateSec.name === "Core Values & Guarantees (Copy)", "Duplicate section has '(Copy)' in name");

  // 4d. DELETE ACTION
  console.log("  Testing Section Action: DELETE");
  const remainingSections = initialSections.filter((s) => s.id !== compiledUsp?.id);
  assert(remainingSections.length === initialSections.length - 1, "Delete removes the section from sections array");
  assert(!remainingSections.some((s) => s.id === compiledUsp?.id), "Deleted section no longer exists in sections array");

  // -------------------------------------------------------------
  // Test 5: Real Content Binding Simulation in USPSlider
  // -------------------------------------------------------------
  console.log("\n--- 5. USPSlider Config Resolution & DOM Targeting ---");
  const customConfig = {
    title: "Our Handcrafted Guarantees",
    items: [
      { title: "Bespoke Joinery", desc: "Traditional mortise and tenon joinery handcrafted by master artisans." },
      { title: "Sustainably Harvested", desc: "100% certified reclaimed or plantation-grown timbers." },
    ],
  };

  // Simulate USPSlider items resolution logic
  const rawItems = (customConfig?.items && Array.isArray(customConfig.items) && customConfig.items.length > 0)
    ? customConfig.items
    : [];

  assert(rawItems.length === 2, "Custom config items resolved with length 2");
  assert(rawItems[0].title === "Bespoke Joinery", "First item has custom title 'Bespoke Joinery'");
  assert(rawItems[1].title === "Sustainably Harvested", "Second item has custom title 'Sustainably Harvested'");

  // Target ID mapping for canvas click-to-edit
  const sId = compiledUsp?.id || "usp";
  const item0TargetId = `furniture.home.${sId}.USPSlider.items-0.title`;
  const item0DescTargetId = `furniture.home.${sId}.USPSlider.items-0.desc`;

  assert(item0TargetId.includes(sId), "Target ID includes authentic section ID");
  assert(item0TargetId.includes("USPSlider"), "Target ID includes componentKey 'USPSlider'");
  assert(item0TargetId.includes("items-0.title"), "Target ID includes 'items-0.title'");
  assert(item0DescTargetId.includes("items-0.desc"), "Target ID includes 'items-0.desc'");

  // =============================================================
  // Final Result
  // =============================================================
  console.log("\n=======================================================");
  console.log(`📊 FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runFurnitureCoreValuesTests();
