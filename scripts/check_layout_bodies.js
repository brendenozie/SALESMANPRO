const fs = require('fs');
const path = require('path');

const layoutsDir = path.resolve('components/site/layouts');
const dirs = fs.readdirSync(layoutsDir).filter(f => fs.statSync(path.join(layoutsDir, f)).isDirectory());

const inventory = [];

for (const dir of dirs) {
  const bodyDir = path.join(layoutsDir, dir, 'body');
  if (!fs.existsSync(bodyDir)) continue;
  const files = fs.readdirSync(bodyDir).filter(f => f.endsWith('.tsx'));
  let mainFile = '';
  let content = '';

  for (const f of files) {
    const c = fs.readFileSync(path.join(bodyDir, f), 'utf8');
    if (c.includes('ThemeSectionContainer') || c.includes('activeSections') || c.includes('renderSectionComponent') || f.includes('Site')) {
      mainFile = f;
      content = c;
      break;
    }
  }

  const hasContainer = content.includes('ThemeSectionContainer');
  const hasRenderSection = content.includes('renderSection');
  const hasSectionMap = content.includes('sectionMap');
  const hasActiveSections = content.includes('activeSections');
  const hasPageDataSections = content.includes('pageData') && (content.includes('sections') || content.includes('rawSections'));

  inventory.push({
    layoutDir: dir,
    mainFile,
    hasContainer,
    hasRenderSection,
    hasSectionMap,
    hasActiveSections,
    hasPageDataSections,
  });
}

console.log(JSON.stringify(inventory, null, 2));
console.log('Total layout bodies inspected:', inventory.length);
console.log('Using ThemeSectionContainer:', inventory.filter(i => i.hasContainer).length);
console.log('Using sectionMap:', inventory.filter(i => i.hasSectionMap).length);
console.log('Using renderSection:', inventory.filter(i => i.hasRenderSection).length);
console.log('Using activeSections directly:', inventory.filter(i => i.hasActiveSections && !i.hasContainer).length);
