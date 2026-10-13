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
const childTypes = {};

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const regex = /<EditableElement[^>]*>([\s\S]*?)<\/EditableElement>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const inner = match[1].trim();
    if (inner.startsWith('{(') || inner.startsWith('{(\n') || inner.startsWith('{val') || inner.startsWith('{(val')) {
      continue;
    }
    // Check first tag
    const tagMatch = inner.match(/^<([a-zA-Z0-9_.-]+)/);
    const tag = tagMatch ? tagMatch[1] : (inner.startsWith('{') ? 'expression' : 'text');
    childTypes[tag] = (childTypes[tag] || 0) + 1;
  }
}

console.log('Child tag distribution in static EditableElements:', childTypes);
