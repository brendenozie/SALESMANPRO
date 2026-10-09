const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const compList = await prisma.company.findMany({
    where: { marketplaceListings: { some: {} } },
    select: { 
      id: true, 
      name: true, 
      slug: true, 
      category: true,
      _count: { select: { marketplaceListings: true, Product: true } } 
    }
  });
  console.log(`Found ${compList.length} companies with listings:`);
  console.table(compList.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    category: c.category,
    listings: c._count.marketplaceListings,
    products: c._count.Product
  })));
  await prisma.$disconnect();
}

run().catch(console.error);
