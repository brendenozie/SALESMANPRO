const fs = require('fs');
const path = require('path');

const dirs = [path.resolve('components'), path.resolve('app')];
const allTsx = [];

function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) {
      if (f.name !== 'node_modules' && f.name !== '.next') walk(p);
    } else if (f.name.endsWith('.tsx') || f.name.endsWith('.ts')) {
      allTsx.push(p);
    }
  }
}
dirs.forEach(walk);

let misplacedCount = 0;

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
      misplacedCount++;
      console.log('Misplaced use client:', path.relative(process.cwd(), file), 'at line', ucIdx + 1);
      // Auto-fix
      const ucLine = lines[ucIdx];
      lines.splice(ucIdx, 1);
      lines.unshift(ucLine.trim());
      fs.writeFileSync(file, lines.join('\n'), 'utf8');
      console.log('Fixed:', path.relative(process.cwd(), file));
    }
  }
}

console.log('Total misplaced use client directives found/fixed:', misplacedCount);
