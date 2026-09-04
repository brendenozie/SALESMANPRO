const fs = require('fs');
const path = require('path');

const dirs = ['app', 'lib', 'components'];
const results = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        scanDir(fullPath);
      }
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Match .split( that is NOT preceded by ?.
        const match = line.match(/(?<!\?)\.split\(/);
        if (match) {
          // Check what precedes .split(
          const idx = line.indexOf('.split(');
          const sub = line.substring(Math.max(0, idx - 40), idx);
          results.push({ file: fullPath, line: i + 1, snippet: line.trim() });
        }
      }
    }
  }
}

for (const d of dirs) {
  if (fs.existsSync(d)) scanDir(d);
}

console.log(`Found ${results.length} occurrences of unchecked .split()`);
fs.writeFileSync('scratch/unchecked-splits.json', JSON.stringify(results, null, 2));
