const fs = require('fs');
const content = fs.readFileSync('lib/website-builder/template-registry.ts', 'utf8');
const constNames = [
  'FITNESS_SECTIONS',
  'HEALTHCARE_SECTIONS',
  'BLOG_SECTIONS',
  'MEDIA_SECTIONS',
  'NONPROFIT_SECTIONS',
  'EVENTS_SECTIONS',
  'DIRECTORY_SECTIONS',
  'FINANCE_SECTIONS',
  'TRAVEL_SECTIONS',
  'GHUBA_SECTIONS',
];

constNames.forEach(cName => {
  const start = content.indexOf(`export const ${cName}`);
  const altStart = content.indexOf(`const ${cName}`);
  const idx = start !== -1 ? start : altStart;
  if (idx !== -1) {
    const block = content.slice(idx, idx + 2500);
    const end = block.indexOf('];');
    const fullBlock = block.slice(0, end + 2);
    const ids = [...fullBlock.matchAll(/id:\s*["']([^"']+)["']/g)].map(m => m[1]);
    const comps = [...fullBlock.matchAll(/component:\s*["']([^"']+)["']/g)].map(m => m[1]);
    console.log(`=== ${cName} ===`);
    console.log('IDs:', ids);
    console.log('Components:', comps);
  } else {
    console.log(`NOT FOUND: ${cName}`);
  }
});
