const fs = require('fs');
const path = require('path');

const layoutsDir = path.resolve('components', 'site', 'layouts');
const files = [];

function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      walk(full);
    } else if (item.name === 'index.tsx' && full.includes(path.sep + 'body' + path.sep + 'components' + path.sep)) {
      files.push(full);
    }
  }
}
walk(layoutsDir);

const byComponentName = {};
const zeroFiles = [];

for (const file of files) {
  if (file.includes('EcommerceShoesLayout')) continue;
  const content = fs.readFileSync(file, 'utf8');
  const hasEditable = content.includes('EditableElement');
  if (!hasEditable) {
    const rel = path.relative(layoutsDir, file);
    // e.g. "Automotive2Layout\body\components\AppPromoSection\index.tsx"
    const parts = rel.split(path.sep);
    const layout = parts[0];
    const compName = parts[3]; // AppPromoSection
    if (!byComponentName[compName]) byComponentName[compName] = [];
    byComponentName[compName].push(layout);
    zeroFiles.push({ layout, compName, file });
  }
}

console.log('Total zero-editable body components:', zeroFiles.length);
const sortedGroups = Object.entries(byComponentName).sort((a, b) => b[1].length - a[1].length);
for (const [comp, layouts] of sortedGroups) {
  console.log(`${comp} (${layouts.length} themes): ${layouts.slice(0, 5).join(', ')}${layouts.length > 5 ? '...' : ''}`);
}
