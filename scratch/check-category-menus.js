// scratch/check-category-menus.js
const { getCategoryMenus } = require('../constant/CATEGORY_MENUS');

const menus = getCategoryMenus('test-store', 'ADMIN', 'Ghuba Basic', true);
const categories = Object.keys(menus);

console.log('Supported Categories in CATEGORY_MENUS (' + categories.length + '):');
console.log(categories.join(', '));

// Let's sample a few categories and see what is locked for Basic vs Pro
const basicMenus = getCategoryMenus('test-store', 'ADMIN', 'Ghuba Basic', true);
const proMenus = getCategoryMenus('test-store', 'ADMIN', 'Ghuba Pro', true);

function countLocked(menuList) {
  let total = 0;
  let locked = 0;
  for (const item of menuList || []) {
    total++;
    if (item.isLocked) locked++;
    for (const sub of item.subItems || []) {
      total++;
      if (sub.isLocked) locked++;
    }
  }
  return { total, locked };
}

console.log('\nSample Menu Lock Counts (Basic vs Pro):');
for (const cat of ['E-commerce', 'Marketplace', 'Educational & Online Courses', 'Delivery & Logistics', 'Marketing & Engagement']) {
  if (menus[cat]) {
    const b = countLocked(basicMenus[cat]);
    const p = countLocked(proMenus[cat]);
    console.log(`- ${cat}: Basic has ${b.locked}/${b.total} locked; Pro has ${p.locked}/${p.total} locked`);
  }
}

// Let's also check specifically for AI Studio & Social Media AI items in Basic vs Starter vs Pro
const starterMenus = getCategoryMenus('test-store', 'ADMIN', 'Ghuba Starter', true);
console.log('\nAI Studio & Social Media AI inspection for E-commerce:');
const bEcom = basicMenus['E-commerce'] || [];
const sEcom = starterMenus['E-commerce'] || [];
const pEcom = proMenus['E-commerce'] || [];

function findItems(list, names) {
  const found = [];
  for (const item of list) {
    if (names.some(n => item.label && item.label.includes(n))) {
      found.push({ label: item.label, isLocked: item.isLocked, requiredTier: item.requiredTier });
    }
    for (const sub of item.subItems || []) {
      if (names.some(n => sub.label && sub.label.includes(n))) {
        found.push({ label: `${item.label} > ${sub.label}`, isLocked: sub.isLocked, requiredTier: sub.requiredTier });
      }
    }
  }
  return found;
}

const targets = ['AI Studio', 'Social Media', 'Video Generation', 'Marketplace'];
console.log('Basic:', findItems(bEcom, targets));
console.log('Starter:', findItems(sEcom, targets));
console.log('Pro:', findItems(pEcom, targets));

console.log('\nSchool Head & Head Teacher inspection:');
const bSchoolHead = getCategoryMenus('test-store', 'School Head', 'Ghuba Basic', true)['School Head'] || [];
const sSchoolHead = getCategoryMenus('test-store', 'School Head', 'Ghuba Starter', true)['School Head'] || [];
const pSchoolHead = getCategoryMenus('test-store', 'School Head', 'Ghuba Pro', true)['School Head'] || [];

const schoolTargets = ['School AI Studio', 'WhatsApp Engine'];
console.log('School Head (Basic):', findItems(bSchoolHead, schoolTargets));
console.log('School Head (Starter):', findItems(sSchoolHead, schoolTargets));
console.log('School Head (Pro):', findItems(pSchoolHead, schoolTargets));


