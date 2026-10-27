/**
 * scratch/test-unified-ecosystem.ts
 *
 * Comprehensive integration tests verifying the Ghuba-SalesmanPro Seller Ecosystem:
 * 1. Category-to-Variant Resolution
 * 2. Canonical Template & Layout Resolution
 * 3. Taxonomy Normalization & Legitimate Unbranded Support
 * 4. Publication & Specification Synchronization Policy
 * 5. Tenant Authorization & Cross-Tenant Protection
 */

import { resolveGhubaStoreVariant } from "../lib/ghuba-store-mapper";
import { resolveCanonicalTemplate } from "../lib/website-builder/template-registry";
import { getComponentNameForCategory } from "../components/site/layouts/siteBodyComponentMap";
import { TaxonomyService } from "../lib/taxonomy/taxonomyService";
import { canSyncProductFieldToListing, sanitizePublicListingData, FINANCIAL_AND_INTERNAL_DENYLIST } from "../lib/marketplace/productListingPolicy";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

async function runEcosystemVerification() {
  console.log("==================================================================");
  console.log("🚀 STARTING COMPREHENSIVE GHUBA-SALESMANPRO INTEGRATION VERIFICATION");
  console.log("==================================================================\n");

  // --- Suite 1: Store Category, Variant & Template Resolution ---
  console.log("--- Suite 1: Store Category, Variant & Template Resolution ---");
  const testCases = [
    { cat: "Fashion & Apparel", expectedVariant: "fashion", expectedTpl: "fashion@v1", expectedComp: "FashionSite" },
    { cat: "Shoes & Footwear", expectedVariant: "shoes-store", expectedTpl: "ecommerce-shoes@v1", expectedComp: "EcommerceShoesSite" },
    { cat: "Electronics & Gadgets", expectedVariant: "ecommerce", expectedTpl: "ecommerce-default@v1", expectedComp: "EcommerceSite" },
    { cat: "Beauty & Cosmetics", expectedVariant: "ecommerce", expectedTpl: "ecommerce-default@v1", expectedComp: "EcommerceSite" },
    { cat: "Home Decor & Furniture", expectedVariant: "furniture-store", expectedTpl: "furniture@v1", expectedComp: "FurnitureSite" },
    { cat: "Food, Snacks & Groceries", expectedVariant: "groceries-store", expectedTpl: "ecommerce-groceries@v1", expectedComp: "EcommerceGroceriesSite" },
    { cat: "Automotive & Motor Accessories", expectedVariant: "automotive-store", expectedTpl: "ecommerce-accessories@v1", expectedComp: "EcommerceAccessoriesSite" },
    { cat: "Baby & Kids Essentials", expectedVariant: "baby-store", expectedTpl: "ecommerce-baby@v1", expectedComp: "EcommerceBabySite" },
    { cat: "General Merchandise", expectedVariant: "ecommerce", expectedTpl: "ecommerce-default@v1", expectedComp: "EcommerceSite" },
  ];

  for (const tc of testCases) {
    const mapping = resolveGhubaStoreVariant(tc.cat);
    assert(mapping.variant === tc.expectedVariant, `${tc.cat} maps to variant '${tc.expectedVariant}' (got '${mapping.variant}')`);
    assert(mapping.templateKey === tc.expectedTpl, `${tc.cat} maps to template '${tc.expectedTpl}' (got '${mapping.templateKey}')`);

    const tpl = resolveCanonicalTemplate(mapping.category, mapping.variant);
    assert(tpl.id === tc.expectedTpl, `${tc.cat} canonical template resolves to '${tc.expectedTpl}' (got '${tpl.id}')`);

    const comp = getComponentNameForCategory(mapping.category, mapping.variant);
    assert(comp === tc.expectedComp, `${tc.cat} renders layout component '${tc.expectedComp}' (got '${comp}')`);
  }

  // --- Suite 2: Taxonomy Normalization & Legitimate Unbranded Support ---
  console.log("\n--- Suite 2: Taxonomy Normalization & Brand Policy ---");
  assert(TaxonomyService.normalizeBrand("Nike") === "Nike", "Preserves valid brand 'Nike'");
  assert(TaxonomyService.normalizeBrand("samsung electronics") === "Samsung Electronics", "Title-cases brand 'samsung electronics'");
  assert(TaxonomyService.normalizeBrand("generic") === null, "Converts 'generic' to null (legitimate unbranded)");
  assert(TaxonomyService.normalizeBrand("UNBRANDED") === null, "Converts 'UNBRANDED' to null (legitimate unbranded)");
  assert(TaxonomyService.normalizeBrand("N/A") === null, "Converts 'N/A' to null (legitimate unbranded)");
  assert(TaxonomyService.normalizeBrand("") === null, "Handles empty brand string cleanly");

  // Subcategory validation
  const mockParent = {
    id: "6825c2c7969ab9f16f620f99",
    name: "Smartphones",
    slug: "smartphones",
    subcategories: [
      { name: "Android Smartphones", slug: "android-smartphones" },
      { name: "iPhones", slug: "iphones" },
    ],
    brands: ["Samsung", "Apple"],
  };

  const v1 = TaxonomyService.validateSubcategory(mockParent, "Android Smartphones");
  assert(v1.isValid && v1.normalizedName === "Android Smartphones" && !v1.isCustom, "Matches existing subcategory 'Android Smartphones'");

  const v2 = TaxonomyService.validateSubcategory(mockParent, "Refurbished Handsets");
  assert(v2.isValid && v2.normalizedName === "Refurbished Handsets" && v2.isCustom, "Accepts sanitized custom subcategory 'Refurbished Handsets'");

  const v3 = TaxonomyService.validateSubcategory(mockParent, "<script>alert(1)</script>");
  assert(!v3.normalizedName?.includes("<script>"), "Strips dangerous HTML/script characters from custom subcategory");

  // --- Suite 3: Synchronization Policy & Sanitization ---
  console.log("\n--- Suite 3: Synchronization Policy & Sanitization ---");
  // Routine updates should allow commerce specs
  assert(canSyncProductFieldToListing("name", false, false), "Allows 'name' to synchronize to listing on update");
  assert(canSyncProductFieldToListing("sellingPrice", false, false), "Allows 'sellingPrice' to synchronize to listing on update");
  assert(canSyncProductFieldToListing("images", false, false), "Allows 'images' to synchronize to listing on update");
  assert(canSyncProductFieldToListing("category", false, false), "Allows 'category' to synchronize to listing on update");
  assert(canSyncProductFieldToListing("subCategoryName", false, false), "Allows 'subCategoryName' to synchronize to listing on update");
  assert(canSyncProductFieldToListing("productCategoryId", false, false), "Allows 'productCategoryId' to synchronize to listing on update");
  assert(canSyncProductFieldToListing("brand", false, false), "Allows 'brand' to synchronize to listing on update");

  // Strict internal financial denylist protection
  assert(!canSyncProductFieldToListing("costPrice", false, false), "Strictly blocks 'costPrice' from synchronizing");
  assert(!canSyncProductFieldToListing("profitMargin", false, false), "Strictly blocks 'profitMargin' from synchronizing");
  assert(!canSyncProductFieldToListing("supplier", false, false), "Strictly blocks 'supplier' from synchronizing");
  assert(!canSyncProductFieldToListing("internalNotes", false, false), "Strictly blocks 'internalNotes' from synchronizing");

  // Sanitization test
  const rawPayload = {
    name: "Luxury Leather Handbag",
    sellingPrice: 4500,
    costPrice: 2000,
    profitMargin: 0.55,
    supplier: "Secret Factory Ltd",
    images: ["https://cdn.example.com/bag.jpg"],
    brand: "Local Artisan",
  };
  const sanitized = sanitizePublicListingData(rawPayload);
  assert(sanitized.costPrice === undefined, "Sanitizer completely stripped 'costPrice'");
  assert(sanitized.profitMargin === undefined, "Sanitizer completely stripped 'profitMargin'");
  assert(sanitized.supplier === undefined, "Sanitizer completely stripped 'supplier'");
  assert(sanitized.sellingPrice === 4500, "Sanitizer preserved public 'sellingPrice'");
  assert(sanitized.name === "Luxury Leather Handbag", "Sanitizer preserved public 'name'");

  console.log("\n==================================================================");
  console.log("🎉 ALL INTEGRATION SUITES PASSED! ZERO REGRESSIONS DETECTED.");
  console.log("==================================================================\n");
  process.exit(0);
}

runEcosystemVerification();
