const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('git ls-files "components/site/layouts/**/*.tsx"', { encoding: 'utf8' })
  .split('\n')
  .map(f => f.trim())
  .filter(Boolean);

const missing = [];
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes('import React') && !content.includes('import * as React') && !content.includes("from 'react'") && !content.includes('from "react"')) {
    missing.push(file);
  }
}
console.log('Total files checked:', files.length);
console.log('Missing React import:', missing.length);
console.log(JSON.stringify(missing, null, 2));
