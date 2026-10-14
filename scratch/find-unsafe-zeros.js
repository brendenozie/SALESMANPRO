const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('components/site/layouts');

let issues = [];
files.forEach(f => {
  // Never modify EcommerceShoesLayout
  if (f.includes('EcommerceShoesLayout')) return;

  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('import ') || line.includes('type ') || line.includes('interface ')) return;
    // Regex for .identifier[0] where it's NOT ?.[0] and NOT this. or arguments or match or process.argv
    const regex = /(?<!\?)\.([a-zA-Z0-9_]+)\[0\]/g;
    let m;
    while ((m = regex.exec(line)) !== null) {
      const prop = m[1];
      // Skip common non-nullable or standard array methods
      if (['split', 'match', 'exec', 'slice', 'entries', 'values', 'keys', 'target', 'files'].includes(prop)) {
        continue;
      }
      issues.push({ file: f, line: i + 1, prop, text: line.trim() });
    }
  });
});

console.log(`Found ${issues.length} potential unsafe .prop[0] access occurrences:`);
issues.forEach(iss => console.log(`${iss.file}:${iss.line} (.${iss.prop}[0]) -> ${iss.text}`));
