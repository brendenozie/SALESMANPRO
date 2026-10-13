const fs = require('fs');
const path = require('path');

const layoutsDir = path.join(__dirname, '../components/site/layouts');

function findHeroComponents(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      results = results.concat(findHeroComponents(full));
    } else if (ent.name.endsWith('.tsx') && (ent.name.includes('Hero') || ent.name.includes('Site'))) {
      results.push(full);
    }
  }
  return results;
}

const files = findHeroComponents(layoutsDir);
console.log(`Found ${files.length} candidate hero / site files.`);

const uneditable = [];
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('heroSlides') || content.includes('defaultSlides')) {
    const hasEditableElement = content.includes('EditableElement');
    const hasUseEditable = content.includes('useEditableContent');
    uneditable.push({
      file: path.relative(path.join(__dirname, '..'), f),
      hasEditableElement,
      hasUseEditable,
    });
  }
}

console.log('Hero components with heroSlides:');
console.table(uneditable);
