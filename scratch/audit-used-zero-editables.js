const fs = require('fs');
const path = require('path');

const layoutsDir = path.resolve('components', 'site', 'layouts');

const usedZeroComps = [];

for (const theme of fs.readdirSync(layoutsDir)) {
  if (theme === 'EcommerceShoesLayout') continue;
  const themeDir = path.join(layoutsDir, theme);
  const compsDir = path.join(themeDir, 'body', 'components');
  if (!fs.existsSync(compsDir)) continue;

  const allThemeFiles = [];
  function walk(d) {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) walk(p);
      else if (f.name.endsWith('.tsx')) allThemeFiles.push(p);
    }
  }
  walk(themeDir);

  for (const comp of fs.readdirSync(compsDir)) {
    const compIndex = path.join(compsDir, comp, 'index.tsx');
    if (!fs.existsSync(compIndex)) continue;
    const content = fs.readFileSync(compIndex, 'utf8');
    if (!content.includes('EditableElement')) {
      // Check if used elsewhere in this theme
      let isUsed = false;
      for (const f of allThemeFiles) {
        if (f === compIndex) continue;
        const code = fs.readFileSync(f, 'utf8');
        if (code.includes(comp)) {
          isUsed = true;
          break;
        }
      }
      if (isUsed) {
        usedZeroComps.push({ theme, comp, file: compIndex });
      }
    }
  }
}

console.log('Actively used components with 0 EditableElement:', usedZeroComps.length);
const byComp = {};
for (const u of usedZeroComps) {
  byComp[u.comp] = (byComp[u.comp] || 0) + 1;
}
console.table(byComp);
console.log(usedZeroComps.map(u => `${u.theme}/${u.comp}`));
