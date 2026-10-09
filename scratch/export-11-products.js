const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: {
      company: { select: { id: true, name: true, slug: true, category: true, variant: true } },
      productCategory: { select: { id: true, name: true, slug: true, subcategories: true } },
      marketplaceListings: true
    }
  });

  fs.writeFileSync('scratch/all_11_products.json', JSON.stringify(products, null, 2));
  console.log('Saved all 11 products to scratch/all_11_products.json');
}

main().catch(console.error).finally(() => prisma.$disconnect());
