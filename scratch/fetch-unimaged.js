const { execSync } = require('child_process');
const fs = require('fs');

console.log('Running extract script over SSH...');
// Read script
const scriptContent = fs.readFileSync('scratch/extract-unimaged-products.js', 'utf8');

// Write to remote /tmp/extract-unimaged-products.js
execSync(`ssh -p 2222 brenden@161.97.149.171 "cat > /tmp/extract-unimaged-products.js"`, {
  input: scriptContent
});

console.log('Executing script on VPS...');
// Execute mongosh and output to /tmp/unimaged.json
execSync(`ssh -p 2222 brenden@161.97.149.171 "mongosh salesmanprodb --quiet /tmp/extract-unimaged-products.js > /tmp/unimaged.json"`);

console.log('Fetching output from VPS...');
const result = execSync(`ssh -p 2222 brenden@161.97.149.171 "cat /tmp/unimaged.json"`, { maxBuffer: 50 * 1024 * 1024 });

fs.writeFileSync('scratch/unimaged-products.json', result);
console.log('Saved to scratch/unimaged-products.json, size:', result.length);
