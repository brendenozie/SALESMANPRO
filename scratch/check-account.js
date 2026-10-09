const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const acc = await prisma.account.findMany({
    where: {
      OR: [
        { userId: '67c5b0182e2372b5f2366dbe' },
        { userId: '68f1e945dcb9542a6b0a08eb' }
      ]
    }
  });
  console.log('Accounts:', acc);

  const comp = await prisma.company.findMany({ where: { userId: '67c5b0182e2372b5f2366dbe' } });
  console.log('Companies with userId 67c5b0182e2372b5f2366dbe:', comp);

  const comp2 = await prisma.company.findMany({ where: { userId: '67c5b0192e2372b5f2366dbf' } });
  console.log('Companies with userId 67c5b0192e2372b5f2366dbf:', comp2.map(c => ({ id: c.id, name: c.name, slug: c.slug })));

  // Check how many companies belong to brendenozie@gmail.com (userId 68f1e945dcb9542a6b0a08eb)
  const brendenCompanies = await prisma.company.findMany({
    where: { userId: '68f1e945dcb9542a6b0a08eb' },
    select: { id: true, name: true, slug: true, domain: true, category: true, variant: true }
  });
  console.log(`\nCompanies owned by brendenozie@gmail.com (count: ${brendenCompanies.length}):`);
  brendenCompanies.forEach(c => console.log(`- [${c.id}] ${c.name} (slug: ${c.slug}, cat: ${c.category}, var: ${c.variant})`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
