import fs from 'fs';

interface Profile {
  layout: string;
  componentName: string;
  category: string;
  filePath: string;
  currentEditabilityStatus: string;
}

const audit: Profile[] = JSON.parse(fs.readFileSync('scratch/comprehensive-component-audit.json', 'utf8'));
const uneditableGrids = audit.filter((c) => c.category === 'product_grid' && !fs.readFileSync(c.filePath, 'utf8').includes('EditableElement'));

console.log(`Uneditable product grids: ${uneditableGrids.length}`);
uneditableGrids.forEach((c) => {
  console.log(`- [${c.layout}] ${c.componentName} -> ${c.filePath}`);
});
