const fs = require('fs');
const path = require('path');

const regDir = path.resolve('lib/website-builder/registry');
const files = fs.readdirSync(regDir);
console.log('Registry files:', files);

let allTemplates = [];
for (const f of files) {
  if (f === 'aliases.ts' || f === 'helpers.ts') continue;
  const content = fs.readFileSync(path.join(regDir, f), 'utf8');
  const regex = /["']([a-z0-9\-]+@v[0-9]+)["']\s*:\s*\{/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    allTemplates.push({ id: match[1], file: f });
  }
}

console.log('Total templates found:', allTemplates.length);
console.log(allTemplates.map(t => `${t.id} (${t.file})`).join('\n'));
