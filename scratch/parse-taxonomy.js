const fs = require('fs');

const raw = fs.readFileSync('scratch/taxonomy.txt', 'utf8');
const start = raw.indexOf('--- BEGIN TAXONOMY DUMP ---') + '--- BEGIN TAXONOMY DUMP ---'.length;
const end = raw.indexOf('--- END TAXONOMY DUMP ---');
const data = JSON.parse(raw.substring(start, end).trim());

fs.writeFileSync('scratch/taxonomy-parsed.json', JSON.stringify(data, null, 2));

console.log('Total Categories:', data.categoriesTaxonomy.length);
console.log('Total Owned Products:', data.productsCount);
console.log('Total Owned Listings:', data.listingsCount);

// Find categories with subcategories
const withSubs = data.categoriesTaxonomy.filter(c => Array.isArray(c.subcategories) && c.subcategories.length > 0);
console.log('\nCategories with subcategories array:', withSubs.length);
withSubs.forEach(c => {
  console.log(`[${c.id}] "${c.name}": ${c.subcategories.length} subcategories`);
  console.log('  Sample subcat:', c.subcategories[0]);
});

// Inspect all 15 existing Products
console.log('\n=== ALL 15 EXISTING INVENTORY PRODUCTS ===');
data.products.forEach((p, i) => {
  console.log(`${i+1}. [${p.id}] "${p.name}"`);
  console.log(`   Cat: "${p.category}" (PCID: ${p.productCategoryId}) | SubCat: "${p.subCategoryName}" | Brand: "${p.brand}"`);
  console.log(`   Prices: Cost=${p.costPrice}, Selling=${p.sellingPrice}, Final=${p.finalPrice} | Qty: ${p.quantity}`);
  console.log(`   Images (${p.images.length}): ${p.images[0] || 'NONE'}`);
});
