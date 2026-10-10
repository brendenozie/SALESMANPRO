const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        results = results.concat(walk(full));
      }
    } else if (file.endsWith('.tsx')) {
      results.push(full);
    }
  }
  return results;
}

const allTsx = walk('components/site/layouts');
let fixedCount = 0;

for (const filePath of allTsx) {
  const content = fs.readFileSync(filePath, 'utf8');
  const hasReact = /import\s+.*from\s+['"]react['"]/.test(content) || /import\s+React\b/.test(content);
  if (!hasReact) {
    // Check if file uses JSX tags
    const usesJsx = /<[A-Za-z][A-Za-z0-9]*[\s/>]/.test(content) || /<>[^<]*<\/>/.test(content);
    if (usesJsx) {
      let newContent;
      if (content.startsWith("'use client';") || content.startsWith('"use client";')) {
        const clientDirective = content.match(/^['"]use client['"];?\r?\n/)[0];
        newContent = clientDirective + "\nimport React from 'react';\n" + content.slice(clientDirective.length);
      } else {
        newContent = "import React from 'react';\n" + content;
      }
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Added React import to:', filePath);
      fixedCount++;
    }
  }
}

console.log('Total files updated with React import:', fixedCount);
