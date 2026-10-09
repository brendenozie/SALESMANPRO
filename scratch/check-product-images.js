const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/taxonomy-parsed.json', 'utf8'));

console.log('=== IMAGES IN ALL 15 INVENTORY PRODUCTS ===');
data.products.forEach((p, idx) => {
  console.log(`${idx + 1}. [${p.id}] "${p.name}" (${p.images.length} images)`);
  p.images.forEach(img => {
    const url = typeof img === 'string' ? img : (img.url || JSON.stringify(img));
    console.log(`     URL: ${url}`);
  });
  if (p.images.length === 0) console.log('     NO IMAGES IN PRODUCT');
});
