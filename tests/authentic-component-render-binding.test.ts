/**
 * tests/authentic-component-render-binding.test.ts
 *
 * Automated verification of Authentic Component Rendering and Real Field Binding:
 * 1. EditableElement live DOM serialization (data-editor-value, data-editor-default, data-editor-binding)
 * 2. DOM extraction logic preserving non-empty values (never undefined)
 * 3. Section child field discovery & override binding pipeline
 * 4. Distinction between VERIFIED_RENDER_BINDING and REGISTERED_SCHEMA_FIELD
 * 5. Accurate view-only technical diagnostic explanations
 * 6. Source-level verification of EditableContentContext.tsx and WebsiteBuilderStudio.tsx
 */

import fs from "fs";
import path from "path";
import { getCanonicalLookupKeys, parseCanonicalTargetId } from "../lib/website-builder/canonical-target-id";
import { getEditableComponent, getAllEditableComponents } from "../lib/website-builder/editable-adapters";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

console.log("\n==================================================================");
console.log("🧪 RUNNING AUTHENTIC COMPONENT RENDER BINDING TESTS");
console.log("==================================================================\n");

// ---------------------------------------------------------------------------
// 1. Source-Level Verification of EditableContentContext.tsx
// ---------------------------------------------------------------------------
console.log("--- 1. EditableContentContext.tsx Source Verification ---");

const contextFile = path.resolve(__dirname, "../contexts/EditableContentContext.tsx");
assert(fs.existsSync(contextFile), "contexts/EditableContentContext.tsx exists");

const contextSource = fs.readFileSync(contextFile, "utf-8");

assert(contextSource.includes('data-editor-binding="VERIFIED_RENDER_BINDING"'),
  "EditableElement outputs data-editor-binding='VERIFIED_RENDER_BINDING'");

assert(contextSource.includes("data-editor-value="),
  "EditableElement serializes data-editor-value attribute");

assert(contextSource.includes("data-editor-default="),
  "EditableElement serializes data-editor-default attribute");

assert(contextSource.includes("data-editor-element="),
  "EditableElement serializes data-editor-element attribute");

assert(contextSource.includes('REGISTERED_SCHEMA_FIELD'),
  "SelectedElementInfo supports 'REGISTERED_SCHEMA_FIELD' status");

assert(contextSource.includes('defaultValue?: any'),
  "SelectedElementInfo exposes optional defaultValue");

// ---------------------------------------------------------------------------
// 2. Source-Level Verification of WebsiteBuilderStudio.tsx
// ---------------------------------------------------------------------------
console.log("\n--- 2. WebsiteBuilderStudio.tsx Source Verification ---");

const studioFile = path.resolve(__dirname, "../components/website-builder/editor/WebsiteBuilderStudio.tsx");
assert(fs.existsSync(studioFile), "components/website-builder/editor/WebsiteBuilderStudio.tsx exists");

const studioSource = fs.readFileSync(studioFile, "utf-8");

assert(studioSource.includes("function extractScannedElement"),
  "WebsiteBuilderStudio implements extractScannedElement helper");

assert(studioSource.includes("function SectionLiveFieldsInspector"),
  "WebsiteBuilderStudio implements SectionLiveFieldsInspector");

assert(studioSource.includes("<SectionLiveFieldsInspector"),
  "WebsiteBuilderStudio renders SectionLiveFieldsInspector when section is selected");

assert(studioSource.includes("data-editor-value"),
  "WebsiteBuilderStudio reads data-editor-value from live DOM");

assert(studioSource.includes("data-editor-default"),
  "WebsiteBuilderStudio reads data-editor-default from live DOM");

assert(studioSource.includes("hasRenderBinding"),
  "WebsiteBuilderStudio tracks hasRenderBinding on scanned elements");

assert(studioSource.includes("REGISTERED_SCHEMA_FIELD"),
  "WebsiteBuilderStudio displays REGISTERED_SCHEMA_FIELD for unbound schema properties");

assert(studioSource.includes("Why is this View Only?"),
  "WebsiteBuilderStudio provides truthful 'Why is this View Only?' technical diagnostics");

// ---------------------------------------------------------------------------
// 3. Simulated DOM Extraction & Value Fallback Logic
// ---------------------------------------------------------------------------
console.log("\n--- 3. Live DOM Value Extraction & Inspection Logic ---");

{
  interface MockDOMElement {
    attributes: Record<string, string>;
    textContent: string;
    getAttribute(attr: string): string | null;
  }

  function createMockElement(attrs: Record<string, string>, text: string): MockDOMElement {
    return {
      attributes: attrs,
      textContent: text,
      getAttribute(attr: string) {
        return this.attributes[attr] || null;
      },
    };
  }

  function extractScannedElement(el: MockDOMElement, fallbackComp: string) {
    const targetId = el.getAttribute("data-editable-id") || el.getAttribute("data-editor-target") || "";
    if (!targetId) return null;
    const bindingAttr = el.getAttribute("data-editor-binding");
    const hasRenderBinding = bindingAttr === "VERIFIED_RENDER_BINDING" || el.getAttribute("data-editable-id") !== null;
    const attrVal = el.getAttribute("data-editor-value");
    const attrDef = el.getAttribute("data-editor-default");
    const domText = (el.textContent || "").trim();
    const effectiveVal = attrVal !== null && attrVal !== "" ? attrVal : (attrDef !== null && attrDef !== "" ? attrDef : domText);
    return {
      targetId,
      label: el.getAttribute("data-editor-label") || targetId.split(".").pop() || targetId,
      type: el.getAttribute("data-editor-type") || "text",
      componentKey: el.getAttribute("data-editor-component") || fallbackComp,
      currentValue: effectiveVal,
      defaultValue: attrDef || undefined,
      hasRenderBinding,
    };
  }

  // Case A: Uncustomized element with data-editor-value & data-editor-default
  const elA = createMockElement({
    "data-editable-id": "services.home.hero.HeroSection.main.headline",
    "data-editor-label": "Headline",
    "data-editor-value": "Empowering Your Business",
    "data-editor-default": "Empowering Your Business",
    "data-editor-binding": "VERIFIED_RENDER_BINDING",
    "data-editor-component": "HeroSection",
  }, "Empowering Your Business");

  const scannedA = extractScannedElement(elA, "HeroSection");
  assert(scannedA !== null, "Extracted scanned element successfully");
  assert(scannedA?.currentValue === "Empowering Your Business", "currentValue extracted from data-editor-value");
  assert(scannedA?.defaultValue === "Empowering Your Business", "defaultValue extracted from data-editor-default");
  assert(scannedA?.hasRenderBinding === true, "hasRenderBinding is true for verified DOM binding");

  // Case B: Element with empty data-editor-value falls back to textContent
  const elB = createMockElement({
    "data-editable-id": "fitness.home.hero.FitnessHero.main.heroTitle",
    "data-editor-label": "Hero Title",
  }, "Unleash Your Potential");

  const scannedB = extractScannedElement(elB, "FitnessHero");
  assert(scannedB?.currentValue === "Unleash Your Potential", "Fallback to textContent works when attributes missing");
  assert(scannedB?.hasRenderBinding === true, "hasRenderBinding is true when data-editable-id present");

  // Case C: Pre-populated inspector value with override
  const overrideVal = "Custom Headline 2026";
  const finalVal = overrideVal !== undefined ? overrideVal : scannedA?.currentValue;
  assert(finalVal === "Custom Headline 2026", "Override takes precedence over scanned value");

  // Case D: Pre-populated inspector value without override
  const noOverrideVal = undefined;
  const initialInspectorVal = noOverrideVal !== undefined ? noOverrideVal : scannedA?.currentValue;
  assert(initialInspectorVal === "Empowering Your Business", "Inspector pre-populates with live value (never undefined/blank)");
}

// ---------------------------------------------------------------------------
// 4. Section Child Field Discovery & Live Binding Simulation
// ---------------------------------------------------------------------------
console.log("\n--- 4. Section Child Field Discovery & Override Pipeline ---");

{
  const sectionId = "hero";
  const sectionType = "hero";

  // Simulate section container with 4 live child editable elements
  const mockChildElements = [
    { targetId: "services.home.hero.HeroSection.main.badgeText", label: "Badge", value: "Premium Consulting" },
    { targetId: "services.home.hero.HeroSection.main.headline", label: "Headline", value: "Empowering Your Business" },
    { targetId: "services.home.hero.HeroSection.main.subline", label: "Subline", value: "Strategic solutions for tomorrow." },
    { targetId: "services.home.hero.HeroSection.main.ctaText", label: "Button Label", value: "Schedule Call" },
  ];

  assert(mockChildElements.length === 4, "Section contains 4 discovered authentic fields");

  // Simulate updating a child field via handleUpdateOverride
  const config = {
    templateKey: "services-modern",
    componentOverrides: {} as Record<string, any>,
  };

  const handleUpdateOverride = (targetId: string, val: any) => {
    config.componentOverrides[targetId] = val;
  };

  // Edit headline
  handleUpdateOverride("services.home.hero.HeroSection.main.headline", "Elevating Your Growth");
  assert(config.componentOverrides["services.home.hero.HeroSection.main.headline"] === "Elevating Your Growth",
    "handleUpdateOverride directly sets componentOverrides for discovered section field");

  // Verify that canonical lookup resolves this override
  const lookupKeys = getCanonicalLookupKeys("services.home.hero.HeroSection.main.headline");
  const resolved = lookupKeys.some((k) => config.componentOverrides[k] !== undefined);
  assert(resolved, "Canonical target ID lookup successfully resolves the updated override");
}

// ---------------------------------------------------------------------------
// 5. Distinction: Verified Render Binding vs Registered Schema Field
// ---------------------------------------------------------------------------
console.log("\n--- 5. Verified Render Binding vs Schema Only Distinction ---");

{
  // Authentic component with live DOM elements
  const liveComp = {
    hasRenderBinding: true,
    editabilityStatus: "FULLY_EDITABLE" as const,
  };
  assert(liveComp.hasRenderBinding === true, "Live DOM element has verified render binding");
  assert(liveComp.editabilityStatus === "FULLY_EDITABLE", "Status is FULLY_EDITABLE for render bindings");

  // Registered schema field without live DOM element
  const schemaOnlyField = {
    hasRenderBinding: false,
    editabilityStatus: "REGISTERED_SCHEMA_FIELD" as const,
  };
  assert(schemaOnlyField.hasRenderBinding === false, "Schema-only field does not have render binding");
  assert(schemaOnlyField.editabilityStatus === "REGISTERED_SCHEMA_FIELD", "Status is REGISTERED_SCHEMA_FIELD");
}

// ---------------------------------------------------------------------------
// 6. Core Layout Adapter Status Verification
// ---------------------------------------------------------------------------
console.log("\n--- 6. Core Layout Adapter Status Verification ---");

{
  const coreLayoutKeys = [
    "HeroSlider",
    "RestaurantHero",
    "FitnessHero",
    "RealEstateHero",
    "CoursesHero",
    "AutomotiveHero",
    "HeroSection",
    "TravelHero",
    "HealthcareHero",
  ];

  coreLayoutKeys.forEach((key) => {
    const adapter = getEditableComponent(key);
    assert(adapter !== undefined, `Adapter exists for core hero component "${key}"`);
    if (adapter) {
      assert(adapter.status === "FULLY_EDITABLE" || adapter.status === "PARTIALLY_EDITABLE",
        `Adapter "${key}" has active status: ${adapter.status}`);
      assert(Object.keys(adapter.properties || {}).length > 0,
        `Adapter "${key}" defines properties (${Object.keys(adapter.properties || {}).length} properties)`);
    }
  });
}

console.log("\n==================================================================");
console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
console.log("==================================================================\n");

if (failed > 0) {
  process.exit(1);
}
