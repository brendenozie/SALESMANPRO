const fs = require('fs');
const path = require('path');

const layoutsDir = path.resolve('components', 'site', 'layouts');
const allTsx = [];

function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.tsx') || f.name.endsWith('.ts')) allTsx.push(p);
  }
}
walk(layoutsDir);

const badUseClient = [];

for (const file of allTsx) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const ucIdx = lines.findIndex(l => {
    const t = l.trim();
    return t === '"use client";' || t === "'use client';" || t === '"use client"' || t === "'use client'";
  });
  if (ucIdx > 0) {
    let hasCodeBefore = false;
    for (let i = 0; i < ucIdx; i++) {
      const trimmed = lines[i].trim();
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
        hasCodeBefore = true;
        break;
      }
    }
    if (hasCodeBefore) {
      badUseClient.push({ file, rel: path.relative(process.cwd(), file), line: ucIdx + 1 });
    }
  }
}

console.log('Files with bad use client position:', badUseClient.length);
badUseClient.forEach(b => console.log(b.rel, 'line:', b.line));

// Auto-fix bad use client positions
for (const item of badUseClient) {
  let content = fs.readFileSync(item.file, 'utf8');
  const lines = content.split('\n');
  const ucLine = lines[item.line - 1]; // e.g. 'use client';
  lines.splice(item.line - 1, 1);
  // Put at the very beginning
  lines.unshift(ucLine.trim());
  fs.writeFileSync(item.file, lines.join('\n'), 'utf8');
  console.log('Fixed', item.rel);
}
