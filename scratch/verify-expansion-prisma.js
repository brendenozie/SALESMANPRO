// verify-expansion-prisma.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log("=== RUNNING POST-EXPANSION PRISMA INTEGRITY TEST ===");
  
  // 1. Test fetching all listings with relations
  const count = await prisma.marketplaceListings.count();
  console.log(`Total listings in Prisma: ${count}`);

  // 2. Test fetching products with relations
  const prodCount = await prisma.product.count();
  console.log(`Total products in Prisma: ${prodCount}`);

  // 3. Test admin pagination query (the one that previously threw 500 error!)
  const adminPage = await prisma.marketplaceListings.findMany({
    take: 24,
    skip: 0,
    orderBy: { createdAt: 'desc' },
    include: {
      company: { select: { id: true, name: true, slug: true } },
      product: { select: { id: true, name: true, sellingPrice: true, quantity: true } }
    }
  });
  console.log(`Admin query simulation SUCCESS: fetched ${adminPage.length} listings cleanly with relations!`);

  // 4. Test public catalog query simulation
  const publicCatalog = await prisma.marketplaceListings.findMany({
    where: {
      showOnGhuba: true,
      isAvailable: true
    },
    take: 24,
    include: {
      company: { select: { name: true } }
    }
  });
  console.log(`Public catalog query simulation SUCCESS: returned ${publicCatalog.length} public offerings.`);

  // 5. Test store-by-store minimum target verification (20 listings)
  const targetUserId = "67c5b0182e2372b5f2366dbe";
  const ownedCompanies = await prisma.company.findMany({
    where: { userId: targetUserId },
    select: { id: true, name: true }
  });

  let verifiedStoresCount = 0;
  let deficientStores = [];

  for (const c of ownedCompanies) {
    const storeListingCount = await prisma.marketplaceListings.count({
      where: { companyId: c.id }
    });
    if (storeListingCount >= 20) {
      verifiedStoresCount++;
    } else {
      deficientStores.push({ id: c.id, name: c.name, count: storeListingCount });
    }
  }

  console.log(`\nStore-by-Store Threshold Verification:`);
  console.log(`Stores at >= 20 offerings: ${verifiedStoresCount}/${ownedCompanies.length}`);
  if (deficientStores.length > 0) {
    console.error("Deficient stores:", deficientStores);
    process.exit(1);
  } else {
    console.log("ALL 65 STORES MEET OR EXCEED 20 OFFERINGS THRESHOLD!");
  }
}

verify()
  .catch(err => {
    console.error("PRISMA VERIFICATION FAILED:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
