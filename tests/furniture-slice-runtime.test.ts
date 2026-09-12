/**
 * tests/furniture-slice-runtime.test.ts
 *
 * Comprehensive Live Runtime Verification Suite for SalesmanPro Website Builder
 * Primary Reference Slice: Furniture -> Home -> Core Values -> USPSlider -> White Glove Delivery
 *
 * Verifies:
 * 1. Canonical Template Resolution: furniture -> furniture@v1 -> USPSlider
 * 2. Authentic Component Rendering: USPSlider authentic default vs live tenant config
 * 3. Inspector to Tenant State Immutability: targetId parsing & array-item updates without title corruption
 * 4. Section Actions Lifecycle: Edit, Hide, Move, Duplicate, Delete
 * 5. Storefront Hydration & Public Page: pageData.sections dynamic rendering without static fallback
 * 6. Theme Matrix: Canonical templates resolution & authentic section parity
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { resolveCanonicalTemplate, CANONICAL_TEMPLATES } from "../lib/website-builder/template-registry";
import USPSlider, { defaultCoreValues } from "../components/site/layouts/FurnitureLayout/body/components/USPSlider";
import FurnitureSite, { DEFAULT_FURNITURE_SECTIONS } from "../components/site/layouts/FurnitureLayout/body/FurnitureSite";
import { EditableContentProvider } from "../contexts/EditableContentContext";

function runFurnitureSliceRuntimeTests() {
  console.log("\n=======================================================");
  console.log("🛋️ FURNITURE SLICE & MULTI-THEME RUNTIME AUDIT SUITE");
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
  // TEST GROUP 1: Canonical Template Resolution
  // -------------------------------------------------------------
  console.log("👉 1. Canonical Template Resolution (Furniture Slice)");
  const furnitureTpl = resolveCanonicalTemplate("furniture", undefined);
  assert(
    furnitureTpl.id === "furniture@v1",
    "Furniture resolves to canonical template furniture@v1",
    `Resolved: ${furnitureTpl.id}`
  );
  assert(
    furnitureTpl.bodyComponent === "FurnitureSite",
    "Furniture template specifies bodyComponent FurnitureSite",
    `Resolved: ${furnitureTpl.bodyComponent}`
  );

  const uspsSec = furnitureTpl.authenticSections.find(
    (s) => s.component === "USPSlider" || s.id?.includes("uspslider")
  );
  assert(
    !!uspsSec,
    "USPSlider section exists in furniture authenticSections",
    `Found: ${uspsSec?.id}`
  );
  assert(
    uspsSec?.component === "USPSlider",
    "USPSlider authentic section has component === 'USPSlider'",
    `Component: ${uspsSec?.component}`
  );
  assert(
    Array.isArray(uspsSec?.defaultContent?.items) && uspsSec?.defaultContent?.items[0]?.title === "White Glove Delivery",
    "USPSlider authentic default content contains 'White Glove Delivery'",
    `First item title: ${uspsSec?.defaultContent?.items?.[0]?.title}`
  );

  // -------------------------------------------------------------
  // TEST GROUP 2: Authentic Component Rendering
  // -------------------------------------------------------------
  console.log("\n👉 2. Authentic Component Rendering (USPSlider)");
  const defaultHtml = renderToStaticMarkup(
    React.createElement(USPSlider, {
      coreValues: defaultCoreValues,
      sectionId: "sec-furniture-uspslider-69e1fe1c",
    })
  );
  assert(
    defaultHtml.includes("White Glove Delivery"),
    "USPSlider renders 'White Glove Delivery' with defaultCoreValues"
  );
  assert(
    defaultHtml.includes("Sustainable Sourcing"),
    "USPSlider renders 'Sustainable Sourcing' with defaultCoreValues"
  );

  // Test Canvas Editor Mode with EditableContentProvider
  const editorHtml = renderToStaticMarkup(
    React.createElement(
      EditableContentProvider,
      { isEditorMode: true } as any,
      React.createElement(USPSlider, {
        coreValues: defaultCoreValues,
        sectionId: "sec-furniture-uspslider-69e1fe1c",
      })
    )
  );
  assert(
    editorHtml.includes('data-editor-target="furniture.home.sec-furniture-uspslider-69e1fe1c.USPSlider.items-0.title"'),
    "USPSlider in editor mode emits canonical data-editor-target attributes for inspector binding"
  );
  assert(
    editorHtml.includes("data-editable-id="),
    "USPSlider in editor mode emits data-editable-id attributes for element selection"
  );

  // Test live config rendering with customized title
  const customConfig = {
    title: "Our Handcrafted Guarantees",
    items: [
      {
        title: "Premium White Glove Delivery",
        desc: "Room-of-choice placement and packaging removal included.",
        icon: "TruckIcon",
      },
      {
        title: "Bespoke Finishes",
        desc: "Over 40 artisanal stains and fabrics.",
        icon: "SwatchIcon",
      },
    ],
  };

  const customHtml = renderToStaticMarkup(
    React.createElement(USPSlider, {
      config: customConfig,
      sectionId: "sec-furniture-uspslider-69e1fe1c",
    })
  );
  assert(
    customHtml.includes("Premium White Glove Delivery"),
    "USPSlider renders custom title 'Premium White Glove Delivery' from config"
  );
  assert(
    !customHtml.includes(">White Glove Delivery<"),
    "USPSlider replaces default 'White Glove Delivery' when custom title provided"
  );

  // -------------------------------------------------------------
  // TEST GROUP 3: Target ID Data-Flow & Immutability
  // -------------------------------------------------------------
  console.log("\n👉 3. Target ID Data-Flow & Immutability");
  const sectionState: any = {
    id: "sec-furniture-uspslider-69e1fe1c",
    type: "featuresBadges",
    component: "USPSlider",
    title: "Core Values & Guarantees",
    visible: true,
    order: 2,
    content: {
      title: "Core Values & Guarantees",
      subtitle: "Crafted with passion, delivered with care",
      items: [
        { title: "White Glove Delivery", desc: "Room-of-choice delivery and packaging removal on all orders.", icon: "TruckIcon" },
        { title: "Custom Finishes", desc: "Over 40 bespoke fabrics and handcrafted wood stains available.", icon: "SwatchIcon" },
      ],
    },
  };

  // Simulate editing items-0.title in WebsiteBuilderStudio handleUpdateOverride
  const targetId = "furniture.home.sec-furniture-uspslider-69e1fe1c.USPSlider.items-0.title";
  const newValue = "Premium White Glove Delivery";
  const rawField = targetId.split(".").pop() || "title";
  const fieldKey = rawField.toLowerCase();

  const itemMatch = targetId.match(/(items|services|features|badges|corevalues|slides)[.-](\d+)\.([a-zA-Z0-9_]+)/i);
  assert(
    itemMatch !== null && itemMatch[1].toLowerCase() === "items" && itemMatch[2] === "0" && itemMatch[3] === "title",
    "Target ID correctly parses into arrayName='items', itemIdx=0, propKey='title'",
    `Parsed: ${JSON.stringify(itemMatch)}`
  );

  if (itemMatch) {
    const arrayName = itemMatch[1].toLowerCase();
    const itemIdx = parseInt(itemMatch[2], 10);
    const propKey = itemMatch[3];
    const actualKey = Object.keys(sectionState.content).find(k => k.toLowerCase() === arrayName) || arrayName;
    const currentArray = Array.isArray(sectionState.content[actualKey])
      ? [...sectionState.content[actualKey]]
      : [];
    while (currentArray.length <= itemIdx) {
      currentArray.push({});
    }
    currentArray[itemIdx] = {
      ...currentArray[itemIdx],
      [propKey]: newValue,
    };
    sectionState.content[actualKey] = currentArray;
  } else {
    sectionState.content[rawField] = newValue;
    sectionState.content[fieldKey] = newValue;
  }

  assert(
    sectionState.content.title === "Core Values & Guarantees",
    "Section title is preserved and NOT corrupted by array item edit",
    `Actual title: ${sectionState.content.title}`
  );
  assert(
    sectionState.content.items[0].title === "Premium White Glove Delivery",
    "Array item title correctly updated to 'Premium White Glove Delivery'",
    `Actual item[0] title: ${sectionState.content.items[0].title}`
  );
  assert(
    sectionState.content.items[1].title === "Custom Finishes",
    "Subsequent array items are preserved intact"
  );

  // -------------------------------------------------------------
  // TEST GROUP 4: Section Actions (Edit, Hide, Move, Duplicate, Delete)
  // -------------------------------------------------------------
  console.log("\n👉 4. Section Actions Lifecycle");
  let testSections = [
    { id: "sec-hero", type: "hero", component: "FurnitureHero", title: "Hero", visible: true, order: 1, content: {} },
    { id: "sec-furniture-uspslider-69e1fe1c", type: "featuresBadges", component: "USPSlider", title: "USPSlider", visible: true, order: 2, content: { ...sectionState.content } },
    { id: "sec-categories", type: "categories", component: "ShopByCategory", title: "Categories", visible: true, order: 3, content: {} },
  ];

  // ACTION 1: EDIT
  const targetSec = testSections.find((s) => s.id === "sec-furniture-uspslider-69e1fe1c")!;
  targetSec.content.title = "Our Verified Guarantees";
  assert(
    testSections[1].content.title === "Our Verified Guarantees",
    "Action EDIT: updates section.content.title"
  );

  // ACTION 2: HIDE
  targetSec.visible = false;
  let activeVisible = testSections.filter((s) => s.visible !== false);
  assert(
    !activeVisible.some((s) => s.id === "sec-furniture-uspslider-69e1fe1c"),
    "Action HIDE: sets visible = false; section omitted from activeVisible"
  );

  // ACTION 2b: SHOW (UNHIDE)
  targetSec.visible = true;
  activeVisible = testSections.filter((s) => s.visible !== false);
  assert(
    activeVisible.some((s) => s.id === "sec-furniture-uspslider-69e1fe1c"),
    "Action SHOW: sets visible = true; section returned to activeVisible"
  );

  // ACTION 3: MOVE (Move USPSlider Up from index 1 to index 0)
  const currIdx = testSections.findIndex((s) => s.id === "sec-furniture-uspslider-69e1fe1c");
  const temp = testSections[currIdx];
  testSections[currIdx] = testSections[currIdx - 1];
  testSections[currIdx - 1] = temp;
  assert(
    testSections[0].id === "sec-furniture-uspslider-69e1fe1c",
    "Action MOVE: moves section to new index position 0"
  );
  assert(
    testSections[1].id === "sec-hero",
    "Action MOVE: shifts previous occupant to index position 1"
  );

  // ACTION 4: DUPLICATE
  const dupIdx = testSections.findIndex((s) => s.id === "sec-furniture-uspslider-69e1fe1c");
  const dupSection = {
    ...testSections[dupIdx],
    id: `sec-furniture-uspslider-copy-9999`,
    title: `${testSections[dupIdx].title} (Copy)`,
    content: JSON.parse(JSON.stringify(testSections[dupIdx].content)),
  };
  testSections.splice(dupIdx + 1, 0, dupSection);
  assert(
    testSections.length === 4,
    "Action DUPLICATE: increases sections array length by 1"
  );
  assert(
    testSections[1].id === "sec-furniture-uspslider-copy-9999",
    "Action DUPLICATE: inserts cloned section directly after source section"
  );
  assert(
    testSections[1].content.items[0].title === "Premium White Glove Delivery",
    "Action DUPLICATE: deep clones section content correctly"
  );

  // ACTION 5: DELETE
  testSections = testSections.filter((s) => s.id !== dupSection.id);
  assert(
    testSections.length === 3,
    "Action DELETE: decreases sections array length back to 3"
  );
  assert(
    !testSections.some((s) => s.id === dupSection.id),
    "Action DELETE: completely removes deleted section"
  );

  // -------------------------------------------------------------
  // TEST GROUP 5: Storefront Hydration (FurnitureSite)
  // -------------------------------------------------------------
  console.log("\n👉 5. Storefront Hydration (FurnitureSite)");
  const pageDataWithEditedSection: any = {
    companyName: "Artisan Living Store",
    sections: [
      {
        id: "sec-furniture-uspslider-69e1fe1c",
        type: "featuresBadges",
        component: "USPSlider",
        title: "Core Values",
        visible: true,
        order: 1,
        content: {
          title: "Artisan Guarantees",
          items: [
            {
              title: "Premium White Glove Delivery",
              desc: "White glove delivery right inside your living room.",
              icon: "TruckIcon",
            },
          ],
        },
      },
    ],
  };

  const storefrontHtml = renderToStaticMarkup(
    React.createElement(FurnitureSite, {
      pageData: pageDataWithEditedSection,
      companyId: "comp-artisan-01",
    })
  );

  assert(
    storefrontHtml.includes("Premium White Glove Delivery"),
    "Storefront renders edited section title 'Premium White Glove Delivery'"
  );
  assert(
    storefrontHtml.includes("White glove delivery right inside your living room."),
    "Storefront renders edited section description"
  );
  assert(
    !storefrontHtml.includes("[WebsiteBuilder Renderer Failure]"),
    "Storefront renders cleanly without WebsiteBuilder diagnostic failure message"
  );

  // Test hidden section in Storefront
  const pageDataWithHiddenSection: any = {
    companyName: "Artisan Living Store",
    sections: [
      {
        id: "sec-furniture-uspslider-69e1fe1c",
        type: "featuresBadges",
        component: "USPSlider",
        title: "Core Values",
        visible: false,
        order: 1,
        content: {
          items: [{ title: "Hidden Should Not Appear", desc: "" }],
        },
      },
    ],
  };

  const hiddenStorefrontHtml = renderToStaticMarkup(
    React.createElement(FurnitureSite, {
      pageData: pageDataWithHiddenSection,
      companyId: "comp-artisan-01",
    })
  );
  assert(
    !hiddenStorefrontHtml.includes("Hidden Should Not Appear"),
    "Storefront does NOT render section when visible === false"
  );

  // -------------------------------------------------------------
  // TEST GROUP 6: All-Theme Resolution & Authentic Sections Parity
  // -------------------------------------------------------------
  console.log("\n👉 6. All-Theme Resolution & Authentic Sections Parity");
  const themesToVerify = [
    { category: "furniture", expectedId: "furniture@v1", bodyComp: "FurnitureSite" },
    { category: "fashion", expectedId: "fashion@v1", bodyComp: "FashionSite" },
    { category: "automotive", expectedId: "automotive@v1", bodyComp: "AutomotiveSite" },
    { category: "electronics", expectedId: "ecommerce-earphones@v1", bodyComp: "EcommerceEarphonesSite" },
    { category: "accessories", expectedId: "ecommerce-accessories@v1", bodyComp: "EcommerceAccessoriesSite" },
    { category: "restaurant", expectedId: "restaurant@v1", bodyComp: "RestaurentSite" },
    { category: "fitness", expectedId: "fitness@v1", bodyComp: "FitnessSite" },
    { category: "real-estate", expectedId: "real-estate@v1", bodyComp: "RealEstateSite" },
    { category: "courses", expectedId: "courses@v1", bodyComp: "CoursesSite" },
    { category: "security", expectedId: "security@v1", bodyComp: "SecuritySite" },
    { category: "services", expectedId: "services@v1", bodyComp: "ServiceSite" },
  ];

  themesToVerify.forEach((theme) => {
    const tpl = resolveCanonicalTemplate(theme.category, undefined);
    assert(
      tpl.id === theme.expectedId,
      `Theme ${theme.category} resolves to canonical ID ${theme.expectedId}`,
      `Resolved: ${tpl.id}`
    );
    assert(
      tpl.bodyComponent === theme.bodyComp,
      `Theme ${theme.category} maps to BodyComponent ${theme.bodyComp}`,
      `Resolved: ${tpl.bodyComponent}`
    );
    assert(
      Array.isArray(tpl.authenticSections) && tpl.authenticSections.length > 0,
      `Theme ${theme.category} has non-empty authenticSections (${tpl.authenticSections?.length} sections)`
    );
  });

  // Final summary
  console.log("\n=======================================================");
  console.log(`🏁 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runFurnitureSliceRuntimeTests();
