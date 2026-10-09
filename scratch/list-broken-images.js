const fs = require('fs');

const audit = JSON.parse(fs.readFileSync('scratch/catalog_authenticity_audit.json', 'utf-8'));
const broken = audit.filter(a => !a.imageAccessible);

console.log(`Found ${broken.length} listings with inaccessible images:`);
console.table(broken.map(b => ({
  store: b.storeSlug,
  title: b.title,
  statusCode: b.imageStatusCode,
  url: b.primaryImageUrl
})));
