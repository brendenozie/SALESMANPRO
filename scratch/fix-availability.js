const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAvailability() {
  const inactive = await prisma.marketplaceListings.findMany({
    where: { isAvailable: false },
    select: { id: true, name: true }
  });
  console.log(`Found ${inactive.length} listings with isAvailable: false:`);
  console.table(inactive);

  if (inactive.length > 0) {
    const updated = await prisma.marketplaceListings.updateMany({
      where: { isAvailable: false },
      data: { isAvailable: true }
    });
    console.log(`Updated ${updated.count} listings to isAvailable: true.`);
  }

  // Also verify Products have isAvailable: true
  const inactiveProducts = await prisma.product.findMany({
    where: { isAvailable: false },
    select: { id: true, name: true }
  });
  console.log(`Found ${inactiveProducts.length} products with isAvailable: false:`);
  console.table(inactiveProducts);
  if (inactiveProducts.length > 0) {
    await prisma.product.updateMany({
      where: { isAvailable: false },
      data: { isAvailable: true }
    });
  }

  await prisma.$disconnect();
}

fixAvailability().catch(console.error);
