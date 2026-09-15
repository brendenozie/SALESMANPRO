/**
 * tests/seo-engine.test.ts
 *
 * Automated regression & unit test suite for the Central SEO Engine.
 */

import {
  buildCanonicalUrl,
  resolveCanonicalHost,
  PRIMARY_PLATFORM_DOMAIN,
  PRIMARY_GHUBA_DOMAIN,
} from "../lib/seo/canonical-builder";
import { buildPageTitle } from "../lib/seo/title-builder";
import { buildPageDescription } from "../lib/seo/description-builder";
import { generateStructuredData } from "../lib/seo/structured-data";
import { SEOService } from "../lib/seo/seo-service";
import { evaluateListingSEOReadiness, evaluateTenantStoreSEO } from "../lib/seo/seo-validation";

let failed = 0;
function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    failed++;
  } else {
    console.log(`✅ PASS: ${msg}`);
  }
}

async function runTests() {
  console.log("Starting SEO Engine Test Suite...\n");

  // --- 1. CANONICAL BUILDER TESTS ---
  console.log("--- 1. Canonical Builder Tests ---");

  // Platform canonical
  const hubUrl = buildCanonicalUrl({
    siteType: "SALESMANPRO",
    path: "/about",
  });
  assert(hubUrl === "https://salesmanpro.site/about", "Platform canonical URL matches salesmanpro.site/about");

  // Ghuba canonical
  const ghubaUrl = buildCanonicalUrl({
    siteType: "GHUBA",
    path: "/ghuba/productlist/shoe--abc123",
  });
  assert(ghubaUrl === "https://ghuba.shop/ghuba/productlist/shoe--abc123", "Ghuba canonical URL matches ghuba.shop");

  // Tenant on custom domain
  const customDomainUrl = buildCanonicalUrl({
    siteType: "TENANT_STORE",
    tenant: { slug: "nikekenya", domain: "nikekenya.co.ke" },
    path: "/products/air-max",
  });
  assert(customDomainUrl === "https://nikekenya.co.ke/products/air-max", "Custom domain canonical matches tenant domain");

  // Tenant on subdomain
  const subDomainUrl = buildCanonicalUrl({
    siteType: "TENANT_STORE",
    tenant: { slug: "nikekenya", domain: null },
    path: "/products/air-max",
  });
  assert(subDomainUrl === "https://nikekenya.salesmanpro.site/products/air-max", "Subdomain canonical matches {slug}.salesmanpro.site");

  // Stripping internal /site/[slug] prefix
  const strippedInternalUrl = buildCanonicalUrl({
    siteType: "TENANT_STORE",
    tenant: { slug: "nikekenya", domain: "nikekenya.co.ke" },
    path: "/site/nikekenya/products/air-max",
  });
  assert(strippedInternalUrl === "https://nikekenya.co.ke/products/air-max", "Internal /site/[slug] prefix is stripped from canonical");

  // Stripping tracking parameters
  const trackingStrippedUrl = buildCanonicalUrl({
    siteType: "GHUBA",
    path: "/ghuba/productlist?utm_source=facebook&utm_medium=cpc&fbclid=XYZ123",
  });
  assert(trackingStrippedUrl === "https://ghuba.shop/ghuba/productlist", "Tracking parameters (utm_*, fbclid) stripped from canonical");

  // --- 2. TITLE BUILDER TESTS ---
  console.log("\n--- 2. Title Builder Tests ---");

  const hubTitle = buildPageTitle({
    siteType: "SALESMANPRO",
    pageType: "PRICING",
  });
  assert(hubTitle.includes("Pricing") && hubTitle.includes("SalesmanPro"), "Platform pricing title includes Pricing & SalesmanPro");

  const ghubaProductTitle = buildPageTitle({
    siteType: "GHUBA",
    pageType: "PRODUCT",
    entity: { id: "1", name: "Samsung Galaxy S24 Ultra" },
  });
  assert(ghubaProductTitle.includes("Samsung Galaxy S24 Ultra") && ghubaProductTitle.includes("Ghuba"), "Ghuba product title includes product name & Ghuba");

  const tenantProductTitle = buildPageTitle({
    siteType: "TENANT_STORE",
    pageType: "PRODUCT",
    tenant: { id: "t1", slug: "apple", name: "Apple Store Nairobi" },
    entity: { id: "p1", name: "iPhone 16 Pro Max" },
  });
  assert(tenantProductTitle.includes("iPhone 16 Pro Max") && tenantProductTitle.includes("Apple Store Nairobi"), "Tenant product title matches Product | Store Name");

  // --- 3. DESCRIPTION BUILDER TESTS ---
  console.log("\n--- 3. Description Builder Tests ---");

  const ghubaDesc = buildPageDescription({
    siteType: "GHUBA",
    pageType: "PRODUCT",
    entity: { id: "1", name: "Sony Headphones", finalPrice: 15000, currency: "KES", brand: "Sony" },
  });
  assert(ghubaDesc.includes("Sony Headphones") && ghubaDesc.includes("15,000"), "Description includes item name and formatted price");
  assert(ghubaDesc.length <= 165, "Description length <= 165 chars");

  // --- 4. STRUCTURED DATA SCHEMA TESTS ---
  console.log("\n--- 4. Structured Data Schema Tests ---");

  const productSchemas = generateStructuredData(
    {
      siteType: "TENANT_STORE",
      pageType: "PRODUCT",
      tenant: { id: "t1", slug: "safari", name: "Safari Outfitter", currency: "KES" },
      entity: {
        id: "p1",
        name: "Safari Boots",
        finalPrice: 8500,
        currency: "KES",
        brand: "Bata",
        isAvailable: true,
        images: ["https://example.com/boots.jpg"],
      },
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Footwear", url: "/categories/footwear" },
        { name: "Safari Boots", url: "/products/p1" },
      ],
    },
    "https://safari.salesmanpro.site/products/p1"
  );

  const hasBreadcrumbs = productSchemas.some((s) => s["@type"] === "BreadcrumbList");
  const productSchema = productSchemas.find((s) => s["@type"] === "Product");

  assert(hasBreadcrumbs, "Emits BreadcrumbList schema");
  assert(Boolean(productSchema), "Emits Product schema");
  assert(productSchema?.offers?.price === 8500, "Product schema has price 8500");
  assert(productSchema?.offers?.availability === "https://schema.org/InStock", "Product schema availability is InStock");
  assert(productSchema?.brand?.name === "Bata", "Product schema brand is Bata");

  // --- 5. VEHICLE DUAL SCHEMA TESTS ---
  console.log("\n--- 5. Vehicle Dual Schema Tests ---");
  const vehicleSchemas = generateStructuredData(
    {
      siteType: "GHUBA",
      pageType: "VEHICLE",
      entity: {
        id: "v1",
        make: "Toyota",
        model: "Prado",
        year: "2022",
        transmission: "Automatic",
        fuelType: "Diesel",
        finalPrice: 7500000,
        images: ["https://example.com/prado.jpg"],
      },
    },
    "https://ghuba.shop/ghuba/productlist/prado--token"
  );

  const hasCarSchema = vehicleSchemas.some((s) => s["@type"] === "Car");
  const hasProductSchema = vehicleSchemas.some((s) => s["@type"] === "Product");
  assert(hasCarSchema && hasProductSchema, "Automotive listing emits both Car and Product schema for Google eligibility");

  // --- 6. READINESS EVALUATOR TESTS ---
  console.log("\n--- 6. SEO Readiness Evaluator Tests ---");
  const fullListing = {
    id: "l1",
    name: "MacBook Pro 16-inch M3 Max",
    description: "Brand new sealed MacBook Pro with 36GB unified memory and 1TB SSD. Comes with 1 year Apple official warranty.",
    finalPrice: 420000,
    images: ["https://example.com/mbp.jpg"],
    brand: "Apple",
    isAvailable: true,
  };
  const readiness1 = evaluateListingSEOReadiness(fullListing);
  assert(readiness1.status === "SEO_READY", "Complete listing gets SEO_READY status");
  assert(readiness1.score >= 80, `Readiness score (${readiness1.score}) >= 80`);

  const thinListing = {
    id: "l2",
    name: "Bag",
    description: "",
  };
  const readiness2 = evaluateListingSEOReadiness(thinListing);
  assert(readiness2.status === "SEO_NEEDS_ATTENTION", "Thin listing gets SEO_NEEDS_ATTENTION status");

  // --- 7. TENANT STORE READINESS EVALUATOR TESTS ---
  console.log("\n--- 7. Tenant Store SEO Readiness Tests ---");
  const readyStore = evaluateTenantStoreSEO({
    id: "store-1",
    slug: "urban-threads",
    name: "Urban Threads Nairobi",
    description: "Kenya's premier streetwear boutique offering authentic sneakers, hoodies, and jackets with same-day Nairobi dispatch.",
    logoUrl: "https://example.com/logo.png",
    contactPhone: "+254700000000",
    domain: "urbanthreads.co.ke",
  });
  assert(readyStore.status === "SEO_READY", "Complete store profile gets SEO_READY status");
  assert(readyStore.score >= 80, `Store readiness score (${readyStore.score}) >= 80`);

  const emptyStore = evaluateTenantStoreSEO({
    id: "store-2",
    slug: "bare-store",
    name: "X",
  });
  assert(emptyStore.status === "SEO_NEEDS_ATTENTION", "Incomplete store profile gets SEO_NEEDS_ATTENTION");

  // Summary
  console.log(`\n========================================`);
  if (failed === 0) {
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } else {
    console.error(`💥 ${failed} TESTS FAILED!`);
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
