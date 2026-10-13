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

console.log('--- FIRST 10 ITEMS ---');
fv.slice(0, 10).forEach((c, idx) => {
  console.log(`${idx + 1}. [${c.layout}] ${c.componentName} (${c.currentEditabilityStatus}) -> ${c.filePath}`);
});
