const fs = require('fs');

const raw = fs.readFileSync('scratch/stage-a.txt', 'utf8');
const start = raw.indexOf('--- BEGIN STAGE A DATA ---') + '--- BEGIN STAGE A DATA ---'.length;
const end = raw.indexOf('--- END STAGE A DATA ---');
const data = JSON.parse(raw.substring(start, end).trim());

fs.writeFileSync('scratch/stage-a-parsed.json', JSON.stringify(data, null, 2));

console.log('=== USER INFO ===');
console.log(data.user);

console.log('\n=== OWNED COMPANIES FOR brendenozie@gmail.com (' + data.ownedCompaniesCount + ') ===');
data.ownedCompanies.forEach((c, i) => {
  console.log(`${i+1}. [${c.id}] "${c.name}" | slug: "${c.slug}" | cat: "${c.category}" | active: ${c.isActive} | status: ${c.status} | prods: ${c.productsCount} | listings: ${c.listingsCount}`);
});

console.log('\n=== CANONICAL PRODUCT CATEGORIES (' + data.productCategories.length + ') ===');
data.productCategories.forEach((pc, i) => {
  console.log(`${i+1}. [${pc.id}] "${pc.name}" (slug: ${pc.slug}) - ${pc.subCategories.length} subcategories`);
  pc.subCategories.slice(0, 5).forEach(sc => console.log(`     - [${sc.id}] "${sc.name}"`));
  if (pc.subCategories.length > 5) console.log(`     ... and ${pc.subCategories.length - 5} more`);
});

console.log('\n=== STORE CATEGORIES (' + data.storeCategories.length + ') ===');
data.storeCategories.forEach((sc, i) => {
  console.log(`${i+1}. [${sc.id}] "${sc.name}" (slug: ${sc.slug})`);
});
