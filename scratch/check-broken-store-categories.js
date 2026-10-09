const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const allStoreCats = await prisma.storeCategory.findMany({});
  console.log(`Total StoreCategory records: ${allStoreCats.length}`);

  const companies = await prisma.company.findMany({ select: { id: true, name: true, slug: true } });
  const compIdSet = new Set(companies.map(c => c.id));

  const brokenStoreCats = [];
  const validStoreCats = [];

  for (const sc of allStoreCats) {
    if (!compIdSet.has(sc.companyId)) {
      brokenStoreCats.push(sc);
    } else {
      validStoreCats.push(sc);
    }
  }

  console.log(`Valid StoreCategories: ${validStoreCats.length}`);
  console.log(`Broken/Orphaned StoreCategories: ${brokenStoreCats.length}`);
  brokenStoreCats.forEach(sc => {
    console.log(`- Broken StoreCategory ID: ${sc.id}, companyId: ${sc.companyId}, categoryId: ${sc.categoryId}, displayName: ${sc.displayName}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
