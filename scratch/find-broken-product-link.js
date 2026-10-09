const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ select: { id: true } });
  const productIdSet = new Set(products.map(p => p.id));
  const listings = await prisma.marketplaceListings.findMany({
    where: { productId: { not: null } },
    select: { id: true, name: true, productId: true, companyId: true }
  });

  const broken = listings.filter(l => !productIdSet.has(l.productId));
  console.log('Listing with broken productId:', broken);
}

main().catch(console.error).finally(() => prisma.$disconnect());
