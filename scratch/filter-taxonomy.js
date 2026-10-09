const fs = require('fs');

const raw = fs.readFileSync('scratch/canonical-taxonomy-full.json', 'utf8');
const data = JSON.parse(raw);
const taxonomy = data.categories;

console.log(`Loaded ${taxonomy.length} categories from canonical taxonomy.`);

function findCat(term) {
  const t = term.toLowerCase();
  return taxonomy.filter(c => 
    (c.name && c.name.toLowerCase().includes(t)) ||
    (c.slug && c.slug.toLowerCase().includes(t)) ||
    (c.subcategories && c.subcategories.some(s => s.name && s.name.toLowerCase().includes(t)))
  );
}

const relevantTerms = ['grocer', 'peanut', 'food', 'glass', 'eyewear', 'opt', 'game', 'gaming', 'agro', 'shoe', 'health', 'pharma', 'electr'];

const report = {};
relevantTerms.forEach(term => {
  const matches = findCat(term);
  report[term] = matches.map(m => ({
    id: m._id || m.id,
    name: m.name,
    slug: m.slug,
    subcategories: (m.subcategories || []).map(s => ({
      id: s._id || s.id,
      name: s.name,
      slug: s.slug,
      brands: s.brand || s.brands || []
    })),
    categoryBrands: m.brands || m.brand || []
  }));
});

fs.writeFileSync('scratch/relevant-taxonomy.json', JSON.stringify(report, null, 2));
console.log('Saved relevant taxonomy summary to scratch/relevant-taxonomy.json');
