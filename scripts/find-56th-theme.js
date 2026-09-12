const fs = require('fs');
const path = require('path');

const layoutsDir = path.resolve('components/site/layouts');
const layouts = fs.readdirSync(layoutsDir).filter(f => fs.statSync(path.join(layoutsDir, f)).isDirectory());
const registryContent = fs.readFileSync('lib/website-builder/template-registry.ts', 'utf8');

const missing = layouts.filter(l => !registryContent.includes(l));
console.log('Layouts in components/site/layouts:', layouts.length);
console.log('Layouts not mentioned anywhere in template-registry.ts:', missing);

// Check BodyComponentMap
const bodyMapContent = fs.readFileSync('components/site/BodyComponentMap.tsx', 'utf8');
const missingFromBody = layouts.filter(l => !bodyMapContent.includes(l));
console.log('Layouts not mentioned in BodyComponentMap.tsx:', missingFromBody);

// Check what files are inside each missing directory
missing.forEach(l => {
  const dirPath = path.join(layoutsDir, l);
  console.log(`Contents of ${l}:`, fs.readdirSync(dirPath));
  const bodyPath = path.join(dirPath, 'body');
  if (fs.existsSync(bodyPath)) {
    console.log(`Contents of ${l}/body:`, fs.readdirSync(bodyPath));
  }
});
