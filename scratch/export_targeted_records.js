const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

const TARGET_SLUGS_MAP = {
  'duka-yangu': 'duka-yangu',
  'shoes-store': 'shoes-store',
  'ghuba': 'ghuba',
  'fashion-store': 'fashion-store',
  'furniture-store': 'furniture-store',
  'agrovet': 'agrovet',
  'baby-duka': 'baby-duka',
  'cake-duka': 'cake-duka',
  'pets-duka': 'pets-duka',
  'watch-duka': 'watch-duka',
  'honey-duka': 'honey-duka',
  'peanut-duka': 'peanut-duka',
  'glasses-duka': 'glasses-duka',
  'gaming-duka': 'gaming-duka',
  'flowers-duka': 'flowers-duka',
  'earphones-duka': 'earphones-duka',
  'groceries-duka': 'groceries-duka',
  'service-provider': 'service-provider',
  'booking': 'booking',
  'portfolio-personal-branding': 'portfolio-personal-branding',
  'blog-content': 'blog-content',
  'directory-listings': 'directory-listings',
  'educational-online-courses': 'educational-online-courses',
  'nonprofit-community': 'nonprofit-community',
  'restaurant-food-delivery': 'restaurant-food-delivery',
  'event-ticketing': 'event-ticketing',
  'real-estate': 'real-estate',
  'healthcare-clinics': 'healthcare-clinics',
  'media-entertainment': 'media-entertainment',
  'finance-legal': 'finance-legal',
  'automotive': 'automotive',
  'travel-tourism': 'travel-tourism',
  'fitness-wellness': 'fitness-wellness',
  'marketplace': 'marketplace',
  'security-services': 'security-services',
  'security-services-2': 'security-services-2',
  '3educational-online-courses': '3educational-online-courses',
  '2educational-online-courses': '2educational-online-courses',
  'logistics': 'logistics',
  'barbershop': 'barbershop',
  'executive-coach': 'executive-coach',
  'public-speaking': 'public-speaking',
  'flourishhub-2': 'flourishhub',
  'bike-store': 'bike-duka',
  'motorcycle-store': 'motorcycle-duka',
  'property-management': 'property-management',
  'meat-store': 'meat-store',
  'hardware-store': 'hardware-store',
  'books-store': 'book-store'
};

const AUTHORIZED_USER_ID = '67c5b0182e2372b5f2366dbe';

async function main() {
  console.log('Exporting targeted catalog records...');

  const actualSlugs = Object.values(TARGET_SLUGS_MAP);
  const companies = await prisma.company.findMany({
    where: {
      userId: AUTHORIZED_USER_ID,
      slug: { in: actualSlugs }
    }
  });

  console.log(`Found ${companies.length} target companies matching authorized owner.`);
  const companyIds = companies.map(c => c.id);

  const [products, listings] = await Promise.all([
    prisma.product.findMany({
      where: { companyId: { in: companyIds } }
    }),
    prisma.marketplaceListings.findMany({
      where: { companyId: { in: companyIds } }
    })
  ]);

  console.log(`Found ${products.length} products and ${listings.length} marketplace listings.`);

  const relationships = [];
  const productMap = new Map(products.map(p => [p.id, p]));
  const companyMap = new Map(companies.map(c => [c.id, c]));

  for (const listing of listings) {
    relationships.push({
      listingId: listing.id,
      listingName: listing.name,
      productId: listing.productId,
      productName: listing.productId && productMap.has(listing.productId) ? productMap.get(listing.productId).name : null,
      companyId: listing.companyId,
      companySlug: listing.companyId && companyMap.has(listing.companyId) ? companyMap.get(listing.companyId).slug : null,
      price: listing.sellingPrice,
      showOnGhuba: listing.showOnGhuba,
      status: listing.status
    });
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    authorizedUserId: AUTHORIZED_USER_ID,
    companyCount: companies.length,
    productCount: products.length,
    listingCount: listings.length,
    companies: companies.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      category: c.category,
      variant: c.variant,
      description: c.description
    })),
    products,
    listings,
    relationships
  };

  const outputPath = '/var/www/salesmanpro/backups/targeted_catalog_export_2026-10-15.json';
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
  console.log(`Successfully exported data to ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
