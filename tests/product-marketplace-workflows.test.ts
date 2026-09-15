/**
 * tests/product-marketplace-workflows.test.ts
 *
 * Enterprise Test Suite verifying:
 * 1. Product ↔ Marketplace Listing linking, unlinking, and candidate search.
 * 2. Side-by-side conflict comparison (price/title discrepancies).
 * 3. Price conflict resolution policies (PRODUCT price vs LISTING price).
 * 4. 1-click internal Product creation from an unlinked MarketplaceListing.
 * 5. Enterprise Bulk Import:
 *    - Row normalization & column mapping resilience.
 *    - Row validation (required names, non-negative numbers, duplicate SKU prevention).
 *    - Dry-run preview calculation (create, update, link counts).
 *    - PRODUCTS_ONLY execution mode.
 *    - LINK_EXISTING execution mode.
 *    - Partial failure isolation (malformed row does not abort valid rows).
 */

import prisma from "../server/db/prismadb";
import {
  compareProductAndListing,
  linkListingToProduct,
  unlinkListing,
  createProductFromListing,
  searchLinkCandidates,
} from "../lib/marketplace/linkingService";
import {
  normalizeImportRow,
  validateImportRows,
  previewBulkImport,
  executeBulkImport,
} from "../lib/marketplace/bulkImportService";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runTestSuite() {
  console.log("================================================================================");
  console.log("Starting Enterprise Product & Marketplace Workflows Test Suite");
  console.log("================================================================================\n");

  let testCompanyId: string | null = null;
  let testProductId: string | null = null;
  let testListingId: string | null = null;

  try {
    // --------------------------------------------------------------------------
    // 0. Setup: Create a temporary test company
    // --------------------------------------------------------------------------
    const timestamp = Date.now();
    const testCompany = await prisma.company.create({
      data: {
        name: `Workflow Test Company ${timestamp}`,
        slug: `workflow-test-${timestamp}`,
        contactEmail: `workflow-test-${timestamp}@example.com`,
      },
    });
    testCompanyId = testCompany.id;
    console.log(`[Setup] Created test company ID: ${testCompanyId}`);

    // Create an internal inventory product
    const product = await prisma.product.create({
      data: {
        name: "Sony WH-1000XM5 Wireless Headphones",
        model: "WH1000XM5-BLK",
        category: "Audio",
        costPrice: 280,
        sellingPrice: 399.99,
        finalPrice: 399.99,
        quantity: 25,
        isAvailable: true,
        company: { connect: { id: testCompanyId } },
      },
    });
    testProductId = product.id;
    console.log(`[Setup] Created internal product ID: ${testProductId}`);

    // Create an unlinked marketplace listing with a price difference
    const listing = await prisma.marketplaceListings.create({
      data: {
        name: "Sony WH-1000XM5 Noise Cancelling Headphones",
        category: "Audio",
        subCategory: {},
        sellingPrice: 429.99,
        finalPrice: 429.99,
        quantity: 10,
        isAvailable: true,
        company: { connect: { id: testCompanyId } },
      },
    });
    testListingId = listing.id;
    console.log(`[Setup] Created unlinked marketplace listing ID: ${testListingId}\n`);

    // ==========================================================================
    // 1. Candidate Search & Conflict Comparison Tests
    // ==========================================================================
    console.log("--- Section 1: Candidate Search & Conflict Comparison ---");

    // Search candidates by title keyword
    const searchResults = await searchLinkCandidates(testCompanyId, "Sony WH-1000XM5");
    assert(searchResults.length > 0, "Found product candidates matching 'Sony WH-1000XM5'");
    assert(searchResults[0].id === testProductId, "First candidate matches our created product ID");

    // Search candidates by SKU / Model
    const skuSearchResults = await searchLinkCandidates(testCompanyId, "WH1000XM5-BLK");
    assert(skuSearchResults.length > 0, "Found product candidate matching SKU 'WH1000XM5-BLK'");

    // Compare listing and product for conflicts
    const comparisonResult = await compareProductAndListing(testCompanyId, testProductId, testListingId);
    assert(comparisonResult.success === true, "compareProductAndListing succeeded");
    assert(comparisonResult.comparison?.hasPriceConflict === true, "Detected price conflict (399.99 vs 429.99)");
    assert(comparisonResult.comparison?.productPrice === 399.99, "Reported correct product price: 399.99");
    assert(comparisonResult.comparison?.listingPrice === 429.99, "Reported correct listing price: 429.99");
    assert(comparisonResult.comparison?.hasTitleConflict === true, "Detected subtle title variation conflict");

    // ==========================================================================
    // 2. Linking & Price Conflict Resolution Policies
    // ==========================================================================
    console.log("\n--- Section 2: Linking with Price Conflict Resolution ---");

    // Link with pricePreference = "PRODUCT" (inventory price wins)
    const linkResultProductWins = await linkListingToProduct({
      companyId: testCompanyId,
      productId: testProductId,
      listingId: testListingId,
      pricePreference: "PRODUCT",
      syncSpecs: false,
    });
    assert(linkResultProductWins.success === true, "linkListingToProduct succeeded with PRODUCT preference");
    assert(linkResultProductWins.resolvedPrice === 399.99, "Resolved price chose product price (399.99)");

    // Verify database record updated
    const updatedListing1 = await prisma.marketplaceListings.findUnique({ where: { id: testListingId } });
    assert(updatedListing1?.productId === testProductId, "Listing is now linked to product in database");
    assert(updatedListing1?.sellingPrice === 399.99, "Listing selling price was updated to 399.99");

    // Now re-link with pricePreference = "LISTING" (public listing price wins)
    const linkResultListingWins = await linkListingToProduct({
      companyId: testCompanyId,
      productId: testProductId,
      listingId: testListingId,
      pricePreference: "LISTING",
      syncSpecs: false,
    });
    assert(linkResultListingWins.success === true, "linkListingToProduct succeeded with LISTING preference");

    // Unlink the listing
    const unlinkResult = await unlinkListing(testCompanyId, testListingId);
    assert(unlinkResult.success === true, "unlinkListing successfully disconnected listing");

    const unlinkedListing = await prisma.marketplaceListings.findUnique({ where: { id: testListingId } });
    assert(unlinkedListing?.productId === null, "Listing productId in database is now null");

    // ==========================================================================
    // 3. 1-Click Product Creation from Unlinked Listing
    // ==========================================================================
    console.log("\n--- Section 3: Create Internal Product from Unlinked Listing ---");

    const createProductResult = await createProductFromListing(testCompanyId, testListingId, {
      costPrice: 200,
      initialStock: 15,
      sku: "SONY-GEN-001",
    });
    assert(createProductResult.success === true, "createProductFromListing succeeded");
    assert(Boolean(createProductResult.productId), "Generated new product ID");

    // Check newly created product in database
    const newlyCreatedProduct = await prisma.product.findUnique({
      where: { id: createProductResult.productId },
    });
    assert(newlyCreatedProduct !== null, "Product exists in database");
    assert(newlyCreatedProduct?.costPrice === 200, "Preserved override costPrice = 200");
    assert(newlyCreatedProduct?.quantity === 15, "Preserved override initialStock = 15");
    assert(newlyCreatedProduct?.model === "SONY-GEN-001", "Preserved override SKU");

    // Verify the listing is automatically linked to the new product
    const relinkedListing = await prisma.marketplaceListings.findUnique({ where: { id: testListingId } });
    assert(relinkedListing?.productId === createProductResult.productId, "Listing is linked to generated product");

    // Clean up the generated product
    if (createProductResult.productId) {
      await prisma.marketplaceListings.update({
        where: { id: testListingId },
        data: { product: { disconnect: true } },
      });
      await prisma.product.delete({ where: { id: createProductResult.productId } });
    }

    // ==========================================================================
    // 4. Bulk Import: Normalization & Validation
    // ==========================================================================
    console.log("\n--- Section 4: Bulk Import Normalization & Validation ---");

    const rawSpreadsheetData = [
      {
        "Product Name": "Apple MacBook Pro 16",
        "SKU": "MBP16-M3-001",
        "Selling Price": "$2,499.00",
        "Cost Price": "2,000",
        "Stock Quantity": "10",
        "Category": "Laptops",
        "Description": "Apple Silicon M3 Max Laptop",
      },
      {
        "Product Name": "Dell XPS 15",
        "SKU": "DELL-XPS-15",
        "Selling Price": "1899.50",
        "Cost": "1500",
        "Qty": "8",
        "Category": "Laptops",
      },
      {
        // Malformed row: missing name and invalid price
        "Product Name": "",
        "SKU": "MALFORMED-1",
        "Price": "-10",
        "Stock": "5",
      },
      {
        // Duplicate SKU row
        "Product Name": "Duplicate MacBook",
        "SKU": "MBP16-M3-001", // Duplicate of row 1
        "Price": "2499",
      },
    ];

    const normalizedRows = rawSpreadsheetData.map((row, idx) => normalizeImportRow(row, idx));
    assert(normalizedRows.length === 4, "Normalized 4 raw rows");
    assert(normalizedRows[0].sellingPrice === 2499, "Cleaned dollar sign and parsed price to 2499");
    assert(normalizedRows[0].costPrice === 2000, "Parsed cost price to 2000");
    assert(normalizedRows[0].quantity === 10, "Parsed quantity to 10");

    const { validRows, errors } = validateImportRows(normalizedRows, "PRODUCTS_ONLY");
    assert(validRows.length === 2, "2 valid rows passed validation (MacBook Pro and Dell XPS)");
    assert(errors.length >= 2, "Detected errors in invalid rows");

    const duplicateSkuError = errors.find((e) => e.field === "sku" && e.row === 4);
    assert(Boolean(duplicateSkuError), "Correctly caught duplicate SKU in row 4");

    const nameError = errors.find((e) => e.field === "name" && e.row === 3);
    assert(Boolean(nameError), "Correctly caught empty product name in row 3");

    // ==========================================================================
    // 5. Bulk Import: Dry-Run Preview
    // ==========================================================================
    console.log("\n--- Section 5: Bulk Import Dry-Run Preview ---");

    const previewResult = await previewBulkImport(testCompanyId, rawSpreadsheetData, "PRODUCTS_ONLY");
    assert(previewResult.totalRows === 4, "Preview reported totalRows = 4");
    assert(previewResult.validRowsCount === 2, "Preview reported validRowsCount = 2");
    assert(previewResult.errorRowsCount === 3, "Preview reported error count");
    assert(previewResult.createCount === 2, "Preview determined 2 items will be created");

    // ==========================================================================
    // 6. Bulk Import: Execution & Partial Failure Isolation
    // ==========================================================================
    console.log("\n--- Section 6: Bulk Import Execution & Partial Failure Isolation ---");

    // Execute import with the mixed batch containing both valid and invalid rows
    const executionResult = await executeBulkImport(testCompanyId, rawSpreadsheetData, "PRODUCTS_ONLY");
    assert(executionResult.success === true, "executeBulkImport succeeded overall");
    assert(executionResult.createdCount === 2, "Successfully created 2 valid products");
    assert(executionResult.failedCount >= 2, "Isolated and tracked failed rows without aborting valid rows");

    // Verify products were created in database
    const createdMacBook = await prisma.product.findFirst({
      where: { companyId: testCompanyId, model: "MBP16-M3-001" },
    });
    assert(createdMacBook !== null, "MacBook product was persisted in database");
    assert(createdMacBook?.sellingPrice === 2499, "MacBook product has sellingPrice = 2499");

    const createdDell = await prisma.product.findFirst({
      where: { companyId: testCompanyId, model: "DELL-XPS-15" },
    });
    assert(createdDell !== null, "Dell XPS product was persisted in database");

    // ==========================================================================
    // 7. Bulk Import: LINK_EXISTING Mode
    // ==========================================================================
    console.log("\n--- Section 7: Bulk Import LINK_EXISTING Mode ---");

    // Create an unlinked listing with the Dell SKU to test linking via spreadsheet
    const dellListing = await prisma.marketplaceListings.create({
      data: {
        name: "Dell XPS 15 Laptop On Ghuba",
        model: "DELL-XPS-15", // Matches Dell product SKU
        category: "Laptops",
        subCategory: {},
        sellingPrice: 1950,
        company: { connect: { id: testCompanyId } },
      },
    });

    const linkSpreadsheetData = [
      {
        "SKU": "DELL-XPS-15",
        "Item Name": "Dell XPS 15 Laptop On Ghuba",
      },
    ];

    const linkExecutionResult = await executeBulkImport(testCompanyId, linkSpreadsheetData, "LINK_EXISTING");
    assert(linkExecutionResult.linkedCount === 1, "Linked 1 listing to product via bulk import");

    const linkedDellListing = await prisma.marketplaceListings.findUnique({
      where: { id: dellListing.id },
    });
    assert(linkedDellListing?.productId === createdDell?.id, "Listing is now linked to Dell product in DB");

    // Clean up created products and listings
    await prisma.marketplaceListings.deleteMany({ where: { companyId: testCompanyId } });
    await prisma.product.deleteMany({ where: { companyId: testCompanyId } });

    console.log("\n================================================================================");
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! Everything is solid and verified.");
    console.log("================================================================================\n");
  } catch (error) {
    console.error("❌ Test Suite Failed with Error:", error);
    process.exitCode = 1;
    throw error;
  } finally {
    // Teardown test company
    if (testCompanyId) {
      console.log(`[Teardown] Cleaning up test company ${testCompanyId}...`);
      await prisma.company.delete({ where: { id: testCompanyId } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runTestSuite();
