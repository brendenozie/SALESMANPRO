const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const ids = ['67c5b0182e2372b5f2366dbe', '67c5b0192e2372b5f2366dbf', '68f1e945dcb9542a6b0a08eb'];
  console.log('Auditing references to IDs:', ids);

  // Check companies
  for (const id of ids) {
    const comps = await prisma.company.findMany({ where: { userId: id } });
    console.log(`Companies with userId ${id}: ${comps.length}`);
    comps.forEach(c => console.log(`  - ${c.name} (${c.slug})`));
  }

  // Check products
  const totalProducts = await prisma.product.count();
  console.log(`\nTotal products in DB: ${totalProducts}`);

  // Check marketplace listings
  const totalListings = await prisma.marketplaceListings.count();
  console.log(`Total marketplace listings in DB: ${totalListings}`);

  // Check product categories
  const totalCategories = await prisma.productCategory.count();
  console.log(`Total product categories in DB: ${totalCategories}`);

  // Check store categories
  const totalStoreCategories = await prisma.storeCategory.count();
  console.log(`Total store categories in DB: ${totalStoreCategories}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
