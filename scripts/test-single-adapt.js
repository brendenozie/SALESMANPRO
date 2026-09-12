const fs = require('fs');

const content = fs.readFileSync('components/site/layouts/EcommerceAccessoriesLayout/body/EcommerceAccessoriesSite.tsx', 'utf8');
const returnMatch = content.match(/return\s*\(\s*<div([^>]*)>([\s\S]*?)<\/div>\s*\);\s*\}/);
console.log('Matched return:', !!returnMatch);
if (returnMatch) {
  const innerJsx = returnMatch[2];
  const regex = /data-editor-section=["']([^"']+)["']/g;
  let matches = [];
  let m;
  while ((m = regex.exec(innerJsx)) !== null) {
    matches.push(m[1]);
  }
  console.log('Sections matched:', matches.length, matches);
}
