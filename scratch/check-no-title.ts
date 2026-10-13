import fs from 'fs';

const results: any[] = JSON.parse(fs.readFileSync('scratch/missing-grid-headers.json', 'utf8'));
const withoutTitle = results.filter((r) => !r.hasTitle);
console.log(`Components without detected title: ${withoutTitle.length}`);
withoutTitle.forEach((r) => {
  console.log(`- [${r.layout}] ${r.comp} -> ${r.file}`);
});
