const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const sample = await prisma.marketplaceListings.findMany({
    where: { company: { slug: 'shoes-store' } },
    select: { id: true, name: true, category: true, brand: true, productId: true },
    take: 25
  });
  console.log('Sample 25 from shoes-store:');
  console.table(sample);

  const distinctNames = await prisma.marketplaceListings.findMany({
    select: { name: true }
  });
  const nameCounts = {};
  for (const item of distinctNames) {
    nameCounts[item.name] = (nameCounts[item.name] || 0) + 1;
  }
  console.log('Top repeated names across all listings:');
  console.table(Object.entries(nameCounts).sort((a,b) => b[1] - a[1]).slice(0, 30));

  await prisma.$disconnect();
}

run().catch(console.error);
