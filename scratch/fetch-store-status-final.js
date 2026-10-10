/**
 * fetch-store-status-final.js
 * Uses Prisma client to query store listing counts
 * for all Companies owned by brendenozie@gmail.com
 */

const { PrismaClient } = require('../node_modules/.prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();
const TARGET_USER_EMAIL = 'brendenozie@gmail.com';
const TARGET_SHORTFALL = 20;

async function main() {
  // 1. Find the user
  const user = await prisma.user.findFirst({ where: { email: TARGET_USER_EMAIL } });
  if (!user) throw new Error('Target user not found!');
  console.log(`User: ${user.email} | id: ${user.id}`);

  // 2. Fetch all companies owned by this user
  const companies = await prisma.company.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      domain: true,
      category: true,
      showOnGhuba: true,
      createdAt: true,
    }
  });

  console.log(`\nFound ${companies.length} companies owned by target user.\n`);

  const results = [];

  for (const co of companies) {
    const totalListings = await prisma.marketplaceListings.count({
      where: { companyId: co.id }
    });

    const activeListings = await prisma.marketplaceListings.count({
      where: { companyId: co.id, status: 'ACTIVE' }
    });

    const draftListings = await prisma.marketplaceListings.count({
      where: { companyId: co.id, status: 'DRAFT' }
    });

    const productCount = await prisma.product.count({
      where: { companyId: co.id }
    });

    const shortfall = Math.max(0, TARGET_SHORTFALL - totalListings);

    results.push({
      companyId: co.id,
      name: co.name || '',
      domain: co.domain || '',
      category: co.category || '',
      showOnGhuba: co.showOnGhuba,
      productCount,
      totalListings,
      activeListings,
      draftListings,
      shortfall,
      atTarget: shortfall === 0,
    });
  }

  results.sort((a, b) => b.shortfall - a.shortfall);

  fs.writeFileSync('scratch/store-status.json', JSON.stringify(results, null, 2));
  console.log('Saved: scratch/store-status.json\n');

  console.log('=== Store Status (sorted by shortfall desc) ===');
  console.log(`${'Name'.padEnd(35)} ${'Domain'.padEnd(30)} ${'Prods'.padStart(6)} ${'Total'.padStart(7)} ${'Active'.padStart(7)} ${'Draft'.padStart(6)} ${'Need'.padStart(6)}`);
  console.log('-'.repeat(98));

  for (const r of results) {
    console.log(
      r.name.substring(0, 34).padEnd(35),
      (r.domain || '').substring(0, 29).padEnd(30),
      String(r.productCount).padStart(6),
      String(r.totalListings).padStart(7),
      String(r.activeListings).padStart(7),
      String(r.draftListings).padStart(6),
      String(r.shortfall).padStart(6),
    );
  }

  const atTarget = results.filter(r => r.atTarget).length;
  const needsWork = results.filter(r => !r.atTarget).length;
  const totalNew = results.reduce((sum, r) => sum + r.shortfall, 0);

  console.log('\n=== Summary ===');
  console.log(`Stores at target (≥${TARGET_SHORTFALL} listings): ${atTarget}`);
  console.log(`Stores needing more listings:                 ${needsWork}`);
  console.log(`Total new listings needed across all stores:  ${totalNew}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
