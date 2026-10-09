const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const l = await prisma.marketplaceListings.findMany({
    where: { id: { in: ['690084dca2172b890cd8f61b', '69012ecbcda3cea48b52be7f'] } },
    select: { id: true, name: true, companyId: true, company: { select: { slug: true, name: true } } }
  });
  console.log(l);
  await prisma.$disconnect();
}

run().catch(console.error);
