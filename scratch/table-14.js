const fs = require('fs');

const items = JSON.parse(fs.readFileSync('c:\\Users\\Brenden\\Desktop\\SalesForce\\SalesMan\\scratch\\14-live-details.json', 'utf8'));

console.log(`${'Idx'.padEnd(3)} | ${'Name'.padEnd(35)} | ${'Store'.padEnd(24)} | ${'Category / Subcategory'.padEnd(38)} | ${'Sell Price'.padEnd(12)} | ${'Imgs'.padEnd(5)} | ${'Stock'.padEnd(6)}`);
console.log("-".repeat(130));

items.forEach((item, idx) => {
  const name = item.name.substring(0, 35).padEnd(35);
  const store = item.store.name.substring(0, 24).padEnd(24);
  const cat = `${item.category.name || 'N/A'} / ${item.category.subCategory || 'N/A'}`.substring(0, 38).padEnd(38);
  const price = `KES ${item.pricing.sellingPrice !== undefined ? item.pricing.sellingPrice : (item.pricing.finalPrice || 'N/A')}`.padEnd(12);
  const imgs = String(item.imagery.count).padEnd(5);
  const stock = String(item.inventory.listingStock || item.inventory.productStock || 'N/A').padEnd(6);
  console.log(`${String(idx + 1).padEnd(3)} | ${name} | ${store} | ${cat} | ${price} | ${imgs} | ${stock}`);
});
