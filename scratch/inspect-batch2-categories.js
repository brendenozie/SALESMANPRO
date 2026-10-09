const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/canonical-taxonomy-full.json', 'utf8')).categories;

const targetCatNames = [
  "Honey Store",
  "Baby Store",
  "Earphones Store",
  "Hardware Store",
  "Pets Store",
  "Watch Store",
  "Bike Store"
];

const selected = data.filter(c => targetCatNames.some(t => c.name.toLowerCase().includes(t.toLowerCase())));

selected.forEach(c => {
  console.log(`\n========================================`);
  console.log(`CATEGORY: ${c.name} (ID: ${c.id})`);
  console.log(`Slug: ${c.slug}`);
  console.log(`Subcategories (${(c.subcategories || []).length}):`);
  (c.subcategories || []).slice(0, 10).forEach(s => {
    console.log(`  - Name: "${s.name}", ID: "${s.id}", Slug: "${s.slug}", Brands: ${JSON.stringify(s.brand || s.brands || [])}`);
  });
});
