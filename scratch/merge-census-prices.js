const fs = require('fs');

const census = JSON.parse(fs.readFileSync('scratch/census-parsed.json', 'utf8'));
const prices = JSON.parse(fs.readFileSync('scratch/prices-parsed.json', 'utf8'));

census.forEach(c => {
  const p = prices[c.id] || {};
  c.sellingPrice = p.sellingPrice !== undefined ? p.sellingPrice : null;
  c.finalPrice = p.finalPrice !== undefined ? p.finalPrice : null;
  c.basePrice = p.basePrice !== undefined ? p.basePrice : null;
  c.costPrice = p.costPrice !== undefined ? p.costPrice : null;
  c.subCategoryName = p.subCategoryName || null;
  c.description = p.description || '';
});

fs.writeFileSync('scratch/census-complete.json', JSON.stringify(census, null, 2));

console.log('=== 18 PUBLICLY VISIBLE LISTINGS (WITH ACCURATE PRICES) ===');
const visible = census.filter(c => c.group === 'PUBLICLY_VISIBLE');
visible.forEach((c, i) => {
  console.log(`${i+1}. [${c.id}] "${c.title}"`);
  console.log(`   Price: Selling=KES ${c.sellingPrice}, Final=KES ${c.finalPrice}, Base=KES ${c.basePrice}`);
  console.log(`   Store: ${c.companyName} (ID: ${c.companyId})`);
  console.log(`   Category: ${c.category} | Subcategory: ${c.subCategoryName} | Brand: ${c.brand}`);
  console.log(`   Images (${c.images.length}): ${c.images[0] || 'NONE'}`);
  console.log('---');
});

console.log('\n=== 12 OTHER LISTINGS (WITH ACCURATE PRICES) ===');
const other = census.filter(c => c.group === 'OTHER');
other.forEach((c, i) => {
  console.log(`${i+1}. [${c.id}] "${c.title}"`);
  console.log(`   Status: ${c.status} | Avail: ${c.isAvailable} | showGhuba: ${c.showOnGhuba}`);
  console.log(`   Price: Selling=KES ${c.sellingPrice}, Final=KES ${c.finalPrice}`);
  console.log(`   Store: ${c.companyName} | Orders: ${c.ordersCount}`);
  console.log('---');
});
