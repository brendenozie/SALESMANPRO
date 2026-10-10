/**
 * fetch-store-status-prisma.js
 * Uses Prisma client (already generated) to query store listing counts
 * for all Companies owned by brendenozie@gmail.com
 */

const { PrismaClient } = require('../node_modules/.prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();
const TARGET_USER_ID = '67c5b0182e2372b5f2366dbe';
const TARGET_SHORTFALL = 20;

async function main() {
  // 1. Fetch companies owned by target user
  const companies = await prisma.company.findMany({
    where: { userId: TARGET_USER_ID },
    select: {
      id: true,
      name: true,
      hostname: true,
      category: true,
    }
  });

  console.log(`Found ${companies.length} companies owned by target user (${TARGET_USER_ID}).`);

  const results = [];

  for (const co of companies) {
    // Total listings
    const totalListings = await prisma.marketplaceListings.count({
      where: { companyId: co.id }
    });

    // Published only
    const publishedListings = await prisma.marketplaceListings.count({
      where: { companyId: co.id, status: 'PUBLISHED' }
    });

    const shortfall = Math.max(0, TARGET_SHORTFALL - totalListings);

    results.push({
      companyId: co.id,
      name: co.name || '',
      hostname: co.hostname || '',
      category: co.category || '',
      totalListings,
      publishedListings,
      shortfall,
      atTarget: shortfall === 0,
    });
  }

  results.sort((a, b) => b.shortfall - a.shortfall);

  fs.writeFileSync('scratch/store-status.json', JSON.stringify(results, null, 2));

  console.log('\n=== Store Status (sorted by shortfall) ===');
  console.log(`${'Name'.padEnd(35)} ${'Total'.padStart(7)} ${'Published'.padStart(11)} ${'Shortfall'.padStart(11)}`);
  console.log('-'.repeat(70));

  for (const r of results) {
    console.log(
      r.name.substring(0, 34).padEnd(35),
      String(r.totalListings).padStart(7),
      String(r.publishedListings).padStart(11),
      String(r.shortfall).padStart(11)
    );
  }

  const atTarget = results.filter(r => r.atTarget).length;
  const needsWork = results.filter(r => !r.atTarget).length;
  const totalNew = results.reduce((sum, r) => sum + r.shortfall, 0);

  console.log('\n=== Summary ===');
  console.log(`Stores at target (≥${TARGET_SHORTFALL}): ${atTarget}`);
  console.log(`Stores needing more:          ${needsWork}`);
  console.log(`Total new listings needed:    ${totalNew}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
