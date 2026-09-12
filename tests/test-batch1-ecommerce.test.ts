import React from "react";
import ReactDOMServer from "react-dom/server";
import { StoreContextProvider } from "../contexts/StoreContext";

// Import sample adapted eCommerce themes from Batch 1
import EcommerceAccessoriesSite from "../components/site/layouts/EcommerceAccessoriesLayout/body/EcommerceAccessoriesSite";
import EcommerceAgrovetSite from "../components/site/layouts/EcommerceAgrovetLayout/body/EcommerceAgrovetSite";
import EcommerceGamingSite from "../components/site/layouts/EcommerceGamingLayout/body/EcommerceGamingSite";
import EcommerceWatchSite from "../components/site/layouts/EcommerceWatchLayout/body/EcommerceWatchSite";
import EcommerceGroceriesSite from "../components/site/layouts/EcommerceGroceriesLayout/body/EcommerceGroceriesSite";

const BATCH_1_SAMPLES = [
  { name: "EcommerceAccessoriesSite", comp: EcommerceAccessoriesSite, sec1: "hero", sec2: "popular-products" },
  { name: "EcommerceAgrovetSite", comp: EcommerceAgrovetSite, sec1: "hero", sec2: "popular-products" },
  { name: "EcommerceGamingSite", comp: EcommerceGamingSite, sec1: "hero", sec2: "popular-products" },
  { name: "EcommerceWatchSite", comp: EcommerceWatchSite, sec1: "hero", sec2: "popular-products" },
  { name: "EcommerceGroceriesSite", comp: EcommerceGroceriesSite, sec1: "hero", sec2: "popular-products" },
];

function testBatch1() {
  console.log("\n=======================================================");
  console.log("🧪 TESTING BATCH 1: ECOMMERCE DYNAMIC SECTION ACTIONS");
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

  for (const sample of BATCH_1_SAMPLES) {
    const mockStore: any = {
      id: "store-test",
      name: "Test Store",
      sections: [
        { id: sample.sec1, type: sample.sec1, visible: true },
        { id: sample.sec2, type: sample.sec2, visible: true },
      ],
      marketplaceListings: [],
      promotions: [],
    };

    // Test 1: DOM binding
    const htmlNormal = ReactDOMServer.renderToString(
      React.createElement(
        StoreContextProvider,
        { initialStore: mockStore },
        React.createElement(sample.comp, { pageData: mockStore, companyId: "test" })
      )
    );
    assert(htmlNormal.includes(`data-editor-section="${sample.sec1}"`), `${sample.name} renders data-editor-section="${sample.sec1}"`);

    // Test 2: Hide section 1
    const hiddenStore = {
      ...mockStore,
      sections: [
        { id: sample.sec1, type: sample.sec1, visible: false },
        { id: sample.sec2, type: sample.sec2, visible: true },
      ],
    };
    const htmlHidden = ReactDOMServer.renderToString(
      React.createElement(
        StoreContextProvider,
        { initialStore: hiddenStore },
        React.createElement(sample.comp, { pageData: hiddenStore, companyId: "test" })
      )
    );
    assert(!htmlHidden.includes(`data-editor-section="${sample.sec1}"`), `${sample.name} hides section "${sample.sec1}" when visible === false`);
    assert(htmlHidden.includes(`data-editor-section="${sample.sec2}"`), `${sample.name} retains section "${sample.sec2}"`);

    // Test 3: Reorder (Move)
    const reorderedStore = {
      ...mockStore,
      sections: [
        { id: sample.sec2, type: sample.sec2, visible: true },
        { id: sample.sec1, type: sample.sec1, visible: true },
      ],
    };
    const htmlMoved = ReactDOMServer.renderToString(
      React.createElement(
        StoreContextProvider,
        { initialStore: reorderedStore },
        React.createElement(sample.comp, { pageData: reorderedStore, companyId: "test" })
      )
    );
    const p1 = htmlMoved.indexOf(`data-editor-section="${sample.sec1}"`);
    const p2 = htmlMoved.indexOf(`data-editor-section="${sample.sec2}"`);
    assert(p2 !== -1 && p1 !== -1 && p2 < p1, `${sample.name} reorders DOM nodes in sequence of pageData.sections`);
  }

  console.log(`\nBatch 1 Results: ${passed} PASSED, ${failed} FAILED\n`);
  if (failed > 0) process.exit(1);
}

testBatch1();
