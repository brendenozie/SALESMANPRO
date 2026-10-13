const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(full);
    }
  }
  return results;
}

const files = walk('components/site/layouts');
const targetIds = new Set();
const patternCounts = {};
const templateExpressions = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.matchAll(/targetId=["']([^"']+)["']/g);
  for (const m of matches) {
    const id = m[1];
    targetIds.add(id);
    const parts = id.split('.');
    const len = parts.length;
    patternCounts[len] = (patternCounts[len] || 0) + 1;
  }
  const dynamicMatches = content.matchAll(/targetId=\{`([^`]+)`\}/g);
  for (const m of dynamicMatches) {
    templateExpressions.push(m[1]);
  }
}

console.log('Total static targetIds:', targetIds.size);
console.log('Target ID lengths breakdown:', patternCounts);

const sampleByLen = {};
for (const id of targetIds) {
  const len = id.split('.').length;
  if (!sampleByLen[len]) sampleByLen[len] = [];
  if (sampleByLen[len].length < 5) sampleByLen[len].push(id);
}
console.log('Samples by length:', JSON.stringify(sampleByLen, null, 2));
console.log('Sample dynamic template expressions:', templateExpressions.slice(0, 10));
