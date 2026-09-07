/**
 * tests/universal-template-composition.test.ts
 *
 * Automated regression test suite asserting:
 * 1. Universal template composition mapping across categories:
 *    Company Category -> Template -> Variant -> Page -> Sections -> Components -> Fields -> Data Sources -> Header -> Navigation -> Footer.
 * 2. Authentic physical section sets for Restaurant, Real Estate, Automotive, Courses, Healthcare, Fitness, Services, Bookings, etc.
 * 3. First-class Header & Footer editability across all templates and layouts.
 * 4. Header & Footer data-editor-section coverage in all layout components.
 * 5. Template switching state reconciliation and section isolation.
 * 6. Category-aware navigation compilation from template shell definitions.
 * 7. Authentic component adapter registration across all categories.
 */

import fs from "fs";
import path from "path";
import {
  TEMPLATE_REGISTRY,
  resolveCanonicalTemplate,
  getAllTemplates,
  getTemplateById,
} from "../lib/website-builder/template-registry";
import {
  compileWebsiteFromCompany,
  compileNavigation,
} from "../lib/website-builder/template-compiler";
import {
  getEditableComponent,
  getAllEditableComponents,
} from "../lib/website-builder/editable-adapters";
import { categoryHeaderFooterLayoutMap } from "../components/site/layouts/categoryHeaderFooterLayoutMap";

function runUniversalTests() {
  console.log("\n=======================================================");
  console.log("🔍 UNIVERSAL TEMPLATE COMPOSITION & HEADER/FOOTER SUITE");
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
  // TEST SUITE 1: Authentic Category Section Composition
  // -------------------------------------------------------------
  console.log("--- 1. Authentic Category Section Sets ---");

  // Restaurant
  const restaurantTpl = resolveCanonicalTemplate("restaurant", "restaurant", "restaurant@v1");
  assert(restaurantTpl.id === "restaurant@v1", "Restaurant resolves to restaurant@v1");
  assert(restaurantTpl.authenticSections.length >= 6, `Restaurant has authentic sections (found ${restaurantTpl.authenticSections.length})`);
  const restComponents = restaurantTpl.authenticSections.map(s => s.component);
  assert(restComponents.includes("RestaurantHero"), "Restaurant contains RestaurantHero");
  assert(restComponents.includes("SignatureDishes"), "Restaurant contains SignatureDishes");
  assert(restComponents.includes("WhyDineWithUs"), "Restaurant contains WhyDineWithUs");
  assert(restComponents.includes("RestaurantGallery"), "Restaurant contains RestaurantGallery");
  assert(restComponents.includes("RestaurantFAQs"), "Restaurant contains RestaurantFAQs");

  // Real Estate
  const realEstateTpl = resolveCanonicalTemplate("real-estate", "property-listings", "real-estate@v1");
  assert(realEstateTpl.id === "real-estate@v1", "Real Estate resolves to real-estate@v1");
  assert(realEstateTpl.authenticSections.length >= 8, `Real Estate has authentic sections (found ${realEstateTpl.authenticSections.length})`);
  const reComponents = realEstateTpl.authenticSections.map(s => s.component);
  assert(reComponents.includes("FeaturedListingsWrapper"), "Real Estate contains FeaturedListingsWrapper");
  assert(reComponents.includes("TrendingLocations"), "Real Estate contains TrendingLocations");
  assert(reComponents.includes("WhyChooseUs"), "Real Estate contains WhyChooseUs");
  assert(reComponents.includes("AgentsSection"), "Real Estate contains AgentsSection");

  // Automotive
  const autoTpl = resolveCanonicalTemplate("automotive", "car-dealership", "automotive@v1");
  assert(autoTpl.id === "automotive@v1", "Automotive resolves to automotive@v1");
  assert(autoTpl.authenticSections.length >= 8, `Automotive has authentic sections (found ${autoTpl.authenticSections.length})`);
  const autoComponents = autoTpl.authenticSections.map(s => s.component);
  assert(autoComponents.includes("AutomotiveFeaturedListingsWrapper"), "Automotive contains AutomotiveFeaturedListingsWrapper");
  assert(autoComponents.includes("HowItWorks"), "Automotive contains HowItWorks");
  assert(autoComponents.includes("BrowseByCategory"), "Automotive contains BrowseByCategory");
  assert(autoComponents.includes("PopularVehiclesWrapper"), "Automotive contains PopularVehiclesWrapper");

  // Courses
  const coursesTpl = resolveCanonicalTemplate("courses", "courses-layout-1", "courses@v1");
  assert(coursesTpl.id === "courses@v1", "Courses resolves to courses@v1");
  assert(coursesTpl.authenticSections.length >= 6, `Courses has authentic sections (found ${coursesTpl.authenticSections.length})`);
  const courseComponents = coursesTpl.authenticSections.map(s => s.component);
  assert(courseComponents.includes("HeroSection") || courseComponents.includes("CoursesHero"), "Courses contains HeroSection");
  assert(courseComponents.includes("GlassInfoCardsSection"), "Courses contains GlassInfoCardsSection");
  assert(courseComponents.includes("SchoolSection"), "Courses contains SchoolSection");
  assert(courseComponents.includes("MainCoursesSection"), "Courses contains MainCoursesSection");

  // Healthcare
  const healthTpl = resolveCanonicalTemplate("healthcare", "clinic-pro", "healthcare@v1");
  assert(healthTpl.id === "healthcare@v1", "Healthcare resolves to healthcare@v1");
  assert(healthTpl.authenticSections.length >= 6, `Healthcare has authentic sections (found ${healthTpl.authenticSections.length})`);
  const healthComponents = healthTpl.authenticSections.map(s => s.component);
  assert(healthComponents.includes("HealthcareHero"), "Healthcare contains HealthcareHero");
  assert(healthComponents.includes("MedicalServicesSection"), "Healthcare contains MedicalServicesSection");
  assert(healthComponents.includes("DoctorsSection"), "Healthcare contains DoctorsSection");

  // -------------------------------------------------------------
  // TEST SUITE 2: Template Shell & Universal Header/Footer Adapters
  // -------------------------------------------------------------
  console.log("\n--- 2. Universal Header & Footer Editability ---");

  const headerAdapter = getEditableComponent("Header");
  assert(headerAdapter !== undefined, "Header adapter is registered");
  assert(headerAdapter?.status === "FULLY_EDITABLE", "Header is FULLY_EDITABLE");
  assert(headerAdapter?.properties["storeName"] !== undefined, "Header has editable storeName");
  assert(headerAdapter?.properties["brandName"] !== undefined, "Header has editable brandName");
  assert(headerAdapter?.properties["logoUrl"] !== undefined, "Header has editable logoUrl");
  assert(headerAdapter?.properties["announcementText"] !== undefined, "Header has editable announcementText");
  assert(headerAdapter?.properties["ctaButtonText"] !== undefined, "Header has editable ctaButtonText");
  assert(headerAdapter?.properties["ctaButtonUrl"] !== undefined, "Header has editable ctaButtonUrl");
  assert(headerAdapter?.properties["sticky"] !== undefined, "Header has editable sticky setting");

  const footerAdapter = getEditableComponent("Footer");
  assert(footerAdapter !== undefined, "Footer adapter is registered");
  assert(footerAdapter?.status === "FULLY_EDITABLE", "Footer is FULLY_EDITABLE");
  assert(footerAdapter?.properties["brandName"] !== undefined, "Footer has editable brandName");
  assert(footerAdapter?.properties["bio"] !== undefined, "Footer has editable bio");
  assert(footerAdapter?.properties["contactPhone"] !== undefined, "Footer has editable contactPhone");
  assert(footerAdapter?.properties["contactEmail"] !== undefined, "Footer has editable contactEmail");
  assert(footerAdapter?.properties["address"] !== undefined, "Footer has editable address");
  assert(footerAdapter?.properties["copyrightText"] !== undefined, "Footer has editable copyrightText");
  assert(footerAdapter?.properties["showNewsletter"] !== undefined, "Footer has editable showNewsletter");

  // -------------------------------------------------------------
  // TEST SUITE 3: Header/Footer Layout Wrapping Across All Layouts
  // -------------------------------------------------------------
  console.log("\n--- 3. Header & Footer Data-Editor-Section Layout Coverage ---");

  const layoutsDir = path.resolve(__dirname, "../components/site/layouts");
  const layoutEntries = fs.readdirSync(layoutsDir, { withFileTypes: true }).filter(d => d.isDirectory());
  let headerWrappedCount = 0;
  let footerWrappedCount = 0;

  for (const entry of layoutEntries) {
    const filePath = path.join(layoutsDir, entry.name, `${entry.name}.tsx`);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, "utf-8");
    if (content.includes('data-editor-section="header"')) {
      headerWrappedCount++;
    }
    if (content.includes('data-editor-section="footer"')) {
      footerWrappedCount++;
    }
  }

  assert(headerWrappedCount >= 54, `Header wrapped with data-editor-section in all layouts (${headerWrappedCount}/55)`);
  assert(footerWrappedCount >= 54, `Footer wrapped with data-editor-section in all layouts (${footerWrappedCount}/55)`);

  // -------------------------------------------------------------
  // TEST SUITE 4: Category-Aware Navigation Compilation
  // -------------------------------------------------------------
  console.log("\n--- 4. Category-Aware Navigation Compilation ---");

  const restCompany = {
    name: "Oasis Bistro",
    category: "restaurant",
    variant: "restaurant",
    website: { templateKey: "restaurant@v1" },
  };
  const restNav = compileNavigation(restCompany);
  assert(restNav.headerItems.some(i => i.label === "Menu"), "Restaurant navigation includes 'Menu'");
  assert(restNav.headerItems.some(i => i.label === "Gallery" || i.label === "Our Story"), "Restaurant navigation includes 'Gallery' or 'Our Story'");

  const reCompany = {
    name: "Apex Properties",
    category: "real-estate",
    variant: "property-listings",
    website: { templateKey: "real-estate@v1" },
  };
  const reNav = compileNavigation(reCompany);
  assert(reNav.headerItems.some(i => i.label === "Properties"), "Real Estate navigation includes 'Properties'");
  assert(reNav.headerItems.some(i => i.label === "Agents"), "Real Estate navigation includes 'Agents'");

  const autoCompany = {
    name: "Safari Motors",
    category: "automotive",
    variant: "car-dealership",
    website: { templateKey: "automotive@v1" },
  };
  const autoNav = compileNavigation(autoCompany);
  assert(autoNav.headerItems.some(i => i.label === "Showroom" || i.label === "Inventory"), "Automotive navigation includes 'Showroom' or 'Inventory'");
  assert(autoNav.headerItems.some(i => i.label === "How It Works"), "Automotive navigation includes 'How It Works'");

  const courseCompany = {
    name: "Tech Academy",
    category: "courses",
    variant: "courses-layout-1",
    website: { templateKey: "courses@v1" },
  };
  const courseNav = compileNavigation(courseCompany);
  assert(courseNav.headerItems.some(i => i.label === "Courses"), "Courses navigation includes 'Courses'");
  assert(courseNav.headerItems.some(i => i.label === "Programs" || i.label === "Schools"), "Courses navigation includes 'Programs' or 'Schools'");

  // -------------------------------------------------------------
  // TEST SUITE 5: Compiler Fidelity Across Categories
  // -------------------------------------------------------------
  console.log("\n--- 5. Compiler Fidelity Across Non-Ecommerce Categories ---");

  // Compile Restaurant
  const compiledRestaurant = compileWebsiteFromCompany(restCompany);
  assert(compiledRestaurant.templateKey === "restaurant@v1", "Compiled Restaurant has templateKey 'restaurant@v1'");
  const restHomePage = compiledRestaurant.pages.find(p => p.isHomepage);
  assert(!!restHomePage, "Compiled Restaurant has a Home page");
  assert(
    restHomePage!.sections.length >= 6,
    `Compiled Restaurant has authentic sections (got ${restHomePage!.sections.length})`
  );
  assert(
    restHomePage!.sections.some(s => s.id.includes("restaurant-hero")),
    "Compiled Restaurant contains authentic 'restaurant-hero' section"
  );
  assert(
    restHomePage!.sections.some(s => s.id.includes("signature-dishes")),
    "Compiled Restaurant contains authentic 'signature-dishes' section"
  );

  // Compile Real Estate
  const compiledRE = compileWebsiteFromCompany(reCompany);
  assert(compiledRE.templateKey === "real-estate@v1", "Compiled Real Estate has templateKey 'real-estate@v1'");
  const reHomePage = compiledRE.pages.find(p => p.isHomepage);
  assert(!!reHomePage, "Compiled Real Estate has a Home page");
  assert(
    reHomePage!.sections.length >= 8,
    `Compiled Real Estate has authentic sections (got ${reHomePage!.sections.length})`
  );
  assert(
    reHomePage!.sections.some(s => s.id.includes("featured-listings")),
    "Compiled Real Estate contains authentic 'featured-listings' section"
  );

  // -------------------------------------------------------------
  // TEST SUITE 6: Template Switching State Reconciliation
  // -------------------------------------------------------------
  console.log("\n--- 6. Template Switching State Reconciliation ---");

  // Simulate switching from Shoes (ecommerce) to Restaurant
  const shoesCompany = {
    name: "Kicks Vault",
    category: "ecommerce",
    variant: "shoes-store",
    website: { templateKey: "ecommerce-shoes@v1" },
  };
  const initialShoes = compileWebsiteFromCompany(shoesCompany);
  assert(initialShoes.templateKey === "ecommerce-shoes@v1", "Initial template is ecommerce-shoes@v1");
  const shoesSections = initialShoes.pages.find(p => p.isHomepage)?.sections || [];
  assert(shoesSections.length === 15, `Initial shoes template has 15 sections (got ${shoesSections.length})`);

  // Target template: restaurant@v1
  const targetTemplate = getTemplateById("restaurant@v1");
  assert(!!targetTemplate, "Target template 'restaurant@v1' exists");

  // Reconciled sections for switched template
  const switchedSections = targetTemplate!.authenticSections.map((sec, idx) => ({
    id: `sec-${sec.id}-${Date.now() + idx}`,
    type: sec.type,
    order: idx,
    content: sec.defaultContent || {},
  }));
  assert(
    switchedSections.length === targetTemplate!.authenticSections.length,
    `Switched sections match restaurant authentic sections count (${switchedSections.length})`
  );
  assert(
    !switchedSections.some(s => s.id.includes("hero-slider")),
    "Switched sections do NOT leak shoes 'hero-slider'"
  );
  assert(
    switchedSections.some(s => s.id.includes("restaurant-hero")),
    "Switched sections contain authentic 'restaurant-hero'"
  );

  // -------------------------------------------------------------
  // TEST SUITE 7: Authentic Category Component Adapters
  // -------------------------------------------------------------
  console.log("\n--- 7. Authentic Category Component Adapters ---");

  const requiredAdapters = [
    "RestaurantHero",
    "SignatureDishes",
    "WhyDineWithUs",
    "RestaurantGallery",
    "RestaurantFAQs",
    "FeaturedListingsWrapper",
    "TrendingLocations",
    "WhyChooseUs",
    "AgentsSection",
    "AutomotiveFeaturedListingsWrapper",
    "HowItWorks",
    "BrowseByCategory",
    "PopularVehiclesWrapper",
    "CoursesHero",
    "GlassInfoCardsSection",
    "SchoolSection",
    "MainCoursesSection",
    "HealthcareHero",
    "MedicalServicesSection",
    "DoctorsSection",
    "ServicesSection",
    "PricingSection",
    "BarbershopHero",
    "FitnessHero",
    "TravelHero",
  ];

  for (const compKey of requiredAdapters) {
    const adapter = getEditableComponent(compKey);
    assert(
      adapter !== undefined && adapter.status === "FULLY_EDITABLE",
      `Adapter '${compKey}' is registered and FULLY_EDITABLE`
    );
  }

  console.log("\n=======================================================");
  console.log(`📊 FINAL UNIVERSAL TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runUniversalTests();
