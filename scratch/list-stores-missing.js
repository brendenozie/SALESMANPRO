const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/image-inventory-clean.json', 'utf8'));
const breakdown = data.storeBreakdown;

console.log("=== STORES AND THEIR MISSING IMAGES ===");
breakdown.forEach((s, idx) => {
  console.log(`${(idx + 1).toString().padStart(2)}. [${s.id}] ${s.name.padEnd(35)} | prods=${s.totalProducts} | missing=${s.productsWithoutImages} | cat=${s.category}`);
});
