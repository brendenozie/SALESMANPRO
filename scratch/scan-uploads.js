const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir);
  let res = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const s = fs.statSync(full);
    if (s.isDirectory()) {
      if (f !== 'node_modules' && f !== '.next') {
        res = res.concat(scanDir(full));
      }
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const c = fs.readFileSync(full, 'utf8');
      const matches = [];
      if (c.includes('type="file"') || c.includes("type='file'")) matches.push('file-input');
      if (c.includes('useDropzone') || c.includes('Dropzone')) matches.push('dropzone');
      if (c.includes('FileReader')) matches.push('FileReader');
      if (c.includes('cloudinary') || c.includes('Cloudinary')) matches.push('cloudinary');
      if (c.includes('/api/upload') || c.includes('/api/upload-url')) matches.push('upload-api');
      if (c.includes('FormData')) matches.push('FormData');
      if (matches.length > 0) {
        res.push({ file: full, matches });
      }
    }
  }
  return res;
}

const targets = ['components', 'app', 'actions', 'lib'];
let all = [];
targets.forEach(t => {
  all = all.concat(scanDir(t));
});

console.log(`Found ${all.length} files matching media/upload patterns.`);
const grouped = {};
all.forEach(item => {
  item.matches.forEach(m => {
    grouped[m] = (grouped[m] || 0) + 1;
  });
});
console.log('Match categories:', grouped);
fs.writeFileSync('scratch/upload-scan-results.json', JSON.stringify(all, null, 2));
console.log('Saved detailed results to scratch/upload-scan-results.json');
