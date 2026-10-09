const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const pComp = await prisma.company.findFirst({
    where: { slug: 'pflourishhub' },
    include: { marketplaceListings: true }
  });
  console.log('Company:', pComp?.id, pComp?.name, pComp?.slug);
  console.log('Listings in pflourishhub:', pComp?.marketplaceListings.map(l => ({
    id: l.id,
    name: l.name,
    status: l.status,
    isAvailable: l.isAvailable
  })));

  const fComp = await prisma.company.findFirst({
    where: { slug: 'flourishhub' },
    include: { marketplaceListings: true }
  });
  console.log('Company:', fComp?.id, fComp?.name, fComp?.slug);
  console.log('Listings in flourishhub:', fComp?.marketplaceListings.map(l => ({
    id: l.id,
    name: l.name,
    status: l.status,
    isAvailable: l.isAvailable
  })));

  await prisma.$disconnect();
}

run().catch(console.error);
