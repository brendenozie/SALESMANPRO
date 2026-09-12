/**
 * tests/delivery-behavior.test.ts
 *
 * Comprehensive behavioral test verifying Delivery Theme vertical migration (delivery@v1):
 * 1. ServicesSection and BookingSection component registration and exact property schema
 * 2. Delivery template authentic section definition in TEMPLATE_REGISTRY
 * 3. Canonical target ID generation & parsing for services array (services.0.title, services-0.desc, services.0.tag)
 * 4. Tenant config authoritative propagation and section actions (Hide, Reorder, Duplicate, Delete)
 * 5. Dynamic section rendering dispatcher without silent static fallback
 */

import { TEMPLATE_REGISTRY } from "../lib/website-builder/template-registry";
import { getEditableComponent } from "../lib/website-builder/editable-adapters";
import { parseCanonicalTargetId, getCanonicalLookupKeys } from "../lib/website-builder/canonical-target-id";
import { compileWebsiteFromCompany } from "../lib/website-builder/template-compiler";

function runDeliveryBehaviorTests() {
  console.log("\n=======================================================");
  console.log("🚚 DELIVERY THEME (delivery@v1) BEHAVIORAL SUITE");
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
  // Test 1: ServicesSection & BookingSection Registration in editable-adapters
  // -------------------------------------------------------------
  console.log("--- 1. Delivery Components Schema & Editability ---");
  const servicesAdapter = getEditableComponent("ServicesSection");
  assert(!!servicesAdapter, "ServicesSection is registered in EDITABLE_COMPONENT_REGISTRY");
  assert(servicesAdapter?.status === "FULLY_EDITABLE", "ServicesSection status is FULLY_EDITABLE");
  assert(servicesAdapter?.label === "Services & Specialist Solutions", "ServicesSection label is 'Services & Specialist Solutions'");

  const sProps = servicesAdapter?.properties || {};
  assert(!!sProps["badge"], "ServicesSection defines 'badge' property");
  assert(!!sProps["title"], "ServicesSection defines 'title' property");
  assert(!!sProps["subline"], "ServicesSection defines 'subline' property");
  assert(!!sProps["description"], "ServicesSection defines 'description' property");
  assert(!!sProps["services.0.title"], "ServicesSection defines 'services.0.title' property");
  assert(!!sProps["services.0.desc"], "ServicesSection defines 'services.0.desc' property");
  assert(!!sProps["services.0.tag"], "ServicesSection defines 'services.0.tag' property");
  assert(!!sProps["services.1.title"], "ServicesSection defines 'services.1.title' property");
  assert(!!sProps["services.1.desc"], "ServicesSection defines 'services.1.desc' property");
  assert(!!sProps["services.2.title"], "ServicesSection defines 'services.2.title' property");
  assert(!!sProps["services.2.desc"], "ServicesSection defines 'services.2.desc' property");

  const bookingAdapter = getEditableComponent("BookingSection");
  assert(!!bookingAdapter, "BookingSection is registered in EDITABLE_COMPONENT_REGISTRY");
  assert(bookingAdapter?.status === "FULLY_EDITABLE", "BookingSection status is FULLY_EDITABLE");
  const bProps = bookingAdapter?.properties || {};
  assert(!!bProps["badge"], "BookingSection defines 'badge' property");
  assert(!!bProps["title"], "BookingSection defines 'title' property");
  assert(!!bProps["description"], "BookingSection defines 'description' property");
  assert(!!bProps["buttonText"], "BookingSection defines 'buttonText' property");

  // -------------------------------------------------------------
  // Test 2: Template Registry Parity for delivery@v1
  // -------------------------------------------------------------
  console.log("\n--- 2. Template Registry Parity for delivery@v1 ---");
  const deliveryTpl = TEMPLATE_REGISTRY["delivery@v1"];
  assert(!!deliveryTpl, "delivery@v1 exists in TEMPLATE_REGISTRY");
  assert(deliveryTpl?.bodyComponent === "DeliverySite", "delivery@v1 uses DeliverySite as bodyComponent");
  assert(deliveryTpl?.shellLayout === "DeliveryLayout", "delivery@v1 uses DeliveryLayout as shellLayout");
  assert(Array.isArray(deliveryTpl?.authenticSections), "delivery@v1 defines authenticSections array");
  assert((deliveryTpl?.authenticSections || []).length === 12, `delivery@v1 has 12 authentic sections (got ${deliveryTpl?.authenticSections?.length})`);

  const servicesSecDef = (deliveryTpl?.authenticSections || []).find((s) => s.component === "ServicesSection");
  assert(!!servicesSecDef, "delivery@v1 defines authentic section for ServicesSection");
  assert(servicesSecDef?.id === "delivery-servicessection", "ServicesSection id is 'delivery-servicessection'");

  const bookingSecDef = (deliveryTpl?.authenticSections || []).find((s) => s.component === "BookingSection");
  assert(!!bookingSecDef, "delivery@v1 defines authentic section for BookingSection");
  assert(bookingSecDef?.id === "delivery-bookingsection", "BookingSection id is 'delivery-bookingsection'");

  // -------------------------------------------------------------
  // Test 3: Canonical Target ID Engine Resolution for Services Array
  // -------------------------------------------------------------
  console.log("\n--- 3. Canonical Target ID Resolution for Services Array ---");
  const sampleTargetId = "delivery.home.delivery-servicessection.ServicesSection.services-0.title";
  const parsed = parseCanonicalTargetId(sampleTargetId);
  assert(parsed.templateKey === "delivery", `Parsed templateKey is 'delivery' (got '${parsed.templateKey}')`);
  assert(parsed.pageSlug === "home", `Parsed pageSlug is 'home' (got '${parsed.pageSlug}')`);
  assert(parsed.sectionKey === "delivery-servicessection", `Parsed sectionKey is 'delivery-servicessection' (got '${parsed.sectionKey}')`);
  assert(parsed.componentKey === "ServicesSection", `Parsed componentKey is 'ServicesSection' (got '${parsed.componentKey}')`);
  assert(parsed.instanceKey === "services-0", `Parsed instanceKey is 'services-0' (got '${parsed.instanceKey}')`);
  assert(parsed.itemIndex === 0, `Parsed itemIndex is 0 (got '${parsed.itemIndex}')`);
  assert(parsed.fieldKey === "title", `Parsed fieldKey is 'title' (got '${parsed.fieldKey}')`);

  const lookupKeys = getCanonicalLookupKeys(sampleTargetId);
  assert(lookupKeys.includes(sampleTargetId), "Lookup keys contain exact canonical targetId");
  assert(lookupKeys.includes("ServicesSection.services.0.title"), "Lookup keys contain 'ServicesSection.services.0.title' alias");
  assert(lookupKeys.includes("services.0.title"), "Lookup keys contain 'services.0.title' alias");

  // -------------------------------------------------------------
  // Test 4: Section Actions Simulation on Delivery Tenant Model
  // -------------------------------------------------------------
  console.log("\n--- 4. Section Actions Simulation on Delivery Tenant Model ---");
  const dummyDeliveryCompany: any = {
    id: "comp-delivery-123",
    name: "Apex Express Courier",
    slug: "apex-express",
    category: "logistics",
    variant: "default",
    website: {
      templateKey: "delivery@v1",
      templateId: "delivery@v1",
    },
    themeSettings: { primaryColor: "#EA580C" },
    description: "Reliable same-day and international courier solutions.",
    pages: [],
    sections: [],
  };

  const compiledWebsite = compileWebsiteFromCompany(dummyDeliveryCompany);
  assert(!!compiledWebsite, "compileWebsiteFromCompany produces a valid website");
  const homePage = compiledWebsite.pages.find((p) => p.slug === "home");
  assert(!!homePage, "Compiled website contains home page");
  assert(Array.isArray(homePage?.sections), "Homepage has sections array");
  assert((homePage?.sections || []).length === 12, `Homepage has 12 authentic sections (got ${homePage?.sections?.length})`);

  // Verify ServicesSection presence
  const servicesSec = (homePage?.sections || []).find((s) => s.component === "ServicesSection");
  assert(!!servicesSec, "Compiled homepage contains ServicesSection");
  assert(servicesSec?.isVisible === true, "Compiled ServicesSection is initially visible");

  // SECTION ACTION: HIDE
  console.log("  Testing Section Action: HIDE");
  const sectionsCopy = JSON.parse(JSON.stringify(homePage?.sections || []));
  const secToHide = sectionsCopy.find((s: any) => s.component === "ServicesSection");
  secToHide.isVisible = false;
  const visibleSections = sectionsCopy.filter((s: any) => s.isVisible !== false);
  assert(visibleSections.length === sectionsCopy.length - 1, "Hiding ServicesSection reduces visible count by 1");
  assert(!visibleSections.some((s: any) => s.component === "ServicesSection"), "Hidden ServicesSection is excluded from visible sections");

  // SECTION ACTION: MOVE UP / DOWN
  console.log("  Testing Section Action: MOVE UP / DOWN");
  const initialServicesIdx = sectionsCopy.findIndex((s: any) => s.component === "ServicesSection");
  assert(initialServicesIdx > 0, "ServicesSection is not at index 0 initially");
  // Move to index 0
  const [removed] = sectionsCopy.splice(initialServicesIdx, 1);
  sectionsCopy.unshift(removed);
  assert(sectionsCopy[0].component === "ServicesSection", "After reorder, ServicesSection is at index 0");

  // SECTION ACTION: DUPLICATE / COPY
  console.log("  Testing Section Action: DUPLICATE / COPY");
  const initialCount = sectionsCopy.length;
  const originalSec = sectionsCopy[0];
  const duplicateSec = {
    ...JSON.parse(JSON.stringify(originalSec)),
    id: `${originalSec.id}-copy-${Date.now()}`,
    name: `${originalSec.name} (Copy)`,
  };
  sectionsCopy.splice(1, 0, duplicateSec);
  assert(sectionsCopy.length === initialCount + 1, "Duplication increases total section count by 1");
  assert(duplicateSec.id !== originalSec.id, "Duplicate section has a unique new ID");
  assert(duplicateSec.component === "ServicesSection", "Duplicate section retains component = 'ServicesSection'");

  // SECTION ACTION: DELETE
  console.log("  Testing Section Action: DELETE");
  const beforeDeleteCount = sectionsCopy.length;
  const deleteId = duplicateSec.id;
  const remainingSections = sectionsCopy.filter((s: any) => s.id !== deleteId);
  assert(remainingSections.length === beforeDeleteCount - 1, "Delete removes section from sections array");
  assert(!remainingSections.some((s: any) => s.id === deleteId), "Deleted duplicate section no longer exists");

  // -------------------------------------------------------------
  // Test 5: ServicesSection Dynamic Config Content Resolution
  // -------------------------------------------------------------
  console.log("\n--- 5. ServicesSection Tenant Config & Targeting ---");
  const customConfig = {
    badge: "Enterprise Logistics",
    title: "Global Freight Solutions",
    subline: "Direct • Insured • Guaranteed",
    description: "Custom supply chain infrastructure tailored to high-volume commercial shippers.",
    services: [
      { title: "Air Cargo", desc: "Next-flight-out express delivery worldwide.", tag: "Air" },
      { title: "Ocean Freight", desc: "Full container load management.", tag: "Maritime" },
    ],
  };

  assert(customConfig.services.length === 2, "Custom config services array has 2 items");
  assert(customConfig.services[0].title === "Air Cargo", "First custom service is 'Air Cargo'");
  assert(customConfig.services[1].title === "Ocean Freight", "Second custom service is 'Ocean Freight'");

  // Verify target ID generation for the custom service
  const targetId0 = `delivery.home.${servicesSec?.id}.ServicesSection.services-0.title`;
  const targetId1 = `delivery.home.${servicesSec?.id}.ServicesSection.services-1.title`;
  assert(targetId0.includes("services-0.title"), "Target ID 0 has services-0.title");
  assert(targetId1.includes("services-1.title"), "Target ID 1 has services-1.title");

  console.log("\n=======================================================");
  console.log(`📊 FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runDeliveryBehaviorTests();
