const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  console.log('--- PRODUCTS (11) ---');
  const products = await prisma.product.findMany({
    include: {
      company: { select: { id: true, name: true, slug: true } },
      productCategory: { select: { id: true, name: true, slug: true } },
      marketplaceListings: { select: { id: true, name: true, companyId: true } }
    }
  });

  products.forEach(p => {
    console.log(`Product [${p.id}]:`);
    console.log(`  Name: ${p.name}`);
    console.log(`  Brand: ${p.brand}, Category: ${p.category}, SubCatName: ${p.subCategoryName}`);
    console.log(`  ProductCat: ${p.productCategory?.name} (${p.productCategoryId})`);
    console.log(`  Company: ${p.company?.name} (${p.companyId})`);
    console.log(`  Images count: ${p.images?.length}, First image: ${JSON.stringify(p.images?.[0])}`);
    console.log(`  Price: selling=${p.sellingPrice}, final=${p.finalPrice}, cost=${p.costPrice}`);
    console.log(`  Status: ${p.status}, Active: ${p.active}, showOnGhuba: ${p.showOnGhuba}`);
    console.log(`  Linked Listings (${p.marketplaceListings.length}): ${p.marketplaceListings.map(l => l.id).join(', ')}`);
    console.log('--------------------------------------------------');
  });

  console.log('\n--- MARKETPLACE LISTINGS SUMMARY ---');
  const listingsWithProduct = await prisma.marketplaceListings.count({ where: { productId: { not: null } } });
  const listingsWithoutProduct = await prisma.marketplaceListings.count({ where: { productId: null } });
  console.log(`Listings with productId: ${listingsWithProduct}`);
  console.log(`Listings with productId == null: ${listingsWithoutProduct}`);

  // Breakdown of marketplace listings by companyId
  const listingsByCompany = await prisma.marketplaceListings.groupBy({
    by: ['companyId'],
    _count: { id: true }
  });

  console.log('\nListings by Company:');
  for (const group of listingsByCompany) {
    let comp = null;
    if (group.companyId) {
      comp = await prisma.company.findUnique({
        where: { id: group.companyId },
        select: { name: true, slug: true, userId: true }
      });
    }
    console.log(`- Company ${group.companyId} (${comp?.name || 'UNKNOWN'}, slug: ${comp?.slug}): ${group._count.id} listings`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
