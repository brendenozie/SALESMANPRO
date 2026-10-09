const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectUnlinked() {
  const unlinked = await prisma.marketplaceListings.findMany({
    where: { product: { is: null } },
    include: { company: { select: { slug: true, name: true } } }
  });
  console.log(`Unlinked listings count: ${unlinked.length}`);
  console.table(unlinked.map(u => ({
    id: u.id,
    store: u.company?.slug,
    name: u.name,
    category: u.category,
    price: u.sellingPrice
  })));
  await prisma.$disconnect();
}

inspectUnlinked().catch(console.error);
