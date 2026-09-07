/**
 * tests/component-editing-and-routing.test.ts
 *
 * Automated verification test suite asserting:
 * 1. Component & Element Selection: Deterministic target ID parsing and editable component adapter metadata.
 * 2. Non-Destructive Property Overrides: Precise target override storage, fallback to defaults, and clean resets.
 * 3. Canonical Tenant-Aware Routing:
 *    - Host classification (localhost, tenant subdomain, custom domain, primary hub).
 *    - Path sanitization and namespace deduplication (e.g. /ecommerceshoes/ecommerceshoes).
 *    - Redundant /site/[slug] prefix stripping on custom domains and subdomains.
 *    - Query parameter preservation (e.g. ?subcategory=personalized-gifts).
 * 4. Undo / Redo history state integrity.
 * 5. CompiledWebsiteConfigSchema validation with componentOverrides.
 */

import {
  parseTargetId,
  getEditableComponent,
  getAllEditableComponents,
} from "../lib/website-builder/editable-adapters";
import {
  classifyTenantHost,
  sanitizePath,
  buildTenantUrl,
  resolveInternalRoute,
  normalizeHost,
} from "../lib/tenant/tenant-router";
import { CompiledWebsiteConfigSchema } from "../types/website-builder";

function runTests() {
  console.log("\n=======================================================");
  console.log("🔍 SALESMANPRO COMPONENT EDITING & TENANT ROUTING SUITE");
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
  // TEST SUITE 1: Target ID Parsing & Component Adapter Metadata
  // -------------------------------------------------------------
  console.log("--- 1. Target ID Parsing & Adapter Metadata ---");

  const parsed1 = parseTargetId("home.hero-slider.slides.0.headline");
  assert(
    parsed1.pageSlug === "home" &&
      parsed1.componentKey === "hero-slider" &&
      parsed1.fieldKey === "slides.0.headline" &&
      parsed1.itemIndex === 0,
    "Parse target ID: home.hero-slider.slides.0.headline"
  );

  const parsed2 = parseTargetId("home.promo-section.promotions.2.title");
  assert(
    parsed2.pageSlug === "home" &&
      parsed2.componentKey === "promo-section" &&
      parsed2.fieldKey === "promotions.2.title" &&
      parsed2.itemIndex === 2,
    "Parse target ID: home.promo-section.promotions.2.title"
  );

  const parsed3 = parseTargetId("categories-section.title");
  assert(
    parsed3.componentKey === "categories-section" && parsed3.fieldKey === "title",
    "Parse short target ID: categories-section.title"
  );

  const heroAdapter = getEditableComponent("HeroSlider");
  assert(
    !!heroAdapter &&
      heroAdapter.properties["headline"]?.type === "text" &&
      heroAdapter.properties["subline"]?.type === "text" &&
      heroAdapter.properties["badgeText"]?.type === "textarea" &&
      heroAdapter.properties["ctaText"]?.type === "text" &&
      heroAdapter.properties["ctaLink"]?.type === "link" &&
      heroAdapter.properties["imageUrl"]?.type === "image",
    "HeroSlider adapter registered with correct property definitions"
  );

  const promoAdapter = getEditableComponent("PromoSection");
  assert(
    !!promoAdapter &&
      promoAdapter.properties["title"]?.type === "text" &&
      promoAdapter.properties["description"]?.type === "textarea" &&
      promoAdapter.properties["ctaText"]?.type === "text" &&
      promoAdapter.properties["bannerUrl"]?.type === "image",
    "PromoSection adapter registered with correct property definitions"
  );

  const catAdapter = getEditableComponent("CategoriesSection");
  assert(
    !!catAdapter &&
      catAdapter.properties["eyebrow"]?.type === "text" &&
      catAdapter.properties["title"]?.type === "text",
    "CategoriesSection adapter registered with correct property definitions"
  );

  const headerAdapter = getEditableComponent("Header");
  assert(
    !!headerAdapter &&
      headerAdapter.properties["storeName"]?.type === "text" &&
      headerAdapter.properties["logoUrl"]?.type === "image",
    "Header adapter registered with correct property definitions"
  );

  const allAdapters = getAllEditableComponents();
  assert(
    allAdapters.length >= 6,
    `Adapter registry contains ${allAdapters.length} components (>= 6)`
  );

  // -------------------------------------------------------------
  // TEST SUITE 2: Non-Destructive Property Overrides
  // -------------------------------------------------------------
  console.log("\n--- 2. Non-Destructive Property Overrides ---");

  const defaultHeroSlides = [
    { headline: "DEFAULT HEADLINE 0", subline: "SNEAKERS", badgeText: "Default badge 0" },
    { headline: "DEFAULT HEADLINE 1", subline: "PERFORMANCE", badgeText: "Default badge 1" },
  ];

  const initialOverrides: Record<string, any> = {
    "home.hero-slider.slides.0.headline": "NEW CUSTOM HEADLINE 0",
    "home.promo-section.promotions.0.title": "MID-SEASON SALE",
  };

  // Helper simulating getOverride hook
  function getOverride<T>(overrides: Record<string, any>, targetId: string, defaultValue: T): T {
    if (overrides && overrides[targetId] !== undefined) {
      const val = overrides[targetId];
      return (val && typeof val === "object" && "value" in val ? val.value : val) as T;
    }
    return defaultValue;
  }

  // Verify slide 0 gets override
  const slide0Headline = getOverride(
    initialOverrides,
    "home.hero-slider.slides.0.headline",
    defaultHeroSlides[0].headline
  );
  assert(
    slide0Headline === "NEW CUSTOM HEADLINE 0",
    "Targeted property override returns custom value"
  );

  // Verify slide 0 other properties remain default
  const slide0Subline = getOverride(
    initialOverrides,
    "home.hero-slider.slides.0.subline",
    defaultHeroSlides[0].subline
  );
  assert(
    slide0Subline === "SNEAKERS",
    "Unmodified property on same component retains authentic template default"
  );

  // Verify slide 1 headline remains default
  const slide1Headline = getOverride(
    initialOverrides,
    "home.hero-slider.slides.1.headline",
    defaultHeroSlides[1].headline
  );
  assert(
    slide1Headline === "DEFAULT HEADLINE 1",
    "Other slide index retains authentic template default"
  );

  // Verify reset operation
  const resetOverrides = { ...initialOverrides };
  delete resetOverrides["home.hero-slider.slides.0.headline"];
  const revertedHeadline = getOverride(
    resetOverrides,
    "home.hero-slider.slides.0.headline",
    defaultHeroSlides[0].headline
  );
  assert(
    revertedHeadline === "DEFAULT HEADLINE 0",
    "Resetting override cleanly reverts back to authentic template default"
  );

  // -------------------------------------------------------------
  // TEST SUITE 3: Host Classification
  // -------------------------------------------------------------
  console.log("\n--- 3. Host Classification ---");

  assert(
    classifyTenantHost("localhost:3000").isLocalhost,
    "classifyTenantHost('localhost:3000') -> isLocalhost"
  );
  assert(
    classifyTenantHost("127.0.0.1:3000").isLocalhost,
    "classifyTenantHost('127.0.0.1:3000') -> isLocalhost"
  );

  const subHost = classifyTenantHost("shoes-store.salesmanpro.site");
  assert(
    subHost.isTenantSubdomain && subHost.subdomain === "shoes-store",
    "classifyTenantHost('shoes-store.salesmanpro.site') -> isTenantSubdomain (subdomain=shoes-store)"
  );

  const customHost = classifyTenantHost("sneakers-vault.co.uk");
  assert(
    customHost.isCustomDomain,
    "classifyTenantHost('sneakers-vault.co.uk') -> isCustomDomain"
  );

  const hubHost = classifyTenantHost("salesmanpro.site");
  assert(
    hubHost.isPrimaryHub,
    "classifyTenantHost('salesmanpro.site') -> isPrimaryHub"
  );

  // -------------------------------------------------------------
  // TEST SUITE 4: Path Sanitization & Namespace Deduplication
  // -------------------------------------------------------------
  console.log("\n--- 4. Path Sanitization & Deduplication ---");

  const clean1 = sanitizePath("/ecommerceshoes/products", "shoes-store");
  assert(
    clean1.cleanPath === "/ecommerceshoes/products",
    "Clean normal path: '/ecommerceshoes/products'"
  );

  // Deduplication of repeated namespaces
  const clean2 = sanitizePath("/ecommerceshoes/ecommerceshoes/products", "shoes-store");
  assert(
    clean2.cleanPath === "/ecommerceshoes/products",
    "Deduplicate repeated namespace: '/ecommerceshoes/ecommerceshoes/products' -> '/ecommerceshoes/products'"
  );

  // Stripping leading /site/[slug] prefix
  const clean3 = sanitizePath("/site/shoes-store/ecommerceshoes/products", "shoes-store");
  assert(
    clean3.cleanPath === "/ecommerceshoes/products",
    "Strip leading /site/[slug] prefix from relative tenant path"
  );

  // Path with query
  const clean4 = sanitizePath("/ecommerceshoes/products?subcategory=personalized-gifts", "shoes-store");
  assert(
    clean4.cleanPath === "/ecommerceshoes/products" && clean4.existingQuery === "subcategory=personalized-gifts",
    "Extract query parameter cleanly from path"
  );

  // -------------------------------------------------------------
  // TEST SUITE 5: Canonical Tenant-Aware URL Construction
  // -------------------------------------------------------------
  console.log("\n--- 5. Canonical Tenant-Aware URL Construction ---");

  // Localhost resolution
  const localUrl = buildTenantUrl({
    slug: "shoes-store",
    path: "/ecommerceshoes/products",
    context: { host: "localhost:3000" },
  });
  assert(
    localUrl === "/site/shoes-store/ecommerceshoes/products",
    "Localhost: preserves /site/[slug] prefix"
  );

  // Tenant subdomain resolution
  const subUrl = buildTenantUrl({
    slug: "shoes-store",
    path: "/ecommerceshoes/products",
    context: { host: "shoes-store.salesmanpro.site" },
  });
  assert(
    subUrl === "/ecommerceshoes/products",
    "Tenant subdomain: DOES NOT leak /site/[slug] prefix"
  );

  // Custom domain resolution
  const customUrl = buildTenantUrl({
    slug: "shoes-store",
    path: "/ecommerceshoes/categories",
    context: { host: "custombrand.com" },
  });
  assert(
    customUrl === "/ecommerceshoes/categories",
    "Custom domain: DOES NOT leak /site/[slug] prefix"
  );

  // Query parameter retention on subdomain
  const subQueryUrl = buildTenantUrl({
    slug: "shoes-store",
    path: "/ecommerceshoes/products?subcategory=personalized-gifts",
    context: { host: "shoes-store.salesmanpro.site" },
  });
  assert(
    subQueryUrl === "/ecommerceshoes/products?subcategory=personalized-gifts",
    "Subdomain query retention: preserves '?subcategory=personalized-gifts'"
  );

  // Query parameter object merge on localhost
  const localQueryUrl = buildTenantUrl({
    slug: "shoes-store",
    path: "/ecommerceshoes/products",
    query: { subcategory: "personalized-gifts", sort: "price-asc" },
    context: { host: "localhost:3000" },
  });
  assert(
    localQueryUrl === "/site/shoes-store/ecommerceshoes/products?subcategory=personalized-gifts&sort=price-asc",
    "Localhost query merge: formats query string cleanly"
  );

  // Handling path that already erroneously contains /site/[slug] on subdomain
  const fixedSubUrl = buildTenantUrl({
    slug: "shoes-store",
    path: "/site/shoes-store/ecommerceshoes/products",
    context: { host: "shoes-store.salesmanpro.site" },
  });
  assert(
    fixedSubUrl === "/ecommerceshoes/products",
    "Fix accidental /site/[slug] path on subdomain"
  );

  // Root link on subdomain
  const subRootUrl = buildTenantUrl({
    slug: "shoes-store",
    path: "/",
    context: { host: "shoes-store.salesmanpro.site" },
  });
  assert(
    subRootUrl === "/",
    "Root path on subdomain -> '/'"
  );

  // Root link on localhost
  const localRootUrl = buildTenantUrl({
    slug: "shoes-store",
    path: "/",
    context: { host: "localhost:3000" },
  });
  assert(
    localRootUrl === "/site/shoes-store",
    "Root path on localhost -> '/site/shoes-store'"
  );

  // External URLs remain untouched
  const extUrl1 = resolveInternalRoute("shoes-store", "https://instagram.com/shoes");
  assert(
    extUrl1 === "https://instagram.com/shoes",
    "External https link is preserved untouched"
  );

  const anchorUrl = resolveInternalRoute("shoes-store", "#collection");
  assert(
    anchorUrl === "#collection",
    "In-page anchor link is preserved untouched"
  );

  // -------------------------------------------------------------
  // TEST SUITE 6: Undo / Redo History State Integrity
  // -------------------------------------------------------------
  console.log("\n--- 6. Undo / Redo History State Simulation ---");

  interface MockStudioState {
    history: any[];
    historyIndex: number;
    current: any;
  }

  function createMockStudio(initial: any): MockStudioState {
    return {
      history: [initial],
      historyIndex: 0,
      current: initial,
    };
  }

  function pushEdit(studio: MockStudioState, next: any) {
    const sliced = studio.history.slice(0, studio.historyIndex + 1);
    studio.history = [...sliced, next];
    studio.historyIndex = studio.history.length - 1;
    studio.current = next;
  }

  function undo(studio: MockStudioState) {
    if (studio.historyIndex > 0) {
      studio.historyIndex--;
      studio.current = studio.history[studio.historyIndex];
    }
  }

  function redo(studio: MockStudioState) {
    if (studio.historyIndex < studio.history.length - 1) {
      studio.historyIndex++;
      studio.current = studio.history[studio.historyIndex];
    }
  }

  const studio = createMockStudio({ title: "Initial" });
  pushEdit(studio, { title: "Edit 1: Headline Changed" });
  pushEdit(studio, { title: "Edit 2: Button Changed" });
  assert(studio.current.title === "Edit 2: Button Changed", "History advanced to Edit 2");

  undo(studio);
  assert(studio.current.title === "Edit 1: Headline Changed", "Undo returns to Edit 1");

  undo(studio);
  assert(studio.current.title === "Initial", "Second undo returns to Initial");

  redo(studio);
  assert(studio.current.title === "Edit 1: Headline Changed", "Redo returns to Edit 1");

  pushEdit(studio, { title: "Edit 3: Branch Edit" });
  assert(
    studio.history.length === 3 && studio.current.title === "Edit 3: Branch Edit",
    "Branch edit discards orphaned future redo history"
  );

  // -------------------------------------------------------------
  // TEST SUITE 7: Schema Validation with componentOverrides
  // -------------------------------------------------------------
  console.log("\n--- 7. Schema Validation with componentOverrides ---");

  const sampleValidConfig = {
    templateKey: "ecommerce-shoes-store",
    storeName: "Sole Studio",
    storeSlug: "shoes-store",
    theme: {
      primaryColor: "#ef4444",
      secondaryColor: "#111827",
      headingFont: "Inter",
      bodyFont: "Inter",
    },
    navigation: {
      headerSettings: {
        logoText: "Sole Studio",
        navLinks: [{ label: "Drops", href: "/ecommerceshoes/products" }],
        showWhatsAppBtn: true,
        showAnnouncementBar: false,
      },
      footerSettings: {
        copyrightText: "© 2026 Sole Studio",
        showSocialLinks: true,
        footerLinks: [],
      },
    },
    pages: [
      {
        id: "p-home",
        slug: "home",
        title: "Home",
        isHomepage: true,
        sections: [],
      },
    ],
    componentOverrides: {
      "home.hero-slider.slides.0.headline": "SUMMER HEAT RUNNERS",
      "home.hero-slider.slides.0.subline": "EXCLUSIVE LAUNCH",
      "home.hero-slider.slides.0.badgeText": "High ventilation synthetic weave.",
      "home.hero-slider.slides.0.ctaText": "Order Now",
      "home.hero-slider.slides.0.ctaLink": "/ecommerceshoes/products?tag=summer",
      "home.categories-section.title": "CURATED APPAREL & SNEAKERS",
      "home.promo-section.promotions.0.title": "VIP ACCESS 30% OFF",
    },
  };

  const parseResult = CompiledWebsiteConfigSchema.safeParse(sampleValidConfig);
  assert(
    parseResult.success,
    "CompiledWebsiteConfigSchema validates config with componentOverrides"
  );

  if (parseResult.success) {
    assert(
      parseResult.data.componentOverrides?.["home.hero-slider.slides.0.headline"] ===
        "SUMMER HEAT RUNNERS",
      "componentOverrides are preserved cleanly in validated config"
    );
  }

  // -------------------------------------------------------------
  // FINAL SUMMARY
  // -------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
