const fs = require('fs');

const raw = fs.readFileSync('scratch/vps-matrix-raw.json', 'utf8');
const lines = raw.split(/\r?\n/);
const filteredLines = [];
let capturing = false;

for (const line of lines) {
  // strip prompt if present
  const cleaned = line.replace(/^rs0 \[direct: primary\] salesmanprodb>\s*/, '');
  if (cleaned.trim().startsWith('[') && !capturing) {
    capturing = true;
  }
  if (capturing) {
    if (cleaned.includes('salesmanprodb>')) continue;
    filteredLines.push(cleaned);
    if (cleaned.trim() === ']') {
      break;
    }
  }
}

const jsCode = filteredLines.join('\n');
const data = eval(jsCode);

console.log(`Total Owned Stores: ${data.length}`);
const atTarget = data.filter(d => d.atTarget);
const needingExpansion = data.filter(d => !d.atTarget);
const totalShortfall = needingExpansion.reduce((acc, curr) => acc + curr.shortfall, 0);

console.log(`Stores at Target (>= 20 listings): ${atTarget.length}`);
console.log(`Stores Needing Expansion:          ${needingExpansion.length}`);
console.log(`Total Offerings Needed:            ${totalShortfall}`);

console.log("\nStores Needing Expansion (All):");
needingExpansion.forEach((s, idx) => {
  console.log(`${(idx + 1).toString().padStart(2)}. [${s.id}] ${s.name.padEnd(35)} | current=${s.listingsCount.toString().padStart(2)} | need=+${s.shortfall.toString().padStart(2)} | cat=${s.category || 'N/A'}`);
});

fs.writeFileSync('scratch/vps-matrix-clean.json', JSON.stringify(data, null, 2));
console.log("\nCleaned matrix saved to scratch/vps-matrix-clean.json");
