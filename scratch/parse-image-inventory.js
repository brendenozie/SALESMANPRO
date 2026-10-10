const fs = require('fs');

const raw = fs.readFileSync('scratch/image-inventory-raw.json', 'utf8');
const lines = raw.split(/\r?\n/);
const filteredLines = [];
let capturing = false;

for (const line of lines) {
  const cleaned = line.replace(/^rs0 \[direct: primary\] salesmanprodb>\s*/, '');
  if (cleaned.trim().startsWith('{') && !capturing) {
    capturing = true;
  }
  if (capturing) {
    if (cleaned.includes('salesmanprodb>')) continue;
    filteredLines.push(cleaned);
  }
}

const jsCode = filteredLines.join('\n');
const data = eval('(' + jsCode + ')');

console.log("=== IMAGE COVERAGE AUDIT SUMMARY ===");
console.log(`Owned Stores:              ${data.ownedCompaniesCount}`);
console.log(`Total Products:            ${data.totals.totalProducts}`);
console.log(` - With Images:            ${data.totals.productsWithImages}`);
console.log(` - Without Images:         ${data.totals.productsWithoutImages}`);
console.log(`Total Marketplace Listings:${data.totals.totalListings}`);
console.log(` - With Images:            ${data.totals.listingsWithImages}`);
console.log(` - Without Images:         ${data.totals.listingsWithoutImages}`);

console.log("\nExisting Image Domains:");
console.log(JSON.stringify(data.domainCounts, null, 2));

console.log("\nSample Existing Images:");
data.sampleExistingImages.slice(0, 10).forEach(s => {
  console.log(` - [${s.store}] "${s.name}": ${s.url}`);
});

const storesNeedingImages = data.storeBreakdown.filter(s => s.productsWithoutImages > 0);
console.log(`\nStores Needing Image Enrichment: ${storesNeedingImages.length} / ${data.ownedCompaniesCount}`);

fs.writeFileSync('scratch/image-inventory-clean.json', JSON.stringify(data, null, 2));
console.log("Cleaned inventory saved to scratch/image-inventory-clean.json");
