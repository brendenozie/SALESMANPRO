/**
 * tests/product-listing-separation.test.ts
 *
 * Comprehensive End-to-End Verification Test Suite for:
 * Product vs MarketplaceListing Data Ownership, Publication Lifecycle,
 * Pricing Separation, AI Targeting, and Controlled Synchronization.
 */

import prisma from "@/server/db/prismadb";
import {
  publishProductToMarketplace,
  unpublishListing,
  syncApprovedSharedFields,
  reconcileProductListing,
} from "@/lib/marketplace/publicationService";
import { productAI } from "@/lib/ai/productAI";

async function runTestSuite() {
  console.log("===============================================================");
  console.log("🧪 STARTING PRODUCT VS MARKETPLACELISTING SEPARATION TEST SUITE");
  console.log("===============================================================");

  let testCompanyId: string | null = null;
  let testCategoryId: string | null = null;
  let testProductId: string | null = null;
  let testListingId: string | null = null;

  try {
    // 0. Setup test company and category
    console.log("\n[SETUP] Creating test tenant and product category...");
    const company = await prisma.company.create({
      data: {
        name: `Test Tenant ${Date.now()}`,
        slug: `test-tenant-${Date.now()}`,
        contactEmail: `tenant-${Date.now()}@example.com`,
      },
    });
    testCompanyId = company.id;
    console.log(`✓ Setup complete. Company: ${testCompanyId}`);

    // =========================================================================
    // TEST 1: Internal Product Creation (Must NOT automatically create listing)
    // =========================================================================
    console.log("\n[TEST 1] Testing Internal Product Creation (No Auto-Publish)...");
    const product = await prisma.product.create({
      data: {
        name: "Pro Gaming Laptop X1",
        description: "Internal warehouse item for gaming inventory",
        brand: "ApexGear",
        model: "AG-X1-2026",
        costPrice: 1200,
        sellingPrice: 1600,
        finalPrice: 1600,
        profitMargin: 25.0,
        quantity: 15,
        isAvailable: true,
        companyId: testCompanyId,
      },
    });
    testProductId = product.id;

    // Assert that NO marketplace listing exists for this product
    const initialListingsCount = await prisma.marketplaceListings.count({
      where: { productId: product.id },
    });

    if (initialListingsCount !== 0) {
      throw new Error(`TEST 1 FAILED: Product creation created ${initialListingsCount} listings automatically! Expected 0.`);
    }
    console.log("✓ TEST 1 PASSED: Internal Product created without any public MarketplaceListing.");

    // =========================================================================
    // TEST 2: Explicit Publication via publicationService
    // =========================================================================
    console.log("\n[TEST 2] Testing Explicit Publication to Marketplace...");
    const publishResult = await publishProductToMarketplace(product.id, {
      marketplacePrice: 1750, // Intentional channel display price
      customTitle: "ApexGear Pro Gaming Laptop X1 - 16GB RAM / 1TB SSD",
    });

    if (!publishResult.success || !publishResult.listingId) {
      throw new Error(`TEST 2 FAILED: Publication failed: ${publishResult.error}`);
    }
    testListingId = publishResult.listingId;

    const createdListing = await prisma.marketplaceListings.findUnique({
      where: { id: testListingId },
    });

    if (!createdListing) {
      throw new Error("TEST 2 FAILED: Created listing not found in database.");
    }

    // Verify publication flags
    if (createdListing.status !== "ACTIVE" || createdListing.showOnGhuba !== true) {
      throw new Error(`TEST 2 FAILED: Listing status is ${createdListing.status}, showOnGhuba is ${createdListing.showOnGhuba}`);
    }

    // Verify custom marketplace title and price
    if (createdListing.name !== "ApexGear Pro Gaming Laptop X1 - 16GB RAM / 1TB SSD") {
      throw new Error(`TEST 2 FAILED: Listing title not set correctly: ${createdListing.name}`);
    }
    if (createdListing.sellingPrice !== 1750) {
      throw new Error(`TEST 2 FAILED: Listing selling price is ${createdListing.sellingPrice}, expected 1750.`);
    }

    // Verify NO financial leakage (costPrice and profitMargin must NOT leak)
    if (createdListing.profitMargin !== 0 && createdListing.profitMargin != null) {
      throw new Error(`TEST 2 FAILED: Internal profit margin leaked to listing! Found: ${createdListing.profitMargin}`);
    }
    console.log("✓ TEST 2 PASSED: Product explicitly published to Marketplace with zero financial leakage.");

    // =========================================================================
    // TEST 3: Idempotent Publication (Publishing twice must NOT create duplicates)
    // =========================================================================
    console.log("\n[TEST 3] Testing Publication Idempotency...");
    const secondPublishResult = await publishProductToMarketplace(product.id);
    if (!secondPublishResult.success) {
      throw new Error(`TEST 3 FAILED: Re-publication failed: ${secondPublishResult.error}`);
    }

    const totalListingsForProduct = await prisma.marketplaceListings.count({
      where: { productId: product.id },
    });

    if (totalListingsForProduct !== 1) {
      throw new Error(`TEST 3 FAILED: Duplicate listings created! Count is ${totalListingsForProduct}, expected 1.`);
    }
    console.log("✓ TEST 3 PASSED: Publication is idempotent. No duplicate listings created.");

    // =========================================================================
    // TEST 4: Pricing Independence (Product Price vs Marketplace Price)
    // =========================================================================
    console.log("\n[TEST 4] Testing Pricing Independence...");
    // 4a. Update Product internal catalog price and cost price
    await prisma.product.update({
      where: { id: product.id },
      data: {
        costPrice: 1100,
        sellingPrice: 1500, // Reduced internal catalog price
      },
    });

    // Run routine shared spec sync
    await syncApprovedSharedFields(product.id);

    const listingAfterProductPriceChange = await prisma.marketplaceListings.findUnique({
      where: { id: testListingId },
    });

    if (listingAfterProductPriceChange?.sellingPrice !== 1750) {
      throw new Error(`TEST 4 FAILED: Marketplace price was overwritten by product price change! Expected 1750, got ${listingAfterProductPriceChange?.sellingPrice}`);
    }

    // 4b. Update Listing marketplace price directly
    await prisma.marketplaceListings.update({
      where: { id: testListingId },
      data: {
        sellingPrice: 1899,
        discount: 10,
        finalPrice: 1709.1,
      },
    });

    const productAfterListingPriceChange = await prisma.product.findUnique({
      where: { id: product.id },
    });

    if (productAfterListingPriceChange?.costPrice !== 1100 || productAfterListingPriceChange?.sellingPrice !== 1500) {
      throw new Error(`TEST 4 FAILED: Product internal price was overwritten by listing price change! Expected cost 1100, selling 1500; got cost ${productAfterListingPriceChange?.costPrice}, selling ${productAfterListingPriceChange?.sellingPrice}`);
    }
    console.log("✓ TEST 4 PASSED: Pricing is completely decoupled. Product price and Marketplace price operate independently.");

    // =========================================================================
    // TEST 5: Shared Technical Specs vs Custom Marketing Copy
    // =========================================================================
    console.log("\n[TEST 5] Testing Shared Specs Sync vs Custom Listing Marketing Copy...");
    // Customize listing marketing copy
    await prisma.marketplaceListings.update({
      where: { id: testListingId },
      data: {
        name: "Special Holiday Edition ApexGear Laptop",
        description: "Public marketing copy crafted for high conversion",
      },
    });

    // Update Product shared technical specifications
    await prisma.product.update({
      where: { id: product.id },
      data: {
        brand: "ApexGear Pro Series",
        model: "AG-X1-PRO-MAX",
        dimensions: "35x24x2 cm",
        weight: ["2.1 kg"],
        name: "Pro Gaming Laptop X1 Internal Backoffice", // Internal name changed
        description: "Internal warehouse notes: fragile display panel", // Internal description changed
      },
    });

    // Synchronize approved shared fields
    await syncApprovedSharedFields(product.id, ["brand", "model", "dimensions", "weight", "name", "description"]);

    const listingAfterSync = await prisma.marketplaceListings.findUnique({
      where: { id: testListingId },
    });

    // Assert shared specs updated
    if (listingAfterSync?.brand !== "ApexGear Pro Series" || listingAfterSync?.model !== "AG-X1-PRO-MAX") {
      throw new Error(`TEST 5 FAILED: Shared technical specifications failed to sync! Brand: ${listingAfterSync?.brand}, Model: ${listingAfterSync?.model}`);
    }

    // Assert custom marketing title and description were NOT overwritten
    if (listingAfterSync?.name !== "Special Holiday Edition ApexGear Laptop") {
      throw new Error(`TEST 5 FAILED: Custom public listing title was wiped! Found: ${listingAfterSync?.name}`);
    }
    if (listingAfterSync?.description !== "Public marketing copy crafted for high conversion") {
      throw new Error(`TEST 5 FAILED: Custom public marketing description was wiped! Found: ${listingAfterSync?.description}`);
    }
    console.log("✓ TEST 5 PASSED: Shared specs synchronized while custom public listing title & description were preserved.");

    // =========================================================================
    // TEST 6: AI Content Targeting (PRODUCT vs LISTING vs BOTH)
    // =========================================================================
    console.log("\n[TEST 6] Testing AI Content Targeting...");
    const aiContext = {
      companyId: testCompanyId,
      userId: "test-admin",
      source: "TEST" as any,
    };

    // 6a. Apply AI targeted ONLY to PRODUCT
    await productAI.applyProductAI({
      productId: product.id,
      targetType: "PRODUCT",
      description: "Updated AI technical description for internal inventory",
    }, aiContext);

    const productAfterAI = await prisma.product.findUnique({ where: { id: product.id } });
    const listingAfterProdAI = await prisma.marketplaceListings.findUnique({ where: { id: testListingId } });

    if (productAfterAI?.description !== "Updated AI technical description for internal inventory") {
      throw new Error("TEST 6 FAILED: AI description was not applied to Product.");
    }
    if (listingAfterProdAI?.description !== "Public marketing copy crafted for high conversion") {
      throw new Error("TEST 6 FAILED: Product-targeted AI leaked into consumer MarketplaceListing!");
    }

    // 6b. Apply AI targeted ONLY to LISTING
    await productAI.applyProductAI({
      listingId: testListingId,
      targetType: "LISTING",
      description: "Updated AI consumer advertising pitch for Ghuba shoppers",
    }, aiContext);

    const productAfterListAI = await prisma.product.findUnique({ where: { id: product.id } });
    const listingAfterListAI = await prisma.marketplaceListings.findUnique({ where: { id: testListingId } });

    if (listingAfterListAI?.description !== "Updated AI consumer advertising pitch for Ghuba shoppers") {
      throw new Error("TEST 6 FAILED: AI description was not applied to MarketplaceListing.");
    }
    if (productAfterListAI?.description !== "Updated AI technical description for internal inventory") {
      throw new Error("TEST 6 FAILED: Listing-targeted AI overwrote internal Product description!");
    }
    console.log("✓ TEST 6 PASSED: AI operations respect explicit targets (PRODUCT vs LISTING).");

    // =========================================================================
    // TEST 7: Unpublishing Lifecycle (Preserves Product & Inventory)
    // =========================================================================
    console.log("\n[TEST 7] Testing Unpublishing Lifecycle...");
    const unpublishResult = await unpublishListing(testListingId, "Merchant paused listing");
    if (!unpublishResult.success) {
      throw new Error(`TEST 7 FAILED: Unpublish operation failed: ${unpublishResult.error}`);
    }

    const unpublishedListing = await prisma.marketplaceListings.findUnique({ where: { id: testListingId } });
    const productAfterUnpublish = await prisma.product.findUnique({ where: { id: product.id } });

    if (unpublishedListing?.status !== "INACTIVE" || unpublishedListing?.showOnGhuba !== false) {
      throw new Error(`TEST 7 FAILED: Listing was not unpublished! Status: ${unpublishedListing?.status}, showOnGhuba: ${unpublishedListing?.showOnGhuba}`);
    }
    if (!productAfterUnpublish || productAfterUnpublish.quantity !== 15) {
      throw new Error("TEST 7 FAILED: Product or inventory was corrupted during unpublishing!");
    }
    console.log("✓ TEST 7 PASSED: Listing unpublishing successfully hides public item while preserving Product & inventory.");

    // =========================================================================
    // TEST 8: Non-destructive Reconciliation Diagnostics
    // =========================================================================
    console.log("\n[TEST 8] Testing Non-destructive Reconciliation Diagnostics...");
    // Create an unlisted product
    const unlistedProd = await prisma.product.create({
      data: {
        name: "Unlisted Secret Prototype",
        costPrice: 500,
        sellingPrice: 800,
        quantity: 5,
        companyId: testCompanyId,
      },
    });

    const report = await reconcileProductListing(testCompanyId);

    if (report.totalProducts !== 2) {
      throw new Error(`TEST 8 FAILED: Expected 2 total products in report, found ${report.totalProducts}`);
    }
    if (report.unlistedProductsCount !== 1) {
      throw new Error(`TEST 8 FAILED: Expected 1 unlisted product, found ${report.unlistedProductsCount}`);
    }
    if (report.unlistedProducts[0].id !== unlistedProd.id) {
      throw new Error("TEST 8 FAILED: Unlisted product mismatch in reconciliation report.");
    }
    if (report.priceDivergenceCount < 1) {
      throw new Error("TEST 8 FAILED: Expected price divergence to be reported between product and listing.");
    }
    console.log("✓ TEST 8 PASSED: Reconciliation accurately diagnosed unlisted products and price divergences non-destructively.");

    console.log("\n===============================================================");
    console.log("🎉 ALL PRODUCT VS MARKETPLACE SEPARATION TESTS PASSED 100%!");
    console.log("===============================================================\n");

  } finally {
    // Teardown test artifacts
    console.log("[TEARDOWN] Cleaning up test data...");
    try {
      if (testCompanyId) {
        await prisma.marketplaceListings.deleteMany({ where: { companyId: testCompanyId } });
        await prisma.product.deleteMany({ where: { companyId: testCompanyId } });
        await prisma.company.deleteMany({ where: { id: testCompanyId } });
      }
      console.log("✓ Cleanup complete.");
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
