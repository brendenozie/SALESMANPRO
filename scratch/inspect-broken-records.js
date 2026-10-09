const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const audit = JSON.parse(fs.readFileSync('scratch/catalog_authenticity_audit.json', 'utf8'));
  const broken = audit.filter(a => !a.imageAccessible);

  console.log(`Inspecting ${broken.length} items with broken images...`);
  for (const b of broken) {
    const p = await prisma.product.findUnique({ where: { id: b.productId } });
    const l = await prisma.marketplaceListings.findUnique({ where: { id: b.listingId } });
    console.log(`\n=== ${b.title} ===`);
    console.log(`Product ID: ${b.productId}`);
    console.log(`  Product images:`, p?.images);
    console.log(`Listing ID: ${b.listingId}`);
    console.log(`  Listing images:`, l?.images);
    console.log(`  Listing coverImage:`, l?.coverImage);
    console.log(`  Listing thumbnail:`, l?.thumbnail);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
