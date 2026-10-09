const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const sampleListings = await prisma.marketplaceListings.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      brand: true,
      category: true,
      subCategory: true,
      subCategoryName: true,
      productId: true,
      companyId: true,
      images: true,
      sellingPrice: true,
      finalPrice: true,
      status: true,
      showOnGhuba: true,
      ghubaAdminApproved: true,
      ghubaStatus: true
    }
  });

  console.log('Sample marketplace listings:');
  sampleListings.forEach(l => {
    console.log(JSON.stringify(l, null, 2));
  });

  // Check how many have non-null productId
  const allListings = await prisma.marketplaceListings.findMany({
    select: { id: true, productId: true, companyId: true }
  });
  const withProd = allListings.filter(l => l.productId != null);
  const withoutProd = allListings.filter(l => l.productId == null);
  console.log(`Total listings: ${allListings.length}`);
  console.log(`Listings with productId: ${withProd.length}`);
  console.log(`Listings with null/undefined productId: ${withoutProd.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
