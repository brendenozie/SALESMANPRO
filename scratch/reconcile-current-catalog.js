const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reconcileCurrent() {
  console.log('=== ITEM 3: RECONCILIATION OF CURRENT PRODUCTS & LISTINGS ===\n');

  const products = await prisma.product.findMany({
    include: { company: { select: { slug: true, name: true } }, marketplaceListings: { select: { id: true, name: true } } }
  });

  const listings = await prisma.marketplaceListings.findMany({
    include: { company: { select: { slug: true, name: true } }, product: { select: { id: true, name: true } } }
  });

  console.log(`Current Total Products: ${products.length}`);
  console.log(`Current Total Marketplace Listings: ${listings.length}`);

  // Breakdown by store
  const storeMap = {};

  for (const p of products) {
    const slug = p.company?.slug || 'unknown';
    if (!storeMap[slug]) storeMap[slug] = { name: p.company?.name, products: [], listings: [] };
    storeMap[slug].products.push(p);
  }

  for (const l of listings) {
    const slug = l.company?.slug || 'unknown';
    if (!storeMap[slug]) storeMap[slug] = { name: l.company?.name, products: [], listings: [] };
    storeMap[slug].listings.push(l);
  }

  console.log('\n--- Per-Store Breakdown ---');
  console.table(Object.entries(storeMap).map(([slug, data]) => ({
    StoreSlug: slug,
    StoreName: data.name,
    Products: data.products.length,
    Listings: data.listings.length,
    Delta: data.listings.length - data.products.length
  })));

  // Investigate the difference: 77 listings vs 76 products
  console.log('\n--- Discrepancy Investigation (77 listings vs 76 products) ---');
  for (const [slug, data] of Object.entries(storeMap)) {
    if (data.listings.length !== data.products.length) {
      console.log(`Store [${slug}] has ${data.products.length} products and ${data.listings.length} listings:`);
      console.log('Products:', data.products.map(p => ({ id: p.id, name: p.name, listingsCount: p.marketplaceListings.length })));
      console.log('Listings:', data.listings.map(l => ({ id: l.id, name: l.name, linkedProductId: l.product?.id })));
    }
  }

  // Active vs Draft Breakdown
  console.log('\n--- Status Breakdown: Active vs Draft ---');
  const productStatuses = {};
  for (const p of products) {
    productStatuses[p.status] = (productStatuses[p.status] || 0) + 1;
  }
  console.log('Product Statuses:', productStatuses);

  const listingStatuses = {};
  const listingAvailability = {};
  const listingGhuba = {};
  for (const l of listings) {
    listingStatuses[l.status] = (listingStatuses[l.status] || 0) + 1;
    listingAvailability[l.isAvailable] = (listingAvailability[l.isAvailable] || 0) + 1;
    listingGhuba[l.showOnGhuba] = (listingGhuba[l.showOnGhuba] || 0) + 1;
  }
  console.log('Listing Statuses:', listingStatuses);
  console.log('Listing isAvailable:', listingAvailability);
  console.log('Listing showOnGhuba:', listingGhuba);

  // Explanation of 18 stores vs 15 tested
  console.log('\n--- Explanation of 18 Original Stores vs 15 Tested ---');
  const allCompaniesWithListingsOriginally = [
    'duka-yangu',
    'portfolio-personal-branding',
    'directory-listings',
    'event-ticketing',
    'service-provider',
    'booking',
    'real-estate',
    'automotive',
    'restaurant-food-delivery',
    'marketplace',
    'blog-content',
    'healthcare-clinics',
    'finance-legal',
    'travel-tourism',
    'shoes-store',
    'flourishhub',
    'pflourishhub',
    'furniture-store',
    'fashion-store'
  ];
  console.log(`Total companies with listings originally in Stage A: 19 (or 18 unique domains).`);
  console.log('Stores with active curated catalogs tested in Stage F:', Object.keys(storeMap));
  const purgedStoresWithZeroNow = allCompaniesWithListingsOriginally.filter(s => !storeMap[s]);
  console.log('Stores where dummy listings were purged and currently have 0 active listings:', purgedStoresWithZeroNow);

  await prisma.$disconnect();
}

reconcileCurrent().catch(console.error);
