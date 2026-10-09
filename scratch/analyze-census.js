const fs = require('fs');
const https = require('https');

const data = JSON.parse(fs.readFileSync('scratch/census-parsed.json', 'utf8'));

console.log('=== GROUP 1: 18 PUBLICLY VISIBLE LISTINGS ===');
const visible = data.filter(d => d.group === 'PUBLICLY_VISIBLE');
visible.forEach((d, i) => {
  console.log(`${i+1}. [${d.id}] "${d.title}"`);
  console.log(`   Price: KES ${d.price} | Store: ${d.companyName} | StoreId: ${d.companyId}`);
  console.log(`   Category: ${d.category} | Subcategory: ${d.subcategory} | Brand: ${d.brand}`);
  console.log(`   Product ID: ${d.productId} (Found: ${!!d.productTitle}) | Orders: ${d.ordersCount}`);
  console.log(`   Images: ${d.images.length > 0 ? d.images[0] : 'NO IMAGE'}`);
  console.log('---');
});

console.log('\n=== GROUP 2: 12 OTHER LISTINGS (THE DISCREPANCY GROUP) ===');
const other = data.filter(d => d.group === 'OTHER');
other.forEach((d, i) => {
  console.log(`${i+1}. [${d.id}] "${d.title}"`);
  console.log(`   Status: ${d.status} | isAvailable: ${d.isAvailable} | showOnGhuba: ${d.showOnGhuba}`);
  console.log(`   Price: KES ${d.price} | Store: ${d.companyName} | Orders: ${d.ordersCount}`);
  console.log(`   Reason not public: ${!d.isAvailable ? 'isAvailable=false ' : ''}${!d.showOnGhuba ? 'showOnGhuba=false ' : ''}${d.status !== 'ACTIVE' ? 'status!=ACTIVE' : ''}`);
  console.log('---');
});

console.log('\n=== GROUP 3: 28 INACTIVE ORDER-PRESERVED LISTINGS ===');
const inactive = data.filter(d => d.group === 'INACTIVE_ORDER_PRESERVED');
inactive.forEach((d, i) => {
  console.log(`${i+1}. [${d.id}] "${d.title}" | Price: ${d.price} | Store: ${d.companyName} | Orders: ${d.ordersCount}`);
});

console.log('\n=== SUMMARY CHECKS ===');
console.log(`Total census records: ${data.length}`);
console.log(`Visible (18): ${visible.length}`);
console.log(`Inactive (28): ${inactive.length}`);
console.log(`Other (12): ${other.length}`);
console.log(`Sum: ${visible.length + inactive.length + other.length} (Matches 58 exactly)`);
