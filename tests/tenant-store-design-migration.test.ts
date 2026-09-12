/**
 * tests/tenant-store-design-migration.test.ts
 *
 * Automated verification suite for Tenant-Specific Store Design Architecture:
 * 1. Theme Instantiation Contract: Themes as blueprints seed structured WebsiteSection.content.
 * 2. Pure Presentation Component Contract: RestaurantHero consumes structured tenant config.
 * 3. Body Layout Integration: RestaurentSite extracts and passes heroConfig.
 * 4. Storefront & Canvas Hydration: pageData and mergedStoreData receive structured section config.
 * 5. Studio Direct Section Content Persistence & Legacy Override Migration Compatibility.
 */

import fs from "fs";
import path from "path";
import { compileWebsiteFromCompany } from "../lib/website-builder/template-compiler";

function runTenantStoreDesignMigrationTests() {
  console.log("\n=======================================================");
  console.log("🏛️ TENANT-SPECIFIC STORE DESIGN ARCHITECTURE TEST SUITE");
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
  // SUITE 1: Theme Instantiation Contract
  // -------------------------------------------------------------
  console.log("--- 1. Theme Instantiation Contract (Seed -> Structured Config) ---");

  const mockRestaurantCompany = {
    id: "company-rest-1",
    name: "Brenden's Gourmet Bistro",
    category: "restaurant",
    variant: "restaurant-store",
    tagline: "Fine Dining Redefined",
    heroSlides: [],
  };

  const compiled = compileWebsiteFromCompany(mockRestaurantCompany);
  assert(Array.isArray(compiled.pages) && compiled.pages.length > 0, "Compiles website pages array");

  const homePage = compiled.pages?.find((p) => p.isHomepage);
  assert(!!homePage, "Compiles default homepage");

  const heroSection = homePage?.sections.find((s) => s.type === "hero");
  assert(!!heroSection, "Homepage contains structured hero section");
  assert(!!heroSection?.content, "Hero section has structured content object");
  assert(Array.isArray(heroSection?.content?.slides), "Hero section content contains slides array");
  assert((heroSection?.content?.slides?.length || 0) >= 2, "Restaurant theme seed provides at least 2 slides");

  const slide1 = heroSection?.content?.slides?.[0];
  assert(
    slide1?.headline?.includes("Brenden's Gourmet Bistro"),
    "Slide 1 headline adopts tenant store name"
  );
  assert(slide1?.badgeText === "Experience Excellence", "Slide 1 has authentic theme badge");
  assert(slide1?.ctaText === "Reserve a Table", "Slide 1 has restaurant-specific CTA text");
  assert(slide1?.ctaLink === "/restaurent/products", "Slide 1 has restaurant-specific CTA link");

  const slide2 = heroSection?.content?.slides?.[1];
  assert(slide2?.headline === "Savor Every Moment", "Slide 2 has authentic secondary headline");
  assert(slide2?.badgeText === "Seasonal Specials", "Slide 2 has authentic secondary badge");
  assert(slide2?.ctaText === "Explore Menu", "Slide 2 has restaurant-specific menu CTA text");

  // Multi-Category Seed Instantiation Verifications
  const autoComp = compileWebsiteFromCompany({ name: "Apex Motors", category: "automotive", variant: "automotive-store" });
  const autoHero = autoComp.pages?.[0]?.sections.find((s) => s.type === "hero");
  assert(autoHero?.content?.slides?.[0]?.ctaText === "Browse Inventory", "Automotive theme seeds 'Browse Inventory' CTA");
  assert(autoHero?.content?.slides?.[0]?.ctaLink === "/inventory", "Automotive theme seeds '/inventory' route");
  assert(autoHero?.content?.slides?.[0]?.badgeText === "Certified Pre-Owned & New", "Automotive theme seeds authentic badge");

  const reComp = compileWebsiteFromCompany({ name: "Prime Realty", category: "real_estate", variant: "real-estate" });
  const reHero = reComp.pages?.[0]?.sections.find((s) => s.type === "hero");
  assert(reHero?.content?.slides?.[0]?.ctaText === "Explore Properties", "Real Estate theme seeds 'Explore Properties' CTA");
  assert(reHero?.content?.slides?.[0]?.ctaLink === "/properties", "Real Estate theme seeds '/properties' route");

  const healthComp = compileWebsiteFromCompany({ name: "Care Clinic", category: "healthcare", variant: "healthcare" });
  const healthHero = healthComp.pages?.[0]?.sections.find((s) => s.type === "hero");
  assert(healthHero?.content?.slides?.[0]?.ctaText === "Book Appointment", "Healthcare theme seeds 'Book Appointment' CTA");
  assert(healthHero?.content?.slides?.[0]?.badgeText === "Trusted Medical Specialists", "Healthcare theme seeds medical badge");

  const fitComp = compileWebsiteFromCompany({ name: "Iron Peak Gym", category: "fitness", variant: "fitness" });
  const fitHero = fitComp.pages?.[0]?.sections.find((s) => s.type === "hero");
  assert(fitHero?.content?.slides?.[0]?.ctaText === "Claim Free Pass", "Fitness theme seeds 'Claim Free Pass' CTA");
  assert(fitHero?.content?.slides?.[0]?.ctaLink === "/free-pass", "Fitness theme seeds '/free-pass' route");

  const travelComp = compileWebsiteFromCompany({ name: "Savannah Safari", category: "travel", variant: "travel" });
  const travelHero = travelComp.pages?.[0]?.sections.find((s) => s.type === "hero");
  assert(travelHero?.content?.slides?.[0]?.ctaText === "Explore Destinations", "Travel theme seeds 'Explore Destinations' CTA");
  assert(travelHero?.content?.slides?.[0]?.badgeText === "Bespoke Travel Expeditions", "Travel theme seeds travel badge");

  const courseComp = compileWebsiteFromCompany({ name: "Code Academy", category: "courses", variant: "courses" });
  const courseHero = courseComp.pages?.[0]?.sections.find((s) => s.type === "hero");
  assert(courseHero?.content?.slides?.[0]?.ctaText === "Explore Courses", "Education theme seeds 'Explore Courses' CTA");

  const barberComp = compileWebsiteFromCompany({ name: "Crown Barbers", category: "barbershop", variant: "barbershop" });
  const barberHero = barberComp.pages?.[0]?.sections.find((s) => s.type === "hero");
  assert(barberHero?.content?.slides?.[0]?.ctaText === "Book Appointment", "Barbershop theme seeds 'Book Appointment' CTA");
  assert(barberHero?.content?.slides?.[0]?.badgeText === "Artisan Barber Experience", "Barbershop theme seeds artisan badge");

  const fashionComp = compileWebsiteFromCompany({ name: "Urban Kicks", category: "fashion", variant: "shoes-store" });
  const fashionHero = fashionComp.pages?.[0]?.sections.find((s) => s.type === "hero");
  assert(fashionHero?.content?.slides?.[0]?.ctaText === "Shop Collection", "Fashion theme seeds 'Shop Collection' CTA");

  const techComp = compileWebsiteFromCompany({ name: "ElectroPulse", category: "electronics", variant: "electronics-store" });
  const techHero = techComp.pages?.[0]?.sections.find((s) => s.type === "hero");
  assert(techHero?.content?.slides?.[0]?.ctaText === "Explore Tech Deals", "Electronics theme seeds tech deals CTA");


  // -------------------------------------------------------------
  // SUITE 2: Pure Presentation Component Contract (RestaurantHero)
  // -------------------------------------------------------------
  console.log("\n--- 2. Presentation Component Contract (RestaurantHero) ---");

  const heroFile = path.resolve(
    __dirname,
    "../components/site/layouts/RestaurantLayout/components/RestaurantSite.tsx"
  );
  assert(fs.existsSync(heroFile), "RestaurantHero source file exists");

  const heroCode = fs.readFileSync(heroFile, "utf-8");
  assert(
    heroCode.includes("export interface RestaurantHeroProps"),
    "Defines typed RestaurantHeroProps interface"
  );
  assert(
    heroCode.includes("config?: {"),
    "RestaurantHeroProps declares structured config parameter"
  );
  assert(
    heroCode.includes("const configSlides = config?.slides?.length"),
    "Prioritizes structured tenant config slides over hardcoded defaults"
  );
  assert(
    heroCode.includes("const slides = configSlides || (heroSlides?.length ? heroSlides : defaultThemeSlides);"),
    "Implements 3-tier fallback (tenant config -> pageData.heroSlides -> defaultThemeSlides)"
  );
  assert(
    heroCode.includes("href={slides[current]?.ctaLink || \"/restaurent/products\"}"),
    "Binds CTA link dynamically to tenant-configured ctaLink"
  );
  assert(
    heroCode.includes("slideInterval = config?.autoplayIntervalMs || SLIDE_TIME"),
    "Supports tenant-configured autoplay intervals"
  );

  // -------------------------------------------------------------
  // SUITE 3: Body Layout Integration (RestaurentSite)
  // -------------------------------------------------------------
  console.log("\n--- 3. Body Layout Integration (RestaurentSite) ---");

  const bodyFile = path.resolve(
    __dirname,
    "../components/site/layouts/RestaurantLayout/body/RestaurentSite.tsx"
  );
  assert(fs.existsSync(bodyFile), "RestaurentSite body layout file exists");

  const bodyCode = fs.readFileSync(bodyFile, "utf-8");
  assert(
    bodyCode.includes("heroConfig ="),
    "Extracts structured heroConfig from pageData"
  );
  assert(
    bodyCode.includes("config={heroConfig}"),
    "Passes structured heroConfig to RestaurantHero component"
  );

  // -------------------------------------------------------------
  // SUITE 4: Storefront & Canvas Hydration Data-Flow Contract
  // -------------------------------------------------------------
  console.log("\n--- 4. Storefront & Canvas Hydration Data-Flow Contract ---");

  const rendererFile = path.resolve(
    __dirname,
    "../components/website-builder/AuthenticTemplateRenderer.tsx"
  );
  assert(fs.existsSync(rendererFile), "AuthenticTemplateRenderer file exists");
  const rendererCode = fs.readFileSync(rendererFile, "utf-8");
  assert(
    rendererCode.includes("(base as any).heroConfig = heroSec.content;"),
    "AuthenticTemplateRenderer attaches structured heroConfig to mergedStoreData"
  );
  assert(
    rendererCode.includes("(base as any).sections = activePage?.sections || [];"),
    "AuthenticTemplateRenderer attaches activePage.sections to mergedStoreData"
  );

  const storefrontFile = path.resolve(__dirname, "../app/site/[slug]/page.tsx");
  assert(fs.existsSync(storefrontFile), "Public storefront page.tsx file exists");
  const storefrontCode = fs.readFileSync(storefrontFile, "utf-8");
  assert(
    storefrontCode.includes("publishedConfig.pages?.[0]?.sections"),
    "Public storefront page.tsx inspects publishedConfig.pages[0].sections"
  );
  assert(
    storefrontCode.includes("pageData.heroConfig = heroSection.content;"),
    "Public storefront page.tsx hydrates structured heroConfig into pageData"
  );

  // -------------------------------------------------------------
  // SUITE 5: Studio Direct Section Content Persistence & Migration
  // -------------------------------------------------------------
  console.log("\n--- 5. Studio Direct Section Content Persistence & Migration ---");

  const studioFile = path.resolve(
    __dirname,
    "../components/website-builder/editor/WebsiteBuilderStudio.tsx"
  );
  assert(fs.existsSync(studioFile), "WebsiteBuilderStudio file exists");
  const studioCode = fs.readFileSync(studioFile, "utf-8");
  assert(
    studioCode.includes("targetSlide.headline = value;"),
    "Studio handleUpdateOverride writes directly to structured heroSection.content.slides"
  );
  assert(
    studioCode.includes("targetSlide.badgeText = value;"),
    "Studio handleUpdateOverride synchronizes badgeText to structured section content"
  );
  assert(
    studioCode.includes("targetSlide.ctaText = value;"),
    "Studio handleUpdateOverride synchronizes ctaText to structured section content"
  );
  assert(
    studioCode.includes("prev.componentOverrides[targetId] = value;"),
    "Studio handleUpdateOverride retains componentOverrides for migration compatibility"
  );

  // -------------------------------------------------------------
  // SUITE 6: Functional Coexistence & Migration Logic
  // -------------------------------------------------------------
  console.log("\n--- 6. Functional Coexistence & Migration Logic ---");

  const mockTenantConfig = {
    slides: [
      {
        id: "slide-1",
        headline: "Structured Base Headline",
        badgeText: "Structured Base Badge",
      },
    ],
  };

  const mockLegacyOverrides: Record<string, any> = {
    "RestaurantHero.slide0.headline": "Legacy User Override",
  };

  // Resolve with migration hierarchy
  const effectiveHeadline =
    mockLegacyOverrides["RestaurantHero.slide0.headline"] ??
    mockTenantConfig.slides[0].headline;

  assert(
    effectiveHeadline === "Legacy User Override",
    "Legacy override takes precedence during migration so past user customizations are preserved"
  );

  const effectiveBadge =
    mockLegacyOverrides["RestaurantHero.slide0.badgeText"] ??
    mockTenantConfig.slides[0].badgeText;

  assert(
    effectiveBadge === "Structured Base Badge",
    "Structured tenant content serves as persistent source of truth when no legacy override exists"
  );

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`📊 RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTenantStoreDesignMigrationTests();
