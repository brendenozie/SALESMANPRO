const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.company.update({
    where: { id: '68ff7b9b83da64e461f9ffb8' },
    data: { slug: 'pflourishhub-archive' }
  });
  console.log('Renamed empty duplicate company slug to pflourishhub-archive');
  await prisma.$disconnect();
}

run().catch(console.error);
