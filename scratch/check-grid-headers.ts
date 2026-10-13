import fs from 'fs';

interface Profile {
  layout: string;
  componentName: string;
  category: string;
  filePath: string;
  currentEditabilityStatus: string;
  existingTargetIds: string[];
}

const audit: Profile[] = JSON.parse(fs.readFileSync('scratch/comprehensive-component-audit.json', 'utf8'));

const prodAndCat = audit.filter((c) => c.category === 'product_grid' || c.category === 'category_browser');

let hasHeaderEditable = 0;
let missingHeaderEditable = 0;
const missingList: Array<{ layout: string; comp: string; file: string; cat: string }> = [];

prodAndCat.forEach((c) => {
  const code = fs.readFileSync(c.filePath, 'utf8');
  // Check if title or badge is wrapped in EditableElement
  const hasTitleTarget = /targetId=\{?["'`][^"'`]*(?:title|headline|heading|badge|eyebrow)[^"'`]*["'`]/i.test(code);
  if (hasTitleTarget) {
    hasHeaderEditable++;
  } else {
    missingHeaderEditable++;
    missingList.push({ layout: c.layout, comp: c.componentName, file: c.filePath, cat: c.category });
  }
});

console.log(`Total Product Grids & Category Browsers: ${prodAndCat.length}`);
console.log(`With Editable Header: ${hasHeaderEditable}`);
console.log(`Missing Editable Header: ${missingHeaderEditable}`);

console.log('\n--- SAMPLE MISSING HEADER (first 10) ---');
missingList.slice(0, 10).forEach((m, idx) => {
  console.log(`${idx + 1}. [${m.layout}] ${m.comp} (${m.cat}) -> ${m.file}`);
});
