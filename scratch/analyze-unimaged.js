const fs = require('fs');

const raw = fs.readFileSync('scratch/unimaged-products.json', 'utf8');
const data = JSON.parse(raw);

console.log('Total owned products:', data.totalOwnedProducts);
console.log('Imaged products count:', data.imagedCount);
console.log('Unimaged products count:', data.unimagedCount);

// Group by storeName
const storeMap = {};
data.unimagedProducts.forEach(p => {
  if (!storeMap[p.storeName]) {
    storeMap[p.storeName] = {
      companyId: p.companyId,
      category: p.storeCategory,
      count: 0,
      samples: []
    };
  }
  storeMap[p.storeName].count++;
  if (storeMap[p.storeName].samples.length < 3) {
    storeMap[p.storeName].samples.push({
      name: p.name,
      brand: p.brand,
      category: p.category,
      subCategory: p.subCategory
    });
  }
});

console.log(`Number of stores with unimaged products: ${Object.keys(storeMap).length}`);
console.log('\n--- STORE SAMPLES ---');
for (const [store, info] of Object.entries(storeMap)) {
  console.log(`\n[${store}] (${info.category}) - ${info.count} unimaged`);
  info.samples.forEach(s => {
    console.log(`  - ${s.name} | Brand: ${s.brand || 'N/A'} | Cat: ${s.category} | Sub: ${s.subCategory}`);
  });
}
