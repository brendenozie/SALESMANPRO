// scratch/check-menu-agents.js
const fs = require('fs');
const content = fs.readFileSync('constant/CATEGORY_MENUS.ts', 'utf8');
const lines = content.split('\n');

console.log('=== Checking Sales Agents in CATEGORY_MENUS.ts ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Sales Agents') || lines[i].includes('/agents`')) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
    for (let j = 1; j <= 3; j++) {
      if (lines[i + j]) console.log(`  +${j}: ${lines[i + j].trim()}`);
    }
  }
}
