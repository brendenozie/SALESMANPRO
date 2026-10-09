const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const items = await prisma.marketplaceListings.findMany({
    where: { company: { slug: 'travel-tourism' } },
    select: { id: true, name: true, isAvailable: true, status: true, showOnGhuba: true }
  });
  console.table(items);
  await prisma.$disconnect();
}

run().catch(console.error);
