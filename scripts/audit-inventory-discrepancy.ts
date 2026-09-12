import fs from 'fs';
import path from 'path';
import { TEMPLATE_REGISTRY, getAllTemplates } from '../lib/website-builder/template-registry';
import { categoryHeaderFooterLayoutMap } from '../components/site/layouts/categoryHeaderFooterLayoutMap';

const layoutsDir = path.resolve('components/site/layouts');
const layoutDirs = fs.readdirSync(layoutsDir).filter(f => fs.statSync(path.join(layoutsDir, f)).isDirectory());

console.log('=== INVENTORY AUDIT ===');
console.log('Physical layout folders on disk:', layoutDirs.length);
console.log('TEMPLATE_REGISTRY entry count:', Object.keys(TEMPLATE_REGISTRY).length);
console.log('getAllTemplates() count:', getAllTemplates().length);

// Check BodyComponentMap file
const bodyMapContent = fs.readFileSync('components/site/BodyComponentMap.tsx', 'utf8');
const bodyMapKeys = [...bodyMapContent.matchAll(/'([A-Za-z0-9_]+)':\s*[A-Za-z0-9_]+/g)].map(m => m[1]);
console.log('BodyComponentMap mapped keys count:', bodyMapKeys.length);

console.log('\n--- Checking each physical layout folder ---');
layoutDirs.forEach((dir, idx) => {
  const dirPath = path.join(layoutsDir, dir);
  const files = fs.readdirSync(dirPath);
  const hasBody = files.includes('body');
  let bodyFiles: string[] = [];
  if (hasBody) {
    bodyFiles = fs.readdirSync(path.join(dirPath, 'body')).filter(f => f.endsWith('.tsx'));
  }
  
  // Is this layout in categoryHeaderFooterLayoutMap?
  const inShellMap = Boolean(categoryHeaderFooterLayoutMap[dir]);
  
  // Is this layout used by any template in TEMPLATE_REGISTRY?
  const templatesUsingShell = Object.values(TEMPLATE_REGISTRY).filter(t => t.shellLayout === dir);
  
  // Is the body file used in TEMPLATE_REGISTRY?
  const templatesUsingBody = Object.values(TEMPLATE_REGISTRY).filter(t => bodyFiles.some(bf => bf.replace('.tsx', '') === t.bodyComponent));

  console.log(`${(idx + 1).toString().padStart(2, ' ')}. ${dir.padEnd(28, ' ')} | ShellMap: ${inShellMap ? 'YES' : 'NO '} | Body: ${bodyFiles.join(', ') || 'NONE'.padEnd(22, ' ')} | TplShell: ${templatesUsingShell.map(t => t.id).join(',') || 'NONE'} | TplBody: ${templatesUsingBody.map(t => t.id).join(',') || 'NONE'}`);
});
