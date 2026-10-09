const fs = require('fs');

const raw = fs.readFileSync('scratch/matrix.txt', 'utf8');
const start = raw.indexOf('--- BEGIN STORE READINESS MATRIX ---') + '--- BEGIN STORE READINESS MATRIX ---'.length;
const end = raw.indexOf('--- END STORE READINESS MATRIX ---');
const matrix = JSON.parse(raw.substring(start, end).trim());

fs.writeFileSync('scratch/matrix-parsed.json', JSON.stringify(matrix, null, 2));

console.log('Total Companies in Matrix:', matrix.length);
const owned = matrix.filter(m => m.isOwnedByBrenden);
const nonOwned = matrix.filter(m => !m.isOwnedByBrenden);
console.log('Owned by brendenozie@gmail.com:', owned.length);
console.log('Non-Owned (Excluded from writes):', nonOwned.length);

console.log('\nOwned breakdown by readiness:');
const byReadiness = {};
owned.forEach(m => {
  byReadiness[m.readiness] = (byReadiness[m.readiness] || 0) + 1;
});
console.log(byReadiness);

console.log('\nOwned breakdown by Archetype:');
const byArch = {};
owned.forEach(m => {
  byArch[m.archetype] = (byArch[m.archetype] || 0) + 1;
});
console.log(byArch);

console.log('\n=== TOP OWNED STORES WITH CATALOG ACTIVITY ===');
owned.filter(m => m.productsCount > 0 || m.listingsCount > 0).forEach(m => {
  console.log(`[${m.id}] "${m.name}" (${m.slug}) | Archetype: ${m.archetype} | Prods: ${m.productsCount} | Listings: ${m.listingsCount} | ActiveGhuba: ${m.activeGhubaListingsCount}`);
});

console.log('\n=== NON-OWNED STORES (EXCLUDED FROM WRITES) ===');
nonOwned.forEach(m => {
  console.log(`[${m.id}] "${m.name}" (${m.slug}) | Owner: ${m.ownerId} | Prods: ${m.productsCount} | Listings: ${m.listingsCount}`);
});
