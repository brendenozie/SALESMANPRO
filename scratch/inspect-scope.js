const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const targetId = '67c5b0182e2372b5f2366dbe';
  const targetEmail = 'brendenozie@gmail.com';

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: targetId },
        { email: targetEmail }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
      createdAt: true
    }
  });
  console.log('Target User:', user);

  // Check companies owned by target user
  const ownedCompanies = await prisma.company.findMany({
    where: {
      OR: [
        { userId: user?.id },
        { id: user?.companyId || undefined }
      ]
    },
    select: {
      id: true,
      name: true,
      slug: true,
      domain: true,
      category: true,
      variant: true,
      userId: true,
      showOnGhuba: true,
      hasWebsite: true,
      createdAt: true
    }
  });
  console.log('\nOwned/Associated Companies count:', ownedCompanies.length);
  ownedCompanies.forEach(c => {
    console.log(`- [${c.id}] ${c.name} (slug: ${c.slug}, domain: ${c.domain}, cat: ${c.category}, var: ${c.variant}, userId: ${c.userId})`);
  });

  const totalCompanies = await prisma.company.count();
  console.log('\nTotal Companies in DB:', totalCompanies);

  const allCompanies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      domain: true,
      userId: true,
      category: true,
      variant: true,
      _count: {
        select: {
          Product: true,
          marketplaceListings: true
        }
      }
    }
  });

  console.log('\nAll companies in DB:');
  allCompanies.forEach(c => {
    console.log(`- [${c.id}] ${c.name} (slug: ${c.slug}) | userId: ${c.userId} | products: ${c._count.Product} | listings: ${c._count.marketplaceListings} | cat: ${c.category} | var: ${c.variant}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
