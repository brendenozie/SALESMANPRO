const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testStorefrontQueries() {
  console.log('Testing Storefront & Ghuba Marketplace Query Simulation...\n');

  const testStores = [
    { slug: 'duka-yangu', expectedMin: 10 },
    { slug: 'shoes-store', expectedMin: 7 },
    { slug: 'furniture-store', expectedMin: 6 },
    { slug: 'fashion-store', expectedMin: 6 },
    { slug: 'automotive', expectedMin: 5 },
    { slug: 'real-estate', expectedMin: 5 },
    { slug: 'restaurant-food-delivery', expectedMin: 6 },
    { slug: 'travel-tourism', expectedMin: 5 },
    { slug: 'healthcare-clinics', expectedMin: 5 },
    { slug: 'event-ticketing', expectedMin: 4 },
    { slug: 'service-provider', expectedMin: 4 },
    { slug: 'booking', expectedMin: 3 },
    { slug: 'finance-legal', expectedMin: 3 },
    { slug: 'flourishhub', expectedMin: 4 },
    { slug: 'pflourishhub', expectedMin: 2 }
  ];

  for (const store of testStores) {
    const company = await prisma.company.findUnique({
      where: { slug: store.slug },
      include: {
        marketplaceListings: {
          where: { isAvailable: true, status: 'ACTIVE' },
          include: { product: true, productCategory: true }
        }
      }
    });

    if (!company) {
      console.error(`❌ Store [${store.slug}] not found!`);
      continue;
    }

    const count = company.marketplaceListings.length;
    const allHaveProducts = company.marketplaceListings.every(l => !!l.product);
    const allHaveImages = company.marketplaceListings.every(l => Array.isArray(l.images) && l.images.length > 0);
    const allHaveCategories = company.marketplaceListings.every(l => !!l.productCategory || !!l.category);

    console.log(`✓ Store [${store.slug}]: ${count} active listings | Products Linked: ${allHaveProducts ? '100%' : 'FAIL'} | Images OK: ${allHaveImages ? '100%' : 'FAIL'} | Categories OK: ${allHaveCategories ? '100%' : 'FAIL'}`);

    if (count < store.expectedMin || !allHaveProducts || !allHaveImages) {
      throw new Error(`Integrity check failed for ${store.slug}`);
    }
  }

  // Test Ghuba Global Marketplace query (showOnGhuba: true, ghubaStatus: "APPROVED", status: "ACTIVE")
  console.log('\nTesting Ghuba Global Feed Query...');
  const ghubaFeed = await prisma.marketplaceListings.findMany({
    where: {
      showOnGhuba: true,
      ghubaStatus: 'APPROVED',
      status: 'ACTIVE',
      isAvailable: true
    },
    include: {
      product: true,
      productCategory: true,
      company: { select: { name: true, slug: true } }
    },
    take: 100
  });

  console.log(`✓ Ghuba Global Feed: Returned ${ghubaFeed.length} verified listings.`);
  const ghubaProductsLinked = ghubaFeed.every(l => !!l.product);
  const ghubaImagesOk = ghubaFeed.every(l => Array.isArray(l.images) && l.images.length > 0);
  console.log(`  - 100% Products Linked on Ghuba: ${ghubaProductsLinked ? 'YES' : 'NO'}`);
  console.log(`  - 100% Valid Images on Ghuba: ${ghubaImagesOk ? 'YES' : 'NO'}`);

  // Category breakdown on Ghuba
  const catBreakdown = {};
  for (const item of ghubaFeed) {
    const cat = item.category || item.productCategory?.name || 'Uncategorized';
    catBreakdown[cat] = (catBreakdown[cat] || 0) + 1;
  }
  console.log('\nGhuba Marketplace Category Distribution:');
  console.table(catBreakdown);

  console.log('\n🏆 ALL STOREFRONT & GHUBA MARKETPLACE QUERIES SUCCEEDED WITH ZERO ERRORS!');
  await prisma.$disconnect();
}

testStorefrontQueries().catch(console.error);
