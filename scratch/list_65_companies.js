const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany({
    where: { userId: '67c5b0182e2372b5f2366dbe' },
    select: { id: true, name: true, slug: true, category: true, variant: true, description: true }
  });
  console.log(JSON.stringify(companies, null, 2));
}

main().finally(() => prisma.$disconnect());
