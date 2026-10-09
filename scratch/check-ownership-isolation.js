const fs = require('fs');

const raw = fs.readFileSync('scratch/stage-a.txt', 'utf8');
const start = raw.indexOf('--- BEGIN STAGE A DATA ---') + '--- BEGIN STAGE A DATA ---'.length;
const end = raw.indexOf('--- END STAGE A DATA ---');
const data = JSON.parse(raw.substring(start, end).trim());

const ownedIds = new Set(data.ownedCompanies.map(c => c.id));

console.log('Owned companies count:', ownedIds.size);

// Read census to see which stores in surviving listings belong to owned vs other
const census = JSON.parse(fs.readFileSync('scratch/census-complete.json', 'utf8'));

const storeOwnershipInCensus = {};
census.forEach(item => {
  const cid = item.companyId;
  const isOwned = ownedIds.has(cid);
  storeOwnershipInCensus[item.companyName] = {
    companyId: cid,
    isOwnedByBrenden: isOwned,
    listingsCount: (storeOwnershipInCensus[item.companyName]?.listingsCount || 0) + 1
  };
});

console.log('\n=== STORE OWNERSHIP IN SURVIVING LISTINGS ===');
for (const [sname, info] of Object.entries(storeOwnershipInCensus)) {
  console.log(`Store: "${sname}" [ID: ${info.companyId}] -> Owned by brendenozie@gmail.com? ${info.isOwnedByBrenden ? 'YES' : 'NO (PRESERVE/EXCLUDE)'} (${info.listingsCount} listings)`);
}
