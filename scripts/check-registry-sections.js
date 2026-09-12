const fs = require('fs');
const content = fs.readFileSync('lib/website-builder/template-registry.ts', 'utf8');

// Match each template block
const tplRegex = /["']?([a-zA-Z0-9_-]+)["']?:\s*\{[\s\S]*?id:\s*["']([^"']+)["'],[\s\S]*?name:\s*["']([^"']+)["'],[\s\S]*?shellLayout:\s*["']([^"']+)["'],[\s\S]*?authenticSections:\s*([A-Za-z0-9_]+|\[[\s\S]*?\])/g;

let count = 0;
let withSections = 0;
let emptySections = 0;

let m;
while ((m = tplRegex.exec(content)) !== null) {
  count++;
  const secValue = m[5].trim();
  if (secValue !== '[]') {
    withSections++;
    console.log(`[${m[2]}] ${m[3]} (${m[4]}) -> ${secValue.substring(0, 30)}`);
  } else {
    emptySections++;
    console.log(`[${m[2]}] ${m[3]} (${m[4]}) -> EMPTY []`);
  }
}

console.log('---');
console.log('Total templates:', count);
console.log('With authenticSections:', withSections);
console.log('Empty authenticSections ([]):', emptySections);
