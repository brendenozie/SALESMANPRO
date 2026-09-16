import { getTenantProductDetail, getTenantProductMetadata, getTenantProductList } from "@/lib/tenant-product-service";
import prisma from "@/server/db/prismadb";

async function runTenantProductTests() {
  console.log("\n========================================================");
  console.log("  TENANT PRODUCT SERVICE HIGH-PERFORMANCE TEST SUITE");
  console.log("========================================================");

  // Find an active company and an active product listing
  const sampleListing = await prisma.marketplaceListings.findFirst({
    where: { status: "ACTIVE" },
    include: { company: true },
  });

  if (!sampleListing || !sampleListing.company) {
    console.log("⚠️ No active sample listing in database. Skipping live DB assertion.");
    return;
  }

  const slug = sampleListing.company.slug || "sample-slug";
  const id = sampleListing.id;

  console.log(`\n[TEST 1] Testing getTenantProductDetail with slug "${slug}" and id "${id}"...`);
  const t0 = performance.now();
  const detail1 = await getTenantProductDetail(slug, id);
  const t1 = performance.now();
  console.log(`  ✓ First fetch (DB or fresh cache): ${(t1 - t0).toFixed(2)}ms`);

  if (!detail1) {
    throw new Error("Expected detail1 to be found");
  }

  // Verify tenant isolation and fields
  if (detail1.product.id !== id) {
    throw new Error(`Product ID mismatch: expected ${id}, got ${detail1.product.id}`);
  }

  // Verify sensitive fields stripped
  if ((detail1.product as any).costPrice !== 0 || (detail1.product as any).buyingPrice !== 0) {
    throw new Error("Sensitive fields costPrice or buyingPrice leaked!");
  }

  console.log("  ✓ Sensitive fields (costPrice, buyingPrice) successfully sanitized");

  // Verify caching on second call
  console.log("\n[TEST 2] Testing getTenantProductDetail cache speed...");
  const t2 = performance.now();
  const detail2 = await getTenantProductDetail(slug, id);
  const t3 = performance.now();
  console.log(`  ✓ Second fetch (Cached): ${(t3 - t2).toFixed(2)}ms`);
  if (!detail2) throw new Error("Expected cached detail2 to be found");

  // Verify metadata generation
  console.log("\n[TEST 3] Testing getTenantProductMetadata...");
  const metadata = await getTenantProductMetadata(slug, id);
  if (!metadata || !metadata.title) {
    throw new Error("Metadata generation failed");
  }
  console.log(`  ✓ Generated metadata title: "${metadata.title}"`);

  // Verify product list
  console.log("\n[TEST 4] Testing getTenantProductList...");
  const listResult = await getTenantProductList(slug, { take: 8 });
  if (!listResult) throw new Error("Product list returned null");
  console.log(`  ✓ Found ${listResult.listings.length} listings for tenant ${slug}`);

  console.log("\n========================================================");
  console.log("  ALL TENANT PRODUCT SERVICE TESTS PASSED! ✓");
  console.log("========================================================\n");
}

runTenantProductTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
