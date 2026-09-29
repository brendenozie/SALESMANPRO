// scratch/check-menu-whatsapp.js
const fs = require('fs');
const content = fs.readFileSync('constant/CATEGORY_MENUS.ts', 'utf8');
const lines = content.split('\n');

console.log('=== Checking WhatsApp in CATEGORY_MENUS.ts ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].toLowerCase().includes('whatsapp')) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
    for (let j = 1; j <= 4; j++) {
      if (lines[i + j]) console.log(`  +${j}: ${lines[i + j].trim()}`);
    }
  }
}
