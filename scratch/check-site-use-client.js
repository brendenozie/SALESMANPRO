const fs = require('fs');
const path = require('path');

const targetDir = path.resolve('components', 'site');
const allTsx = [];

function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.tsx') || f.name.endsWith('.ts')) allTsx.push(p);
  }
}
walk(targetDir);

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

console.log('Remaining files with bad use client in components/site:', badUseClient.length);
for (const item of badUseClient) {
  console.log('Fixing:', item.rel);
  let content = fs.readFileSync(item.file, 'utf8');
  const lines = content.split('\n');
  const ucLine = lines[item.line - 1];
  lines.splice(item.line - 1, 1);
  lines.unshift(ucLine.trim());
  fs.writeFileSync(item.file, lines.join('\n'), 'utf8');
}
