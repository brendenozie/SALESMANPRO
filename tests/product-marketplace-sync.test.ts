/**
 * tests/product-marketplace-sync.test.ts
 *
 * Test suite verifying that Product and customer-facing MarketplaceListings
 * remain synchronized across AI generation, SEO updates, and Admin operations.
 */

import {
  syncProductToMarketplaceListings,
  ensureMarketplaceListingForProduct,
  syncListingToProduct,
} from "../lib/marketplace/syncProductToListing";
import { productAI } from "../lib/ai/productAI";
import prisma from "../server/db/prismadb";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runTestSuite() {
  console.log("Starting Product <-> MarketplaceListings Synchronization Test Suite...\n");

  let testCompanyId: string | null = null;
  let testProductId: string | null = null;
  let testListingId: string | null = null;

  try {
    // --------------------------------------------------------------------------
    // Setup: Create a temporary test company
    // --------------------------------------------------------------------------
    const testCompany = await prisma.company.create({
      data: {
        name: "Test Sync Motors & Goods",
        slug: `test-sync-${Date.now()}`,
        contactEmail: `test-sync-${Date.now()}@example.com`,
      },
    });
    testCompanyId = testCompany.id;

    // Create a temporary internal Product
    const testProduct = await prisma.product.create({
      data: {
        name: "Initial Internal Product Name",
        description: "Initial raw description",
        sellingPrice: 1500,
        costPrice: 1000,
        finalPrice: 1500,
        discount: 0,
        isAvailable: true,
        images: ["https://example.com/image1.jpg"],
        company: { connect: { id: testCompanyId } },
      },
    });
    testProductId = testProduct.id;

    // --------------------------------------------------------------------------
    // Test 1: Auto-create customer-facing MarketplaceListing from internal Product
    // --------------------------------------------------------------------------
    console.log("--- 1. Auto-create & Link Test ---");
    const syncResult = await syncProductToMarketplaceListings(testProductId, {
      autoCreateIfMissing: true,
    });

    assert(syncResult.success === true, "syncProductToMarketplaceListings succeeded");
    assert(syncResult.syncedListingCount === 1, "Created 1 attached marketplace listing");

    const createdListing = await prisma.marketplaceListings.findFirst({
      where: { productId: testProductId },
    });

    assert(Boolean(createdListing), "Attached marketplaceListing exists in database");
    assert(createdListing?.name === "Initial Internal Product Name", "Listing name matches product name");
    assert(createdListing?.sellingPrice === 1500, "Listing sellingPrice matches product sellingPrice");
    assert(createdListing?.buyingPrice === 1000, "Listing buyingPrice matches product costPrice");
    testListingId = createdListing?.id || null;

    // --------------------------------------------------------------------------
    // Test 2: Propagate Product modifications to attached MarketplaceListing
    // --------------------------------------------------------------------------
    console.log("\n--- 2. Modification Propagation Test ---");
    await prisma.product.update({
      where: { id: testProductId },
      data: {
        name: "Updated Premium Product",
        description: "Enriched description with technical specifications",
        sellingPrice: 2000,
        discount: 10,
        finalPrice: 1800,
        isFeatured: true,
        images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
      },
    });

    await syncProductToMarketplaceListings(testProductId);

    const updatedListing = await prisma.marketplaceListings.findUnique({
      where: { id: testListingId! },
    });

    assert(updatedListing?.name === "Updated Premium Product", "Listing name updated to match Product");
    assert(updatedListing?.sellingPrice === 2000, "Listing sellingPrice updated to 2000");
    assert(updatedListing?.discount === 10, "Listing discount updated to 10%");
    assert(updatedListing?.finalPrice === 1800, "Listing finalPrice updated to 1800");
    assert(updatedListing?.isFeatured === true, "Listing isFeatured synced to true");
    assert(
      Array.isArray(updatedListing?.images) && updatedListing?.images.length === 2,
      "Listing images synced with 2 image URLs",
    );

    // --------------------------------------------------------------------------
    // Test 3: AI content application to Product and MarketplaceListings
    // --------------------------------------------------------------------------
    console.log("\n--- 3. AI Application & Cascade Test ---");
    const aiApplyResult = await productAI.applyProductAI(
      {
        productId: testProductId,
        name: "AI Optimized Ultra Gadget",
        description: "AI crafted hook description",
        longDescription: "AI generated full comprehensive specification.",
        tags: ["electronics", "smart", "gadget"],
        bulletPoints: ["Fast charging", "Long battery life", "Premium finish"],
      },
      { companyId: testCompanyId, source: "WEB" },
    );

    assert(aiApplyResult.success === true, "applyProductAI returned success");

    const syncedListingAfterAI = await prisma.marketplaceListings.findUnique({
      where: { id: testListingId! },
    });

    assert(
      syncedListingAfterAI?.name === "AI Optimized Ultra Gadget",
      "Listing name updated by AI application",
    );
    assert(
      syncedListingAfterAI?.tags?.includes("smart") === true,
      "Listing tags include AI generated tags",
    );
    assert(
      syncedListingAfterAI?.longDescription?.includes("Fast charging") === true,
      "Listing longDescription includes AI bullet points",
    );

    // --------------------------------------------------------------------------
    // Test 4: Back-propagation from MarketplaceListing to internal Product
    // --------------------------------------------------------------------------
    console.log("\n--- 4. Back-Propagation Test ---");
    await prisma.marketplaceListings.update({
      where: { id: testListingId! },
      data: {
        sellingPrice: 2500,
        finalPrice: 2500,
      },
    });

    await syncListingToProduct(testListingId!);

    const productAfterBackProp = await prisma.product.findUnique({
      where: { id: testProductId },
    });

    assert(
      productAfterBackProp?.sellingPrice === 2500,
      "Product sellingPrice updated from marketplaceListing change",
    );

    // --------------------------------------------------------------------------
    // Test 5: ensureMarketplaceListingForProduct helper
    // --------------------------------------------------------------------------
    console.log("\n--- 5. Ensure Listing Helper Test ---");
    const ensured = await ensureMarketplaceListingForProduct(testProductId, testCompanyId);
    assert(Boolean(ensured && ensured.id === testListingId), "ensureMarketplaceListingForProduct returns existing listing");

    console.log("\n========================================");
    console.log("🎉 ALL PRODUCT-MARKETPLACE SYNC TESTS PASSED!");
  } finally {
    // Cleanup temporary test records
    try {
      if (testListingId) {
        await prisma.marketplaceListings.deleteMany({ where: { id: testListingId } });
      }
      if (testProductId) {
        await prisma.product.deleteMany({ where: { id: testProductId } });
      }
      if (testCompanyId) {
        await prisma.company.deleteMany({ where: { id: testCompanyId } });
      }
    } catch (cleanupErr) {
      console.warn("Cleanup warning:", cleanupErr);
    }
  }
}

runTestSuite()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test Suite Execution Failed:", err);
    process.exit(1);
  });
