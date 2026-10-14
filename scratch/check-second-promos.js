const fs = require('fs');
const path = require('path');

const layoutsDir = path.resolve('components', 'site', 'layouts');
const allTsx = [];

function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.tsx')) allTsx.push(p);
  }
}
walk(layoutsDir);

const secondPromoFiles = allTsx.filter(f => f.includes('SecondPromoSection'));

for (const file of secondPromoFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('Diagnostics') && content.includes('home.secondPromo.description')) {
    console.log('Found Diagnostics collision in:', file);
  }
}
