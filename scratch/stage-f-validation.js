const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function validate() {
  console.log('================================================================================');
  console.log('STAGE F: END-TO-END VALIDATION & ACCEPTANCE CHECKS');
  console.log('================================================================================\n');

  const report = {
    checks: {},
    summary: {}
  };

  // 1. Total counts
  const totalProducts = await prisma.product.count();
  const totalListings = await prisma.marketplaceListings.count();
  const totalCompanies = await prisma.company.count();
  const totalProductCategories = await prisma.productCategory.count();
  const totalStoreCategories = await prisma.storeCategory.count();

  console.log(`1. DATABASE TOTALS:`);
  console.log(`   Products: ${totalProducts}`);
  console.log(`   Marketplace Listings: ${totalListings}`);
  console.log(`   Companies: ${totalCompanies}`);
  console.log(`   Product Categories: ${totalProductCategories}`);
  console.log(`   Store Categories: ${totalStoreCategories}`);

  // 2. Unlinked listings check
  const unlinkedListings = await prisma.marketplaceListings.count({
    where: { product: { is: null } }
  });
  console.log(`\n2. UNLINKED LISTINGS (Target: 0): ${unlinkedListings}`);
  report.checks.unlinkedListings = unlinkedListings === 0 ? 'PASS' : 'FAIL';

  // 3. Dummy listings check
  const DUMMY_NAMES = [
    'Samsung Galaxy S23',
    'Dell XPS 13',
    'Apple Watch Series 8',
    'Nike Air Max',
    'KitchenAid Mixer',
    'Ergonomic Gaming Chair',
    'JBL Flip 6',
    'Sony Bravia 43”',
    'Oak Coffee Table',
    'Genuine Leather Wallet',
    'New Name',
    'Sony Sample Title'
  ];
  const dummyCount = await prisma.marketplaceListings.count({
    where: { name: { in: DUMMY_NAMES } }
  });
  console.log(`3. REMAINING DUMMY CLONE LISTINGS (Target: 0): ${dummyCount}`);
  report.checks.dummyCloneListings = dummyCount === 0 ? 'PASS' : 'FAIL';

  // 4. Foreign Key Referential Integrity Check
  console.log(`\n4. REFERENTIAL INTEGRITY AUDIT:`);
  
  // 4.1 All listings have valid existing Product
  const allListings = await prisma.marketplaceListings.findMany({
    select: { id: true, name: true, productId: true, companyId: true, productCategoryId: true, images: true, sellingPrice: true }
  });

  const productIds = new Set((await prisma.product.findMany({ select: { id: true } })).map(p => p.id));
  const companyIds = new Set((await prisma.company.findMany({ select: { id: true } })).map(c => c.id));
  const categoryIds = new Set((await prisma.productCategory.findMany({ select: { id: true } })).map(pc => pc.id));

  let brokenProductFk = 0;
  let brokenCompanyFk = 0;
  let brokenCategoryFk = 0;
  let emptyImages = 0;
  let zeroPrices = 0;

  for (const l of allListings) {
    if (l.productId && !productIds.has(l.productId)) brokenProductFk++;
    if (l.companyId && !companyIds.has(l.companyId)) brokenCompanyFk++;
    if (l.productCategoryId && !categoryIds.has(l.productCategoryId)) brokenCategoryFk++;
    if (!l.images || (Array.isArray(l.images) && l.images.length === 0)) emptyImages++;
    if (!l.sellingPrice || l.sellingPrice <= 0) zeroPrices++;
  }

  console.log(`   Broken Product FKs (Target: 0): ${brokenProductFk}`);
  console.log(`   Broken Company FKs (Target: 0): ${brokenCompanyFk}`);
  console.log(`   Broken Category FKs (Target: 0): ${brokenCategoryFk}`);
  console.log(`   Empty/Missing Images (Target: 0): ${emptyImages}`);
  console.log(`   Zero or Negative Prices (Target: 0): ${zeroPrices}`);

  report.checks.brokenProductFk = brokenProductFk === 0 ? 'PASS' : 'FAIL';
  report.checks.brokenCompanyFk = brokenCompanyFk === 0 ? 'PASS' : 'FAIL';
  report.checks.brokenCategoryFk = brokenCategoryFk === 0 ? 'PASS' : 'FAIL';
  report.checks.emptyImages = emptyImages === 0 ? 'PASS' : 'FAIL';
  report.checks.zeroPrices = zeroPrices === 0 ? 'PASS' : 'FAIL';

  // 5. StoreCategory Orphan Check
  const allStoreCats = await prisma.storeCategory.findMany({ select: { id: true, companyId: true } });
  let orphanStoreCats = 0;
  for (const sc of allStoreCats) {
    if (sc.companyId && !companyIds.has(sc.companyId)) orphanStoreCats++;
  }
  console.log(`   Orphaned StoreCategories (Target: 0): ${orphanStoreCats}`);
  report.checks.orphanStoreCategories = orphanStoreCats === 0 ? 'PASS' : 'FAIL';

  // 6. OrderItem Integrity Check (Biscuit listing 68e17a8016ac60978dc272ed)
  const biscuitListing = await prisma.marketplaceListings.findUnique({
    where: { id: '68e17a8016ac60978dc272ed' },
    include: { product: true }
  });
  const biscuitOrderItems = await prisma.orderItem.count({
    where: { marketplaceListingId: '68e17a8016ac60978dc272ed' }
  });

  console.log(`\n5. ORDER ITEM INTEGRITY:`);
  console.log(`   Listing 68e17a8016ac60978dc272ed exists: ${!!biscuitListing}`);
  console.log(`   Listing connected to Product: ${biscuitListing?.productId ? 'YES (' + biscuitListing.productId + ')' : 'NO'}`);
  console.log(`   Referenced by OrderItems: ${biscuitOrderItems}`);
  console.log(`   Images attached: ${Array.isArray(biscuitListing?.images) ? biscuitListing.images.length : 0}`);
  
  report.checks.orderItemIntegrity = (biscuitListing && biscuitListing.productId && biscuitOrderItems > 0) ? 'PASS' : 'FAIL';

  // 7. Store by Store Distribution
  console.log(`\n6. STORE-BY-STORE AUDIT SUMMARY:`);
  const storeSummary = await prisma.company.findMany({
    where: { marketplaceListings: { some: {} } },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      _count: { select: { marketplaceListings: true, Product: true } }
    }
  });

  console.table(storeSummary.map(s => ({
    Store: s.name,
    Slug: s.slug,
    Domain: s.category,
    Listings: s._count.marketplaceListings,
    Products: s._count.Product
  })));

  const allPass = Object.values(report.checks).every(v => v === 'PASS');
  console.log(`\n================================================================================`);
  console.log(`VALIDATION RESULT: ${allPass ? '🏆 ALL CHECKS PASSED PERFECTLY!' : '❌ SOME CHECKS FAILED'}`);
  console.log('================================================================================');

  await prisma.$disconnect();
}

validate().catch(console.error);
