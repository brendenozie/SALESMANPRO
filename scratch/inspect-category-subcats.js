const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/canonical-taxonomy-full.json', 'utf8')).categories;

const targetCatIds = [
  "64e3a4e2d91b1b2a5e809001", // Peanuts Store
  "64e3a5e2d91b1b2a5e80c711", // Glasses & Spectacles Store
  "54c1e2d91b1b2a5e80e50112", // Gaming Store
  "64a8c9e2d91b1b2a5e80c101", // Agrovet
  "93e002c712ad248bb0ade319", // Fashion
  "000000000000000000090001", // Healthcare & Clinics
  "e4763c9e49ba6dd252c3e893"  // Health And Beauty
];

const selected = data.filter(c => targetCatIds.includes(c.id));

selected.forEach(c => {
  console.log(`\n========================================`);
  console.log(`CATEGORY: ${c.name} (${c._id})`);
  console.log(`Slug: ${c.slug}`);
  console.log(`Subcategories (${(c.subcategories || []).length}):`);
  (c.subcategories || []).slice(0, 10).forEach(s => {
    console.log(`  - Name: "${s.name}", ID: "${s._id}", Slug: "${s.slug}", Brands: ${JSON.stringify(s.brand || s.brands || [])}`);
  });
});
