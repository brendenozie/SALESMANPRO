const fs = require('fs');
const path = require('path');

// 1. Load exported data and taxonomy
const exportData = JSON.parse(fs.readFileSync('scratch/targeted_catalog_export_2026-10-15.json', 'utf8'));
const taxonomyData = JSON.parse(fs.readFileSync('scratch/canonical-taxonomy-full.json', 'utf8'));

// Build category map
const catMap = new Map();
for (const cat of taxonomyData.categories) {
  catMap.set(cat.slug, cat);
  catMap.set(cat.name.toLowerCase(), cat);
  catMap.set(cat.id, cat);
}

function resolveTaxonomy(catKey, subcatName) {
  const cat = catMap.get(catKey) || catMap.get(catKey.toLowerCase());
  if (!cat) {
    throw new Error(`Category key not found in taxonomy: ${catKey}`);
  }

  let subcat = null;
  if (cat.subcategories && cat.subcategories.length > 0) {
    if (subcatName) {
      subcat = cat.subcategories.find(s => 
        s.name.toLowerCase().includes(subcatName.toLowerCase()) ||
        s.slug.toLowerCase().includes(subcatName.toLowerCase())
      );
    }
    if (!subcat) {
      subcat = cat.subcategories[0];
    }
  }

  return {
    productCategoryId: cat.id,
    categoryName: cat.name,
    subCategoryName: subcat ? subcat.name : cat.name,
    subCategory: subcat || {
      _id: cat.id,
      name: cat.name,
      slug: cat.slug,
      status: "Active"
    }
  };
}

console.log('Taxonomy resolver initialized.');
