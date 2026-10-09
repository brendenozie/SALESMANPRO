const fs = require('fs');

const raw = fs.readFileSync('scratch/live-search.json', 'utf8');
const searchResult = JSON.parse(raw);
const items = searchResult.data || searchResult.items || (Array.isArray(searchResult) ? searchResult : []);

console.log('=== LIVE GHUBA SEARCH RESULTS ===');
console.log('Total Public Items returned:', items.length);

items.forEach((item, idx) => {
  const img = (item.images && item.images.length > 0) ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url) : 'NO_IMAGE';
  const price = item.finalPrice || item.sellingPrice || item.price;
  console.log(`${idx + 1}. [${item.id}] "${item.name || item.title}"`);
  console.log(`   Store: "${item.company?.name || item.companyName || 'N/A'}" | Brand: "${item.brand || 'None'}"`);
  console.log(`   Cat: "${item.category}" | SubCat: "${item.subCategoryName || 'None'}" | Price: KES ${price}`);
  console.log(`   Image: ${img}`);
  console.log('---');
});
