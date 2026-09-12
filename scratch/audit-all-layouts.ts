import fs from 'fs';
import path from 'path';

const layoutsDir = './components/site/layouts';
const dirs = fs.readdirSync(layoutsDir).filter(d => fs.statSync(path.join(layoutsDir, d)).isDirectory());

console.log('Total layouts:', dirs.length);
const results: Array<{ layout: string; file: string; sections: string[]; components: string[] }> = [];

dirs.forEach(d => {
  const bodyDir = path.join(layoutsDir, d, 'body');
  if (fs.existsSync(bodyDir)) {
    const files = fs.readdirSync(bodyDir).filter(f => f.endsWith('.tsx'));
    files.forEach(f => {
      const content = fs.readFileSync(path.join(bodyDir, f), 'utf8');
      const editorSections = Array.from(content.matchAll(/data-editor-section=["']([^"']+)["']/g)).map(m => m[1]);
      const editorComps = Array.from(content.matchAll(/data-editor-component=["']([^"']+)["']/g)).map(m => m[1]);
      results.push({ layout: d, file: f, sections: editorSections, components: editorComps });
    });
  }
});

console.log('Found body sites:', results.length);
fs.writeFileSync('./scratch/layout-audit-results.json', JSON.stringify(results, null, 2));
console.log('Saved to scratch/layout-audit-results.json');
