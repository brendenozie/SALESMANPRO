const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const pList = await prisma.company.findMany({
    where: { slug: 'pflourishhub' },
    select: { id: true, name: true, slug: true, _count: { select: { marketplaceListings: true } } }
  });
  console.log('Companies with slug pflourishhub:', pList);
  await prisma.$disconnect();
}

run().catch(console.error);
