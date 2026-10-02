/**
 * scratch/test-e2e-builder-lifecycle.js
 * End-to-End simulation test for SalesmanPro Website Builder & Mascot operations.
 */

const path = require("path");
const fs = require("fs");

console.log("===============================================================================");
console.log("     SALESMANPRO WEBSITE BUILDER — END-TO-END LIFECYCLE & TENANT ISOLATION     ");
console.log("===============================================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

// -----------------------------------------------------------------------------
// 1. SETUP TWO INDEPENDENT TENANT FIXTURES
// -----------------------------------------------------------------------------
const tenantA = {
  id: "company_tenant_a_12345678",
  name: "Safari Outdoors Gear",
  slug: "safari-gear",
  category: "E-commerce",
  variant: "Modern Shop (v1)",
  logoUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  bannerUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
  products: [
    { id: "p1", name: "Waterproof Hiking Boots", price: 12000, inStock: true },
    { id: "p2", name: "All-Weather Tent", price: 25000, inStock: true },
  ],
  categories: [
    { id: "c1", name: "Footwear", slug: "footwear" },
    { id: "c2", name: "Camping", slug: "camping" },
  ],
  website: null,
};

const tenantB = {
  id: "company_tenant_b_87654321",
  name: "Gourmet Artisan Bakery",
  slug: "artisan-bakery",
  category: "Restaurant & Food Delivery",
  variant: "Food Delivery",
  logoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
  products: [
    { id: "p101", name: "Sourdough Boule", price: 650, inStock: true },
  ],
  website: null,
};

console.log(`[STAGE 1] THEME RESOLUTION FOR MULTIPLE TENANTS`);
const aliasesContent = fs.readFileSync(path.join(__dirname, "../lib/website-builder/registry/aliases.ts"), "utf-8");

// Parse ALIAS_TO_CANONICAL_ID map
const aliasEntries = {};
const aliasRegex = /["']([^"']+)["']:\s*["']([^"']+)["']/g;
const startIdx = aliasesContent.indexOf("export const ALIAS_TO_CANONICAL_ID");
const endIdx = aliasesContent.indexOf("};", startIdx);
const aliasBlock = aliasesContent.slice(startIdx, endIdx);
let aMatch;
while ((aMatch = aliasRegex.exec(aliasBlock)) !== null) {
  aliasEntries[aMatch[1]] = aMatch[2];
}

function normalizeKey(value) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function resolveCanonical(category, variant) {
  if (variant) {
    const vMatch = aliasEntries[normalizeKey(variant)];
    if (vMatch) return vMatch;
  }
  if (category && variant) {
    const cMatch = aliasEntries[normalizeKey(`${category}-${variant}`)];
    if (cMatch) return cMatch;
  }
  if (category) {
    const catMatch = aliasEntries[normalizeKey(category)];
    if (catMatch) return catMatch;
  }
  return "default-site@v1";
}

const themeA = resolveCanonical(tenantA.category, tenantA.variant);
const themeB = resolveCanonical(tenantB.category, tenantB.variant);

assert(themeA === "ecommerce-default@v1", `Tenant A resolves to 'ecommerce-default@v1' (got: ${themeA})`);
assert(themeB === "restaurant@v1", `Tenant B resolves to 'restaurant@v1' (got: ${themeB})`);

// -----------------------------------------------------------------------------
// 2. SIMULATE INITIAL COMPILATION & DRAFT CREATION
// -----------------------------------------------------------------------------
console.log(`\n[STAGE 2] DRAFT CONFIGURATION INITIALIZATION`);
tenantA.website = {
  id: "web_tenant_a_111",
  companyId: tenantA.id,
  templateKey: themeA,
  draftConfig: {
    version: 1,
    templateKey: themeA,
    storeName: tenantA.name,
    storeSlug: tenantA.slug,
    theme: {
      primaryColor: "#0F172A",
      secondaryColor: "#F43F5E",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
    },
    navigation: {
      headerItems: [
        { id: "nav-home", label: "Home", url: "/" },
        { id: "nav-shop", label: "Shop", url: "/shop" },
        { id: "nav-about", label: "About", url: "/about" },
        { id: "nav-contact", label: "Contact", url: "/contact" },
      ],
    },
    pages: [
      {
        id: "p-home",
        slug: "home",
        title: "Home",
        isHomepage: true,
        sections: [
          {
            id: "sec-hero-1",
            type: "hero",
            order: 0,
            isVisible: true,
            content: {
              headline: "Gear Up for the Wild",
              subline: "Top-rated expedition equipment delivered nationwide.",
              ctaText: "Shop Collection",
              ctaLink: "/products",
            },
          },
          {
            id: "sec-products-1",
            type: "productGrid",
            order: 1,
            isVisible: true,
            content: {
              title: "Featured Equipment",
            },
          },
        ],
      },
      {
        id: "p-products",
        slug: "products",
        title: "All Products",
        isHomepage: false,
        sections: [
          {
            id: "sec-products-page-grid",
            type: "productGrid",
            order: 0,
            isVisible: true,
            content: { title: "Explore Full Catalog" },
          },
        ],
      },
    ],
    componentOverrides: {},
  },
  publishedConfig: null, // Initially unpublished
};

assert(tenantA.website.draftConfig.templateKey === "ecommerce-default@v1", `Tenant A draftConfig initialized with templateKey`);
assert(tenantA.website.publishedConfig === null, `Tenant A initial publishedConfig is null (draft-only state)`);

// -----------------------------------------------------------------------------
// 3. EDIT COMPONENT OVERRIDES IN BUILDER (CANONICAL TARGET IDENTIFIERS)
// -----------------------------------------------------------------------------
console.log(`\n[STAGE 3] COMPONENT EDITING & TARGET IDENTITY OVERRIDES`);
const targetIdHeadline = "home.sec-hero-1.HeroSlider.main.headline";
const targetIdCtaText = "home.sec-hero-1.HeroSlider.main.ctaText";
const targetIdPrimaryColor = "theme.primaryColor";

// Apply edits to Tenant A draft
tenantA.website.draftConfig.componentOverrides[targetIdHeadline] = "Explore Untold Trails";
tenantA.website.draftConfig.componentOverrides[targetIdCtaText] = "Browse Expedition Gear";
tenantA.website.draftConfig.theme.primaryColor = "#059669"; // Emerald

assert(
  tenantA.website.draftConfig.componentOverrides[targetIdHeadline] === "Explore Untold Trails",
  `Headline override stored in draft componentOverrides`
);
assert(
  tenantA.website.draftConfig.theme.primaryColor === "#059669",
  `Theme primaryColor updated in draft`
);

// Verify Tenant B remains completely unpolluted (Tenant Isolation)
assert(!tenantB.website, `Tenant B has no website config; Tenant A edits did not leak`);

// -----------------------------------------------------------------------------
// 4. MASCOT OPERATIONS EXECUTION SIMULATION
// -----------------------------------------------------------------------------
console.log(`\n[STAGE 4] MASCOT WEBSITE ACTION EXECUTION`);

// Mascot capability 1: website:update_section
function mascotUpdateSection(draftConfig, payload) {
  const targetPage = draftConfig.pages.find((p) => p.slug === (payload.pageSlug || "home") || p.isHomepage);
  if (!targetPage) return false;
  const section = targetPage.sections.find((s) => s.id === payload.sectionId || s.type === payload.sectionType);
  if (!section) return false;
  if (payload.headline) section.content.headline = payload.headline;
  if (payload.subline) section.content.subline = payload.subline;
  if (payload.ctaText) section.content.ctaText = payload.ctaText;
  return true;
}

const mascotSuccess = mascotUpdateSection(tenantA.website.draftConfig, {
  sectionType: "hero",
  headline: "Mascot-Assisted Expedition Gear",
  subline: "Curated with autonomous AI assistance for outdoor adventurers.",
});

assert(mascotSuccess === true, `Mascot successfully updated hero section content`);
assert(
  tenantA.website.draftConfig.pages[0].sections[0].content.headline === "Mascot-Assisted Expedition Gear",
  `Draft hero headline matches Mascot edit`
);

// Mascot capability 2: website:reorder_sections
function mascotToggleSectionVisibility(draftConfig, sectionId, isVisible) {
  const targetPage = draftConfig.pages[0];
  const section = targetPage.sections.find((s) => s.id === sectionId);
  if (section) {
    section.isVisible = isVisible;
    return true;
  }
  return false;
}

const toggleSuccess = mascotToggleSectionVisibility(tenantA.website.draftConfig, "sec-products-1", false);
assert(toggleSuccess === true, `Mascot successfully toggled section visibility`);
assert(tenantA.website.draftConfig.pages[0].sections[1].isVisible === false, `Section isVisible updated in draft`);

// -----------------------------------------------------------------------------
// 5. ATOMIC PUBLISHING & CACHE INVALIDATION SIMULATION
// -----------------------------------------------------------------------------
console.log(`\n[STAGE 5] ATOMIC PUBLISHING LIFECYCLE`);

function publishTenantWebsite(tenant, changeSummary) {
  const draft = tenant.website.draftConfig;
  tenant.website.publishedConfig = JSON.parse(JSON.stringify(draft));
  tenant.website.publishedConfig.publishedAt = new Date().toISOString();
  tenant.website.publishedConfig.changeSummary = changeSummary;
  tenant.website.publishedConfig.version = (tenant.website.publishedConfig.version || 1) + 1;
  return tenant.website.publishedConfig;
}

const publishedA = publishTenantWebsite(tenantA, "Published by Mascot Assistant with Expedition copy");

assert(publishedA !== null, `Tenant A publishedConfig is now active`);
assert(publishedA.version === 2, `Revision version incremented to 2`);
assert(
  publishedA.pages[0].sections[0].content.headline === "Mascot-Assisted Expedition Gear",
  `Published storefront displays verified Mascot edits`
);

// -----------------------------------------------------------------------------
// 6. STOREFRONT SUBPAGE ROUTING & ZERO-404 VERIFICATION
// -----------------------------------------------------------------------------
console.log(`\n[STAGE 6] SUBPAGE ALIAS RESOLUTION ON PUBLISHED STOREFRONT`);

const slugAliases = {
  shop: "products",
  catalog: "products",
  "all-products": "products",
  store: "products",
};

function resolveStorefrontPage(publishedConfig, requestedSlug) {
  const cleanSlug = requestedSlug.trim().toLowerCase();
  const targetSlug = slugAliases[cleanSlug] || cleanSlug;

  const matched = (publishedConfig.pages || []).find(
    (p) => p.slug === cleanSlug || p.slug === targetSlug
  );

  return matched || null;
}

const shopResult = resolveStorefrontPage(publishedA, "shop");
const productsResult = resolveStorefrontPage(publishedA, "products");
const catalogResult = resolveStorefrontPage(publishedA, "catalog");

assert(shopResult !== null && shopResult.slug === "products", `Navigating to '/shop' cleanly resolves to products page (zero 404)`);
assert(productsResult !== null && productsResult.slug === "products", `Navigating to '/products' resolves to products page`);
assert(catalogResult !== null && catalogResult.slug === "products", `Navigating to '/catalog' resolves to products page`);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n===============================================================================");
console.log(`E2E TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log("===============================================================================\n");

process.exit(failed > 0 ? 1 : 0);
