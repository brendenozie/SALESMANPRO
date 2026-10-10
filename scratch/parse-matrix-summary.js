// parse-matrix-summary.js
const fs = require('fs');

const raw = fs.readFileSync('scratch/matrix-49-results.json', 'utf8');
const lines = raw.split(/\r?\n/).filter(l => !l.startsWith('rs0 '));
const jsonText = lines.slice(lines.findIndex(l => l.trim() === '['), lines.findLastIndex(l => l.trim() === ']') + 1).join('\n');
const data = JSON.parse(jsonText);

console.log(`Total Stores Audited: ${data.length}`);
let targetReached = 0;
let needsAdditions = 0;
let totalShortfall = 0;

console.log("\n| # | Store Name | Hostname | Company ID | Offerings | Shortfall |");
console.log("|---|---|---|---|---|---|");

data.forEach((s, idx) => {
  if (s.shortfall === 0) targetReached++;
  else {
    needsAdditions++;
    totalShortfall += s.shortfall;
  }
  console.log(`| ${idx + 1} | ${s.companyName || 'Unmapped'} | ${s.hostname} | ${s.companyId || 'N/A'} | ${s.distinctOfferings} | ${s.shortfall} |`);
});

console.log(`\nTarget Reached (>= 20): ${targetReached}`);
console.log(`Needs Additions: ${needsAdditions}`);
console.log(`Total Additions Shortfall: ${totalShortfall}`);
