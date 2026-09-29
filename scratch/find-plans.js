const fs = require('fs');
const path = require('path');

const targetDirs = ['app', 'components', 'lib', 'contexts', 'actions', 'prisma', 'service', 'utils', 'types', 'constant', 'data'];

function searchDir(dir, pattern, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      searchDir(fullPath, pattern, results);
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx|json|prisma)$/.test(entry.name)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (pattern.test(content)) {
          results.push(fullPath);
        }
      } catch (e) {}
    }
  }
  return results;
}

for (const p of [/Ghuba Basic/i, /Ghuba Starter/i, /Ghuba Pro/i, /Ghuba Growth/i, /14999/, /15999/, /subscription-plans/]) {
  console.log(`=== Pattern: ${p} ===`);
  const found = [];
  for (const d of targetDirs) {
    searchDir(d, p, found);
  }
  console.log(found);
}
