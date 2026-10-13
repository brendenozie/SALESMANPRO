import fs from 'fs';
import path from 'path';

interface Profile {
  layout: string;
  componentName: string;
  category: string;
  filePath: string;
}

const audit: Profile[] = JSON.parse(fs.readFileSync('scratch/comprehensive-component-audit.json', 'utf8'));
const prodAndCat = audit.filter((c) => c.category === 'product_grid' || c.category === 'category_browser');

let hasHeader = 0;
let missingHeader = 0;
const missingDirs: Array<{ layout: string; comp: string; dir: string; cat: string }> = [];

prodAndCat.forEach((c) => {
  const dir = path.dirname(c.filePath);
  // Search all tsx files in that directory
  let found = false;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.tsx'));
  for (const f of files) {
    const code = fs.readFileSync(path.join(dir, f), 'utf8');
    if (/targetId=\{?["'`][^"'`]*(?:title|headline|heading|badge|eyebrow)[^"'`]*["'`]/i.test(code)) {
      found = true;
      break;
    }
  }

  if (found) {
    hasHeader++;
  } else {
    missingHeader++;
    missingDirs.push({ layout: c.layout, comp: c.componentName, dir, cat: c.category });
  }
});

console.log(`Product Grids & Category Browsers: ${prodAndCat.length}`);
console.log(`With Editable Header in component directory: ${hasHeader}`);
console.log(`Missing Editable Header: ${missingHeader}`);
console.log('\n--- FIRST 20 MISSING DIRECTORIES ---');
missingDirs.slice(0, 20).forEach((m, idx) => {
  console.log(`${idx + 1}. [${m.layout}] ${m.comp} (${m.cat}) -> ${m.dir}`);
});
