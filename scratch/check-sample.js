const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const sampleListing = await prisma.marketplaceListings.findFirst();
  console.log("SAMPLE LISTING KEYS & VALUES:");
  console.log(JSON.stringify(sampleListing, null, 2));

  const sampleProduct = await prisma.product.findFirst();
  console.log("\nSAMPLE PRODUCT KEYS & VALUES:");
  console.log(JSON.stringify(sampleProduct, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
