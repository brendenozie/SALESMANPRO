const fs = require('fs');
const path = require('path');

const layoutsDir = path.resolve('components/site/layouts');
const dirs = fs.readdirSync(layoutsDir).filter(f => fs.statSync(path.join(layoutsDir, f)).isDirectory());

const results = [];

for (const dir of dirs) {
  const bodyDir = path.join(layoutsDir, dir, 'body');
  if (!fs.existsSync(bodyDir)) continue;
  const files = fs.readdirSync(bodyDir).filter(f => f.endsWith('.tsx'));
  for (const f of files) {
    const content = fs.readFileSync(path.join(bodyDir, f), 'utf8');
    if (content.includes('sectionMap')) {
      const match = content.match(/sectionMap\s*=\s*\{\s*\{([\s\S]*?)\}\s*\}/);
      if (match) {
        const keys = (match[1].match(/["']?([a-zA-Z0-9_\-]+)["']?\s*:/g) || [])
          .map(k => k.replace(/[:"']/g, '').trim());
        results.push({ layout: dir, file: f, keys });
      }
    }
  }
}

console.log(JSON.stringify(results, null, 2));
