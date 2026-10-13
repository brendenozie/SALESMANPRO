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
let functionChildrenCount = 0;
let staticChildrenCount = 0;
const staticExamples = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  // Match <EditableElement ...> ... </EditableElement>
  const regex = /<EditableElement[^>]*>([\s\S]*?)<\/EditableElement>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const inner = match[1].trim();
    if (inner.startsWith('{(') || inner.startsWith('{(\n') || inner.startsWith('{val') || inner.startsWith('{(val') || inner.startsWith('{(')) {
      functionChildrenCount++;
    } else {
      staticChildrenCount++;
      if (staticExamples.length < 10) {
        staticExamples.push({ file: f, snippet: match[0].slice(0, 150) });
      }
    }
  }
}

console.log('EditableElement with function children:', functionChildrenCount);
console.log('EditableElement with static children:', staticChildrenCount);
console.log('Static examples:', staticExamples);
