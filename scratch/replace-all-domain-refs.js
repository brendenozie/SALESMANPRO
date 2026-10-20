const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.gemini',
  'dist-worker',
  'scratch',
  '.agents'
]);

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md']);

let totalReplacements = 0;
let filesModified = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (!EXTENSIONS.has(ext)) continue;
      // Do not edit package-lock.json or massive static JSONs unless relevant
      if (entry.name === 'package-lock.json') continue;

      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('salesmanpro.store')) {
        // First replace auth.salesmanpro.store specifically, then any remaining salesmanpro.store
        const updated = content
          .replace(/auth\.salesmanpro\.site/g, 'auth.salesmanpro.store')
          .replace(/salesmanpro\.site/g, 'salesmanpro.store');

        if (updated !== content) {
          const count = (content.match(/salesmanpro\.site/g) || []).length;
          totalReplacements += count;
          filesModified++;
          fs.writeFileSync(fullPath, updated, 'utf8');
          console.log(`Updated ${path.relative(ROOT, fullPath)} (${count} matches)`);
        }
      }
    }
  }
}

walk(ROOT);
console.log(`\nDone! Modified ${filesModified} files with ${totalReplacements} domain replacements.`);
