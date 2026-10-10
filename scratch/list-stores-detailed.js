const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/unimaged-products.json', 'utf8'));

// Group products by store
const stores = {};
data.unimagedProducts.forEach(p => {
  if (!stores[p.storeName]) {
    stores[p.storeName] = {
      companyId: p.companyId,
      storeCategory: p.storeCategory,
      products: []
    };
  }
  stores[p.storeName].products.push({
    productId: p.productId,
    name: p.name,
    category: p.category,
    subCategory: p.subCategory,
    listingsCount: p.listings.length
  });
});

console.log(`Total stores requiring enrichment: ${Object.keys(stores).length}`);

// Print summary of each store
Object.keys(stores).sort().forEach(storeName => {
  const s = stores[storeName];
  console.log(`\nStore: "${storeName}" | Category: ${s.storeCategory} | Products: ${s.products.length}`);
  const uniqueNames = Array.from(new Set(s.products.map(p => p.name)));
  console.log(`  Offerings (${uniqueNames.length}):`, uniqueNames.slice(0, 5).join('; ') + (uniqueNames.length > 5 ? '...' : ''));
});
