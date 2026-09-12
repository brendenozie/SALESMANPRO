/**
 * tests/forensic-field-level-dom-discovery.test.ts
 *
 * Forensic Automated Regression Test Suite asserting:
 * 1. 5-Tier Component Editability Spectrum (EDITABLE, PARTIALLY_EDITABLE, DATA_DRIVEN, UNWRAPPED, INTENTIONALLY_STATIC)
 * 2. Complete alias resolution for layout sections across Industry Archetypes
 * 3. Verified property exposure on authentic component adapters (Hero, About, CTA, Features, TrendingLocations, Newsletter)
 * 4. Multi-tier canonical lookup keys resolution for field overrides
 * 5. Forensic JSX verification that wrapped components contain authentic EditableElement bindings
 */

import fs from "fs";
import path from "path";
import {
  getEditableComponent,
  buildUniversalComponentAdapter,
  ComponentEditabilityStatus,
} from "../lib/website-builder/editable-adapters";
import {
  buildCanonicalTargetId,
  parseCanonicalTargetId,
  getCanonicalLookupKeys,
} from "../lib/website-builder/canonical-target-id";

function runForensicFieldLevelDomDiscoveryTests() {
  console.log("\n==================================================================");
  console.log("🔬 FORENSIC FIELD-LEVEL DOM DISCOVERY & ARCHITECTURE TEST SUITE");
  console.log("==================================================================\n");

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

  // -------------------------------------------------------------------------
  // 1. 5-TIER COMPONENT EDITABILITY SPECTRUM
  // -------------------------------------------------------------------------
  console.log("--- 1. 5-Tier Component Editability Spectrum ---");

  const validStatuses: ComponentEditabilityStatus[] = [
    "FULLY_EDITABLE",
    "EDITABLE",
    "PARTIALLY_EDITABLE",
    "DATA_DRIVEN",
    "UNWRAPPED",
    "INTENTIONALLY_STATIC",
    "VIEW_ONLY",
  ];

  const heroAdapter = getEditableComponent("HeroSection");
  assert(
    heroAdapter !== undefined && (heroAdapter.status === "FULLY_EDITABLE" || heroAdapter.status === "EDITABLE"),
    "HeroSection has valid EDITABLE status"
  );

  const awardsAdapter = getEditableComponent("AwardsSection");
  assert(
    awardsAdapter !== undefined && awardsAdapter.status === "PARTIALLY_EDITABLE",
    "AwardsSection has PARTIALLY_EDITABLE status"
  );

  const fallbackAdapter = buildUniversalComponentAdapter("UnknownComponent");
  assert(
    fallbackAdapter.status === "VIEW_ONLY",
    "buildUniversalComponentAdapter returns truthful VIEW_ONLY without fictitious guessing"
  );

  // -------------------------------------------------------------------------
  // 2. AUTHENTIC ALIAS RESOLUTION ACROSS THEMES
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Authentic Layout Alias Resolution ---");

  const aliasesToTest = [
    { input: "aboutus", expectedComponentKey: "AboutSection" },
    { input: "about-us", expectedComponentKey: "AboutSection" },
    { input: "getstartedsection", expectedComponentKey: "CtaSection" },
    { input: "get-started", expectedComponentKey: "CtaSection" },
    { input: "discoverycallsection", expectedComponentKey: "CtaSection" },
    { input: "excellencesection", expectedComponentKey: "FeaturesSection" },
    { input: "trendinglocationssection", expectedComponentKey: "TrendingLocations" },
    { input: "newslettersignupsection", expectedComponentKey: "NewsletterSection" },
    { input: "serviceshero", expectedComponentKey: "HeroSection" },
    { input: "travelhero", expectedComponentKey: "TravelHero" },
    { input: "header", expectedComponentKey: "Header" },
    { input: "footer", expectedComponentKey: "Footer" },
  ];

  for (const item of aliasesToTest) {
    const resolved = getEditableComponent(item.input);
    assert(
      resolved !== undefined && resolved.componentKey === item.expectedComponentKey,
      `Alias "${item.input}" correctly resolves to "${item.expectedComponentKey}"`
    );
  }

  // -------------------------------------------------------------------------
  // 3. PROPERTY EXPOSURE ON CORE COMPONENT FAMILIES
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Core Component Property Coverage ---");

  // AboutSection
  const aboutAdapter = getEditableComponent("AboutSection");
  assert(
    aboutAdapter !== undefined &&
      "title" in aboutAdapter.properties &&
      "headline" in aboutAdapter.properties &&
      "badgeText" in aboutAdapter.properties &&
      "description" in aboutAdapter.properties &&
      "ctaText" in aboutAdapter.properties,
    "AboutSection exposes title, headline, badgeText, description, and ctaText"
  );

  // CtaSection
  const ctaAdapter = getEditableComponent("CtaSection");
  assert(
    ctaAdapter !== undefined &&
      "badgeText" in ctaAdapter.properties &&
      "title" in ctaAdapter.properties &&
      "subtitle" in ctaAdapter.properties &&
      "buttonText" in ctaAdapter.properties,
    "CtaSection exposes badgeText, title, subtitle, and buttonText"
  );

  // FeaturesSection
  const featuresAdapter = getEditableComponent("FeaturesSection");
  assert(
    featuresAdapter !== undefined &&
      "badgeText" in featuresAdapter.properties &&
      "title" in featuresAdapter.properties &&
      "description" in featuresAdapter.properties,
    "FeaturesSection exposes badgeText, title, and description"
  );

  // TravelHero
  const travelHeroAdapter = getEditableComponent("TravelHero");
  assert(
    travelHeroAdapter !== undefined &&
      "badgeText" in travelHeroAdapter.properties &&
      "headline" in travelHeroAdapter.properties &&
      "subline" in travelHeroAdapter.properties &&
      "buttonText" in travelHeroAdapter.properties,
    "TravelHero exposes badgeText, headline, subline, and buttonText"
  );

  // TrendingLocations
  const trendingLocationsAdapter = getEditableComponent("TrendingLocations");
  assert(
    trendingLocationsAdapter !== undefined &&
      "badgeText" in trendingLocationsAdapter.properties &&
      "title" in trendingLocationsAdapter.properties &&
      "subtitle" in trendingLocationsAdapter.properties,
    "TrendingLocations exposes badgeText, title, and subtitle"
  );

  // HealthcareHero
  const healthcareHeroAdapter = getEditableComponent("HealthcareHero");
  assert(
    healthcareHeroAdapter !== undefined &&
      "badgeText" in healthcareHeroAdapter.properties &&
      "headline" in healthcareHeroAdapter.properties &&
      "subline" in healthcareHeroAdapter.properties &&
      "ctaText" in healthcareHeroAdapter.properties,
    "HealthcareHero exposes badgeText, headline, subline, and ctaText"
  );

  // -------------------------------------------------------------------------
  // 4. CANONICAL TARGET ID RESOLUTION & OVERRIDE LOOKUP
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Canonical Target ID Resolution ---");

  const servicesHeroTarget = "services.home.hero.HeroSection.main.headline";
  const parsedServices = parseCanonicalTargetId(servicesHeroTarget);
  assert(
    parsedServices.templateKey === "services" &&
      parsedServices.pageSlug === "home" &&
      parsedServices.sectionKey === "hero" &&
      parsedServices.componentKey === "HeroSection" &&
      parsedServices.fieldKey === "headline",
    "parseCanonicalTargetId extracts all segments of Services Hero canonical ID"
  );

  const candidateKeys = getCanonicalLookupKeys(servicesHeroTarget);
  assert(
    candidateKeys.includes(servicesHeroTarget) &&
      candidateKeys.includes("HeroSection.headline") &&
      candidateKeys.includes("headline"),
    "getCanonicalLookupKeys resolves exact target, component.field, and leaf field"
  );

  // -------------------------------------------------------------------------
  // 5. PHYSICAL JSX WRAPPER INTEGRITY VERIFICATION
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Physical Component JSX Wrapper Verification ---");

  const filesToCheck = [
    {
      file: "components/site/layouts/ServicesLayout/header/Header.tsx",
      expectedIds: ["global.global.header.Header.main.storeName"],
    },
    {
      file: "components/site/layouts/ServicesLayout/footer/Footer.tsx",
      expectedIds: ["global.global.footer.Footer.main.brandName", "global.global.footer.Footer.main.bioText"],
    },
    {
      file: "components/site/layouts/ServicesLayout/components/HeroSection/index.tsx",
      expectedIds: [
        "services.home.hero.HeroSection.main.badgeText",
        "services.home.hero.HeroSection.main.headline",
        "services.home.hero.HeroSection.main.subline",
        "services.home.hero.HeroSection.main.ctaText",
      ],
    },
    {
      file: "components/site/layouts/ServicesLayout/components/aboutUs/index.tsx",
      expectedIds: [
        "services.home.aboutUs.AboutUs.main.badgeText",
        "services.home.aboutUs.AboutUs.main.headline",
        "services.home.aboutUs.AboutUs.main.title",
        "services.home.aboutUs.AboutUs.main.description",
        "services.home.aboutUs.AboutUs.main.ctaText",
      ],
    },
    {
      file: "components/site/layouts/ServicesLayout/components/GetStartedSection/index.tsx",
      expectedIds: [
        "services.home.getStartedSection.GetStartedSection.main.badgeText",
        "services.home.getStartedSection.GetStartedSection.main.title",
        "services.home.getStartedSection.GetStartedSection.main.subtitle",
        "services.home.getStartedSection.GetStartedSection.main.buttonText",
      ],
    },
    {
      file: "components/site/layouts/ServicesLayout/components/ExcellenceSection/index.tsx",
      expectedIds: [
        "services.home.excellenceSection.ExcellenceSection.main.badgeText",
        "services.home.excellenceSection.ExcellenceSection.main.title",
        "services.home.excellenceSection.ExcellenceSection.main.description",
      ],
    },
    {
      file: "components/site/layouts/TravelLayout/header/Header.tsx",
      expectedIds: ["global.global.header.Header.main.storeName"],
    },
    {
      file: "components/site/layouts/TravelLayout/footer/Footer.tsx",
      expectedIds: ["global.global.footer.Footer.main.brandName", "global.global.footer.Footer.main.bioText"],
    },
    {
      file: "components/site/layouts/TravelLayout/body/components/HeroSection/index.tsx",
      expectedIds: [
        "travel.home.travelHero.TravelHero.main.badgeText",
        "travel.home.travelHero.TravelHero.main.headline",
        "travel.home.travelHero.TravelHero.main.subline",
      ],
    },
    {
      file: "components/site/layouts/TravelLayout/body/components/TrendingLocationsSection/index.tsx",
      expectedIds: [
        "travel.home.trendingLocationsSection.TrendingLocationsSection.main.badgeText",
        "travel.home.trendingLocationsSection.TrendingLocationsSection.main.title",
      ],
    },
    {
      file: "components/site/layouts/TravelLayout/body/components/NewsletterSignupSection/index.tsx",
      expectedIds: [
        "travel.home.newsletterSignupSection.NewsletterSignupSection.main.title",
        "travel.home.newsletterSignupSection.NewsletterSignupSection.main.subtitle",
      ],
    },
    {
      file: "components/site/layouts/HealthcareLayout/header/Header.tsx",
      expectedIds: ["global.global.header.Header.main.storeName"],
    },
    {
      file: "components/site/layouts/HealthcareLayout/footer/Footer.tsx",
      expectedIds: ["global.global.footer.Footer.main.brandName", "global.global.footer.Footer.main.bioText"],
    },
    {
      file: "components/site/layouts/HealthcareLayout/body/components/HeroSection/index.tsx",
      expectedIds: [
        "healthcare.home.healthcareHero.HealthcareHero.main.badgeText",
        "healthcare.home.healthcareHero.HealthcareHero.main.headline",
        "healthcare.home.healthcareHero.HealthcareHero.main.subline",
        "healthcare.home.healthcareHero.HealthcareHero.main.ctaText",
      ],
    },
    {
      file: "components/site/layouts/HealthcareLayout/body/components/AboutSection/index.tsx",
      expectedIds: [
        "healthcare.home.aboutSection.AboutSection.main.badgeText",
        "healthcare.home.aboutSection.AboutSection.main.title",
        "healthcare.home.aboutSection.AboutSection.main.description",
      ],
    },
    {
      file: "components/site/layouts/HealthcareLayout/body/components/CTASection/index.tsx",
      expectedIds: [
        "healthcare.home.ctaSection.CtaSection.main.badgeText",
        "healthcare.home.ctaSection.CtaSection.main.title",
        "healthcare.home.ctaSection.CtaSection.main.subtitle",
      ],
    },
  ];

  const rootDir = path.resolve(__dirname, "..");

  for (const item of filesToCheck) {
    const fullPath = path.join(rootDir, item.file);
    assert(fs.existsSync(fullPath), `Component file exists: ${item.file}`);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      assert(
        content.includes("<EditableElement") && content.includes("EditableContentContext"),
        `Component "${path.basename(item.file)}" imports and renders <EditableElement>`
      );
      for (const expectedId of item.expectedIds) {
        assert(
          content.includes(expectedId),
          `Component "${path.basename(item.file)}" contains targetId="${expectedId}"`
        );
      }
    }
  }

  // -------------------------------------------------------------------------
  // FINAL SCORECARD
  // -------------------------------------------------------------------------
  console.log("\n==================================================================");
  console.log(`📊 FINAL TEST REPORT: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runForensicFieldLevelDomDiscoveryTests();
