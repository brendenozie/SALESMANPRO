/**
 * tests/test-all-batches-capabilities.test.ts
 *
 * Verifies dynamic section capabilities across representative themes from all 5 rollout batches:
 * - Batch 1 (eCommerce): EcommerceAccessoriesSite, EcommerceAgrovetSite, EcommerceGamingSite, EcommerceWatchSite
 * - Batch 2 (Services & Bookings): BookingsSite, BarbershopBookingsSite, ConsultancySite
 * - Batch 3 (Courses, Security, Real Estate): CoursesSite, SecuritySite, RealEstateSite
 * - Batch 4 (Portfolio, SaaS, Marketplace): PortfolioSite, SaasSite, MarketPlaceSite
 * - Batch 5 (Lifestyle, Media, Health, Travel): FitnessSite, HealthCareSite, BlogSite, MediaSite, NonProfitSite, EventsSite, DirectorySite, FinanceSite, TravelSite, GhubaSite
 */

import React from "react";
import ReactDOMServer from "react-dom/server";
import { SessionProvider } from "next-auth/react";
import { StoreContextProvider } from "../contexts/StoreContext";
import { ContextProvider } from "../contexts/ContextProvider";

// Batch 1
import EcommerceAccessoriesSite from "../components/site/layouts/EcommerceAccessoriesLayout/body/EcommerceAccessoriesSite";
import EcommerceGamingSite from "../components/site/layouts/EcommerceGamingLayout/body/EcommerceGamingSite";

// Batch 2
import BookingsSite from "../components/site/layouts/BookingsLayout/body/BookingsSite";
import ConsultancySite from "../components/site/layouts/ConsultancyLayout/body/ConsultancySite";

// Batch 3
import CoursesSite from "../components/site/layouts/CoursesLayout/body/CoursesSite";
import SecuritySite from "../components/site/layouts/SecurityLayout/body/SecuritySite";

// Batch 4
import PortfolioSite from "../components/site/layouts/PortfolioLayout/body/PortfolioSite";
import SaasSite from "../components/site/layouts/SaaSLayout/body/SaasSite";

// Batch 5
import FitnessSite from "../components/site/layouts/FitnessLayout/body/FitnessSite";
import HealthCareSite from "../components/site/layouts/HealthcareLayout/body/HealthCareSite";
import BlogSite from "../components/site/layouts/BlogLayout/body/BlogSite";
import MediaSite from "../components/site/layouts/MediaLayout/body/MediaSite";
import NonProfitSite from "../components/site/layouts/NonprofitLayout/body/NonProfitSite";
import EventsSite from "../components/site/layouts/EventsLayout/body/EventsSite";
import DirectorySite from "../components/site/layouts/DirectoryLayout/body/DirectorySite";
import FinanceSite from "../components/site/layouts/FinanceLayout/body/FinanceSite";
import TravelSite from "../components/site/layouts/TravelLayout/body/TravelSite";
import GhubaSite from "../components/site/layouts/GhubaLayout/body/GhubaSite";

const TEST_TARGETS = [
  // Batch 1
  { batch: "Batch 1", name: "EcommerceAccessoriesSite", comp: EcommerceAccessoriesSite, sec1: "hero", sec2: "category" },
  { batch: "Batch 1", name: "EcommerceGamingSite", comp: EcommerceGamingSite, sec1: "hero", sec2: "popular-products" },
  // Batch 2
  { batch: "Batch 2", name: "BookingsSite", comp: BookingsSite, sec1: "hero", sec2: "features" },
  { batch: "Batch 2", name: "ConsultancySite", comp: ConsultancySite, sec1: "hero", sec2: "business" },
  // Batch 3
  { batch: "Batch 3", name: "CoursesSite", comp: CoursesSite, sec1: "hero", sec2: "school" },
  { batch: "Batch 3", name: "SecuritySite", comp: SecuritySite, sec1: "hero", sec2: "services" },
  // Batch 4
  { batch: "Batch 4", name: "PortfolioSite", comp: PortfolioSite, sec1: "hero", sec2: "features" },
  { batch: "Batch 4", name: "SaasSite", comp: SaasSite, sec1: "hero", sec2: "features" },
  // Batch 5 (All 10 themes)
  { batch: "Batch 5", name: "FitnessSite", comp: FitnessSite, sec1: "hero", sec2: "category" },
  { batch: "Batch 5", name: "HealthCareSite", comp: HealthCareSite, sec1: "healthcare-hero", sec2: "about" },
  { batch: "Batch 5", name: "BlogSite", comp: BlogSite, sec1: "hero", sec2: "featured-categories" },
  { batch: "Batch 5", name: "MediaSite", comp: MediaSite, sec1: "media-hero", sec2: "enhanced-categories" },
  { batch: "Batch 5", name: "NonProfitSite", comp: NonProfitSite, sec1: "hero", sec2: "core-highlights" },
  { batch: "Batch 5", name: "EventsSite", comp: EventsSite, sec1: "hero-component", sec2: "about" },
  { batch: "Batch 5", name: "DirectorySite", comp: DirectorySite, sec1: "hero", sec2: "promotion" },
  { batch: "Batch 5", name: "FinanceSite", comp: FinanceSite, sec1: "hero", sec2: "practice-areas" },
  { batch: "Batch 5", name: "TravelSite", comp: TravelSite, sec1: "hero", sec2: "trending-locations" },
  { batch: "Batch 5", name: "GhubaSite", comp: GhubaSite, sec1: "annocument", sec2: "wrapper" },
];

import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

const mockRouter: any = {
  back: () => {},
  forward: () => {},
  refresh: () => {},
  push: () => {},
  replace: () => {},
  prefetch: () => {},
};

function renderTheme(store: any, comp: any): string {
  try {
    return ReactDOMServer.renderToString(
      React.createElement(
        AppRouterContext.Provider,
        { value: mockRouter },
        React.createElement(
          SessionProvider,
          { session: null },
          React.createElement(
            ContextProvider,
            null,
            React.createElement(
              StoreContextProvider,
              { initialStore: store },
              React.createElement(comp, {
                pageData: store,
                companyId: store.id,
                slug: store.slug,
                name: store.name,
                ghubaData: {
                  categories: [{ id: "c1", name: "Cat", slug: "cat" }],
                  featuredCategory: { id: "c1", name: "Cat", slug: "cat" },
                  sections: {
                    flashDeals: [{ id: "p1", name: "Item 1", price: 10, images: ["/p1.jpg"] }],
                    newArrivals: [{ id: "p2", name: "Item 2", price: 20, images: ["/p2.jpg"] }],
                    discounts: [{ id: "p3", name: "Item 3", price: 30, images: ["/p3.jpg"] }],
                    featuredCategoryProducts: [{ id: "p4", name: "Item 4", price: 40, images: ["/p4.jpg"] }],
                  },
                },
              })
            )
          )
        )
      )
    );
  } catch (e: any) {
    console.error("Render error:", e.message);
    return "";
  }
}

function runAllBatchesSuite() {
  console.log("\n=======================================================");
  console.log("🚀 FULL 5-BATCH DYNAMIC CAPABILITIES TEST SUITE");
  console.log("=======================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, name: string) {
    if (cond) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  for (const target of TEST_TARGETS) {
    console.log(`\n--- Testing [${target.batch}] ${target.name} ---`);
    const mockStore: any = {
      id: "store-test-" + target.name.toLowerCase(),
      name: `Test ${target.name}`,
      slug: target.name.toLowerCase(),
      themeSettings: { primaryColor: "#4F46E5" },
      sections: [
        { id: target.sec1, type: target.sec1, component: target.sec1, visible: true },
        { id: target.sec2, type: target.sec2, component: target.sec2, visible: true },
      ],
      heroSlides: [{ id: "slide-1", title: "Test Headline", headline: "Test Headline", ctaLink: "/initiatives", ctaText: "Learn More", subline: "Test Subline" }],
      marketplaceListings: [],
      StoreCategory: [{ id: "cat-1", name: "General Category", slug: "general" }],
      promotions: [],
      blogs: [{ id: "b-1", title: "Test Blog", slug: "test-blog", excerpt: "Test", category: "News" }],
    };

    // 1. DOM Binding Test
    const htmlNormal = renderTheme(mockStore, target.comp);
    assert(
      htmlNormal.includes(`data-editor-section="${target.sec1}"`),
      `[${target.name}] renders data-editor-section="${target.sec1}"`
    );

    // 2. Hide Test (visible: false)
    const hiddenStore = {
      ...mockStore,
      sections: [
        { id: target.sec1, type: target.sec1, component: target.sec1, visible: false },
        { id: target.sec2, type: target.sec2, component: target.sec2, visible: true },
      ],
    };
    const htmlHidden = renderTheme(hiddenStore, target.comp);
    assert(
      !htmlHidden.includes(`data-editor-section="${target.sec1}"`),
      `[${target.name}] [hide] cleanly omits section "${target.sec1}" when visible === false`
    );
    assert(
      htmlHidden.includes(`data-editor-section="${target.sec2}"`),
      `[${target.name}] [hide] retains section "${target.sec2}"`
    );

    // 3. Move / Reorder Test
    const reorderedStore = {
      ...mockStore,
      sections: [
        { id: target.sec2, type: target.sec2, component: target.sec2, visible: true },
        { id: target.sec1, type: target.sec1, component: target.sec1, visible: true },
      ],
    };
    const htmlMoved = renderTheme(reorderedStore, target.comp);
    const p1 = htmlMoved.indexOf(`data-editor-section="${target.sec1}"`);
    const p2 = htmlMoved.indexOf(`data-editor-section="${target.sec2}"`);
    assert(
      p2 !== -1 && p1 !== -1 && p2 < p1,
      `[${target.name}] [move] reorders DOM nodes in sequence of pageData.sections`
    );

    // 4. Duplicate Test
    const duplicatedStore = {
      ...mockStore,
      sections: [
        { id: target.sec1, type: target.sec1, component: target.sec1, visible: true },
        { id: `${target.sec1}-copy`, type: target.sec1, component: target.sec1, visible: true },
      ],
    };
    const htmlDuplicated = renderTheme(duplicatedStore, target.comp);
    assert(
      htmlDuplicated.includes(`data-editor-section="${target.sec1}"`) &&
      htmlDuplicated.includes(`data-editor-section="${target.sec1}-copy"`),
      `[${target.name}] [duplicate] renders both original and duplicated section instances`
    );

    // 5. Delete Test
    const deletedStore = {
      ...mockStore,
      sections: [
        { id: target.sec2, type: target.sec2, component: target.sec2, visible: true },
      ],
    };
    const htmlDeleted = renderTheme(deletedStore, target.comp);
    assert(
      !htmlDeleted.includes(`data-editor-section="${target.sec1}"`) &&
      htmlDeleted.includes(`data-editor-section="${target.sec2}"`),
      `[${target.name}] [delete] deletes section "${target.sec1}" from DOM while retaining "${target.sec2}"`
    );

    // 6. Static Fallback Test (when sections is undefined or empty)
    const fallbackStore = {
      ...mockStore,
      sections: undefined,
    };
    const htmlFallback = renderTheme(fallbackStore, target.comp);
    assert(
      htmlFallback.includes(`data-editor-section="${target.sec1}"`),
      `[${target.name}] [staticFallback] falls back to authentic static layout when sections is undefined`
    );
  }

  console.log("\n=======================================================");
  console.log(`📊 FINAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAllBatchesSuite();
