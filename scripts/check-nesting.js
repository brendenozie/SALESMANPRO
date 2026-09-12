const fs = require('fs');

const content = fs.readFileSync('components/site/layouts/EcommerceAccessoriesLayout/body/EcommerceAccessoriesSite.tsx', 'utf8');

// Let's count how many data-editor-section tags exist
const sections = [];
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/data-editor-section=["']([^"']+)["']/);
  if (m) {
    sections.push({ sec: m[1], line: i + 1 });
  }
}
console.log('Found sections:', sections);
