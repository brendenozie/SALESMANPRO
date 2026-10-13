import fs from 'fs';

interface Profile {
  layout: string;
  componentName: string;
  category: string;
  filePath: string;
  currentEditabilityStatus: string;
}

const audit: Profile[] = JSON.parse(fs.readFileSync('scratch/comprehensive-component-audit.json', 'utf8'));
const fv = audit.filter((c) => c.category === 'features_values' && c.currentEditabilityStatus !== 'CANONICAL_ITEMS');

let universalCount = 0;
let customCount = 0;
const customList: Profile[] = [];

fv.forEach((c) => {
  const code = fs.readFileSync(c.filePath, 'utf8');
  if (code.includes('UniversalFeaturesSection')) {
    universalCount++;
  } else {
    customCount++;
    customList.push(c);
  }
});

console.log(`UniversalFeaturesSection wrappers: ${universalCount}`);
console.log(`Custom component implementations: ${customCount}`);
console.log('\n--- CUSTOM COMPONENT IMPLEMENTATIONS ---');
customList.forEach((c, idx) => {
  console.log(`${idx + 1}. [${c.layout}] ${c.componentName} -> ${c.filePath}`);
});
