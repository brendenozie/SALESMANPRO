const fs = require('fs');
const content = fs.readFileSync('lib/website-builder/editable-adapters.ts', 'utf8');
const match = content.match(/const aliasMap: Record<string, string> = {([\s\S]*?)};/);
if (match) {
  const lines = match[1].split('\n');
  const seen = {};
  lines.forEach(l => {
    const m = l.match(/"([^"]+)":/);
    if (m) {
      if (seen[m[1]]) console.log('Duplicate:', m[1]);
      seen[m[1]] = true;
    }
  });
}
