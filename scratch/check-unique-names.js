const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/unimaged-products.json', 'utf8'));

const nameMap = {};
data.unimagedProducts.forEach(p => {
  const key = p.name;
  if (!nameMap[key]) {
    nameMap[key] = {
      count: 0,
      stores: new Set(),
      categories: new Set(),
      storeCategories: new Set(),
      subCategories: new Set()
    };
  }
  nameMap[key].count++;
  nameMap[key].stores.add(p.storeName);
  nameMap[key].categories.add(p.category);
  nameMap[key].storeCategories.add(p.storeCategory);
  if (p.subCategory) {
    nameMap[key].subCategories.add(typeof p.subCategory === 'object' ? JSON.stringify(p.subCategory) : p.subCategory);
  }
});

console.log(`Total unique product names: ${Object.keys(nameMap).length}`);
const sorted = Object.entries(nameMap).sort((a, b) => b[1].count - a[1].count);

sorted.forEach(([name, info]) => {
  console.log(`${info.count.toString().padStart(3, ' ')}x: "${name}" | Stores: [${Array.from(info.stores).slice(0, 3).join(', ')}${info.stores.size > 3 ? '...' : ''}] | StoreCat: [${Array.from(info.storeCategories).join(', ')}]`);
});
