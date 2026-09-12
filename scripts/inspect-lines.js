const fs = require('fs');

const content = fs.readFileSync('components/site/layouts/EcommerceAccessoriesLayout/body/EcommerceAccessoriesSite.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('data-editor-section=')) {
    console.log(`Line ${idx + 1}: ${l.trim()}`);
  }
});
