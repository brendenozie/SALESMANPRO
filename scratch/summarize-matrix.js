const fs = require('fs');

const raw = fs.readFileSync('scratch/matrix-49-clean.json', 'utf8');
const trimmed = raw.trim();
const jsonStart = trimmed.indexOf('[');
const data = JSON.parse(trimmed.slice(jsonStart));

console.log(`Total Hostnames: ${data.length}`);
const allOwned = data.every(d => d.isTargetOwner);
console.log(`All 49 Owned by 67c5b0182e2372b5f2366dbe: ${allOwned}`);

const atTarget = data.filter(d => d.shortfall === 0);
const hasOfferings = data.filter(d => d.distinctOfferings > 0);
const zeroOfferings = data.filter(d => d.distinctOfferings === 0);

console.log(`\nStores already at >= 20 offerings: ${atTarget.length}`);
atTarget.forEach(s => {
  console.log(`  - #${s.index} ${s.companyName} (${s.hostname}): ${s.distinctOfferings} offerings`);
});

console.log(`\nStores with partial offerings (>0 and <20): ${hasOfferings.length - atTarget.length}`);
hasOfferings.forEach(s => {
  if (s.shortfall > 0) {
    console.log(`  - #${s.index} ${s.companyName} (${s.hostname}): ${s.distinctOfferings} offerings (needs +${s.shortfall})`);
  }
});

console.log(`\nStores with 0 offerings (needs +20): ${zeroOfferings.length}`);
zeroOfferings.forEach(s => {
  console.log(`  - #${s.index} ${s.companyName} (${s.hostname}) [Type: ${s.businessType}]`);
});
