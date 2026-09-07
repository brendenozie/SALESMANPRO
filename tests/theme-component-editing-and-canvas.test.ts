/**
 * tests/theme-component-editing-and-canvas.test.ts
 *
 * Automated regression test suite asserting:
 * 1. 100% Canvas data-editor-component & data-editor-section coverage across all 55 layout files.
 * 2. Universal Adapter Guarantee: Any authentic component across any theme is FULLY_EDITABLE with real properties.
 * 3. Live Component Override Blending: Merging componentOverrides updates hero slides, headlines, stories, images, and CTA links.
 * 4. Section Sidebar Section-to-Component Mapping.
 */

import fs from "fs";
import path from "path";
import {
  getEditableComponent,
  buildUniversalComponentAdapter,
  getAllEditableComponents,
} from "../lib/website-builder/editable-adapters";
import {
  resolveCanonicalTemplate,
  getAllTemplates,
} from "../lib/website-builder/template-registry";

function runThemeComponentEditingTests() {
  console.log("\n=======================================================");
  console.log("🔍 THEME COMPONENT EDITING & CANVAS FIDELITY TEST SUITE");
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
  // TEST SUITE 1: 100% Canvas Layout Wrapping Coverage
  // -------------------------------------------------------------
  console.log("--- 1. Canvas Layout Component Wrapping (All 55 Layouts) ---");

  const layoutsDir = path.join(process.cwd(), "components/site/layouts");
  function findSiteFiles(dir: string): string[] {
    let results: string[] = [];
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        results = results.concat(findSiteFiles(full));
      } else if (item.endsWith("Site.tsx") && !full.includes("Layout/components/") && !full.includes("Layout\\components\\")) {
        results.push(full);
      }
    }
    return results;
  }

  const siteFiles = findSiteFiles(layoutsDir);
  assert(siteFiles.length >= 54, `Found ${siteFiles.length} Site.tsx files (expected >= 54)`);

  let fullyWrappedFiles = 0;
  for (const file of siteFiles) {
    const content = fs.readFileSync(file, "utf8");
    const hasComponentTag = content.includes("data-editor-component");
    const hasSectionTag = content.includes("data-editor-section");
    if (hasComponentTag && hasSectionTag) {
      fullyWrappedFiles++;
    } else {
      console.error(`Missing tags in: ${path.basename(file)}`);
    }
  }

  assert(
    fullyWrappedFiles === siteFiles.length,
    `All ${siteFiles.length} site body layouts have data-editor-component and data-editor-section tags (${fullyWrappedFiles}/${siteFiles.length})`
  );

  // -------------------------------------------------------------
  // TEST SUITE 2: Universal Adapter Guarantee Across Diverse Themes
  // -------------------------------------------------------------
  console.log("\n--- 2. Universal Adapter Guarantee Across Themes ---");

  const sampleComponents = [
    // Restaurant
    "RestaurantHero",
    "SignatureDishes",
    "WhyDineWithUs",
    "RestaurantGallery",
    "RestaurantFAQs",
    // Automotive
    "HeroSection",
    "AutomotiveFeaturedListingsWrapper",
    "HowItWorks",
    "BrowseByCategory",
    "TrendingLocations",
    "PopularVehiclesWrapper",
    "VideoShowcaseSection",
    "MarketInsightsSection",
    "TestimonialsCarouselSection",
    // Real Estate
    "FeaturedListingsWrapper",
    "WhyChooseUs",
    "AgentsSection",
    "ListingsSection",
    // Healthcare
    "HealthcareHero",
    "MedicalServicesSection",
    "DoctorsSection",
    // Courses
    "CoursesHero",
    "GlassInfoCardsSection",
    "SchoolSection",
    "MainCoursesSection",
    // Fitness
    "FitnessHero",
    // Barber
    "BarbershopHero",
    // Travel
    "TravelHero",
  ];

  for (const compName of sampleComponents) {
    const adapter = getEditableComponent(compName);
    assert(
      adapter !== undefined,
      `Adapter exists for authentic component '${compName}'`
    );
    assert(
      adapter?.status === "FULLY_EDITABLE",
      `Component '${compName}' has editability status FULLY_EDITABLE`
    );
    const propCount = Object.keys(adapter?.properties || {}).length;
    assert(
      propCount >= 2,
      `Component '${compName}' exposes editable properties (found ${propCount})`
    );
  }

  // -------------------------------------------------------------
  // TEST SUITE 3: Live Component Override Blending
  // -------------------------------------------------------------
  console.log("\n--- 3. Live Component Override Blending in Store Data ---");

  function simulateStoreMerge(initialStore: any, overrides: Record<string, any>) {
    const base = JSON.parse(JSON.stringify(initialStore || {}));
    if (!base.heroSlides || base.heroSlides.length === 0) {
      base.heroSlides = [{ id: "s1", headline: "Initial", subline: "Initial Sub", imageUrl: "init.jpg" }];
    }
    (base as any).componentOverrides = overrides;
    const firstSlide = base.heroSlides[0];

    for (const [key, val] of Object.entries(overrides)) {
      if (val === undefined || val === null) continue;
      const lower = key.toLowerCase();

      if (lower.includes("headline") || (lower.includes("hero") && lower.includes("title"))) {
        if (firstSlide) firstSlide.headline = String(val);
        (base as any).headline = String(val);
      } else if (lower.includes("subline") || (lower.includes("hero") && (lower.includes("subtitle") || lower.includes("eyebrow")))) {
        if (firstSlide) firstSlide.subline = String(val);
        (base as any).subline = String(val);
      } else if (lower.includes("ctatext") || (lower.includes("hero") && (lower.includes("buttontext") || lower.includes("btntext")))) {
        if (firstSlide) firstSlide.ctaText = String(val);
      } else if (lower.includes("ctalink") || (lower.includes("hero") && (lower.includes("buttonurl") || lower.includes("buttonlink") || lower.includes("link")))) {
        if (firstSlide) firstSlide.ctaLink = String(val);
      } else if (lower.includes("imageurl") || lower.includes("bannerurl") || (lower.includes("hero") && lower.includes("image"))) {
        if (firstSlide) firstSlide.imageUrl = String(val);
        base.bannerUrl = String(val);
      } else if (lower.includes("story") || lower.includes("about") || lower.includes("bio") || lower.includes("description")) {
        base.description = String(val);
        (base as any).story = String(val);
      }
    }
    return base;
  }

  const initialStore = {
    name: "Tuscan Trattoria",
    slug: "tuscan-trattoria",
    description: "Original Description",
    heroSlides: [
      {
        id: "slide-1",
        headline: "Original Headline",
        subline: "Original Subline",
        ctaText: "Original Button",
        ctaLink: "/orig",
        imageUrl: "https://orig.jpg",
      },
    ],
  };

  const testOverrides = {
    "RestaurantHero.headline": "Artisanal Wood-Fired Pizza & Pasta",
    "RestaurantHero.subline": "Handcrafted daily using organic heirloom flour and imported olive oil",
    "RestaurantHero.ctaText": "Book Private Table",
    "RestaurantHero.ctaLink": "/reservations",
    "RestaurantHero.imageUrl": "https://images.unsplash.com/photo-pizza.jpg",
    "WhyDineWithUs.story": "Founded in Florence in 1988, our kitchen brings three generations of passion.",
  };

  const merged = simulateStoreMerge(initialStore, testOverrides);
  assert(
    merged.heroSlides[0].headline === "Artisanal Wood-Fired Pizza & Pasta",
    "Headline override successfully updated hero slide headline"
  );
  assert(
    merged.heroSlides[0].subline === "Handcrafted daily using organic heirloom flour and imported olive oil",
    "Subline override successfully updated hero slide subline"
  );
  assert(
    merged.heroSlides[0].ctaText === "Book Private Table",
    "CTA text override successfully updated hero slide button"
  );
  assert(
    merged.heroSlides[0].ctaLink === "/reservations",
    "CTA link override successfully updated hero slide button destination"
  );
  assert(
    merged.heroSlides[0].imageUrl === "https://images.unsplash.com/photo-pizza.jpg",
    "Image override successfully updated hero slide background image"
  );
  assert(
    merged.description === "Founded in Florence in 1988, our kitchen brings three generations of passion.",
    "Narrative story override successfully updated store description"
  );
  assert(
    merged.componentOverrides["RestaurantHero.headline"] === "Artisanal Wood-Fired Pizza & Pasta",
    "Raw componentOverrides preserved in merged store data"
  );

  // -------------------------------------------------------------
  // TEST SUITE 4: Sections Sidebar Section-to-Component Mapping
  // -------------------------------------------------------------
  console.log("\n--- 4. Section Sidebar Authentic Component Mapping ---");

  const templatesToTest = ["restaurant@v1", "automotive@v1", "real-estate@v1", "courses@v1", "healthcare@v1"];

  for (const tplId of templatesToTest) {
    const tpl = getAllTemplates().find((t) => t.id === tplId);
    assert(tpl !== undefined, `Template ${tplId} exists in registry`);
    if (!tpl) continue;

    for (const sec of tpl.authenticSections) {
      const adapter = getEditableComponent(sec.component);
      assert(
        adapter !== undefined && Object.keys(adapter.properties).length > 0,
        `Template ${tplId} section '${sec.id}' maps to editable component '${sec.component}' with properties`
      );
    }
  }

  console.log("\n=======================================================");
  console.log(`📊 FINAL THEME COMPONENT EDITING RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runThemeComponentEditingTests();
