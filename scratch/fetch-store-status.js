/**
 * fetch-store-status.js
 * Connects to production MongoDB and outputs the current offering count per store
 * for all Companies owned by brendenozie@gmail.com (userId: 67c5b0182e2372b5f2366dbe)
 */

const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/salesmanprodb?replicaSet=rs0';
const TARGET_USER_ID = '67c5b0182e2372b5f2366dbe';
const TARGET_SHORTFALL = 20; // Target offerings per store

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db('salesmanprodb');

  // 1. Fetch all companies owned by target user
  const companies = await db.collection('Company').find({
    userId: new ObjectId(TARGET_USER_ID)
  }).toArray();

  console.log(`Found ${companies.length} companies owned by target user.`);

  // 2. For each company, get the hostname, storeId, and current listing count
  const results = [];

  for (const company of companies) {
    const companyId = company._id.toString();
    const hostname = company.hostname || company.domain || '';
    const name = company.name || '';

    // Count all listings for this company
    const totalListings = await db.collection('marketplaceListings').countDocuments({
      companyId: new ObjectId(companyId)
    });

    // Count only PUBLISHED listings
    const publishedListings = await db.collection('marketplaceListings').countDocuments({
      companyId: new ObjectId(companyId),
      status: 'PUBLISHED'
    });

    const shortfall = Math.max(0, TARGET_SHORTFALL - totalListings);

    results.push({
      companyId,
      name,
      hostname,
      totalListings,
      publishedListings,
      shortfall,
      atTarget: shortfall === 0,
      category: company.category || '',
    });
  }

  // Sort by shortfall descending (most needy first)
  results.sort((a, b) => b.shortfall - a.shortfall);

  // Save JSON
  fs.writeFileSync('scratch/store-status.json', JSON.stringify(results, null, 2));

  // Print table
  console.log('\n=== Store Status ===');
  console.log(`${'Name'.padEnd(35)} ${'Hostname'.padEnd(35)} ${'Total'.padStart(6)} ${'Published'.padStart(10)} ${'Shortfall'.padStart(10)}`);
  console.log('-'.repeat(100));

  for (const r of results) {
    console.log(
      r.name.substring(0, 34).padEnd(35),
      r.hostname.substring(0, 34).padEnd(35),
      String(r.totalListings).padStart(6),
      String(r.publishedListings).padStart(10),
      String(r.shortfall).padStart(10)
    );
  }

  const atTarget = results.filter(r => r.atTarget).length;
  const needsWork = results.filter(r => !r.atTarget).length;
  const totalShortfall = results.reduce((sum, r) => sum + r.shortfall, 0);

  console.log('\n=== Summary ===');
  console.log(`Stores at target (≥${TARGET_SHORTFALL} listings): ${atTarget}`);
  console.log(`Stores needing more listings:                 ${needsWork}`);
  console.log(`Total new listings needed:                    ${totalShortfall}`);

  await client.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
