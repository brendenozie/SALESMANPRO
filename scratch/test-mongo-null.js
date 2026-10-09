const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const c = await prisma.marketplaceListings.count({
    where: { 
      name: 'Samsung Galaxy S23',
      product: { is: null }
    }
  });
  console.log('Count with product: { is: null }:', c);
  await prisma.$disconnect();
}

test().catch(console.error);
