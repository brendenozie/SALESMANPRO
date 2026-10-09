const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const c = await prisma.company.findUnique({
    where: { id: '68ff7b9b83da64e461f9ffb8' },
    select: {
      id: true,
      name: true,
      slug: true,
      userId: true,
      createdAt: true,
      _count: {
        select: {
          Product: true,
          marketplaceListings: true,
          customerOrders: true,
          StoreCategory: true
        }
      }
    }
  });
  console.log('Empty company 68ff7b9b83da64e461f9ffb8:', c);
  await prisma.$disconnect();
}

run().catch(console.error);
