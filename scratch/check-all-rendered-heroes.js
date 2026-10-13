const fs = require('fs');
const path = require('path');

const layoutsDir = 'components/site/layouts';
const allLayouts = fs.readdirSync(layoutsDir).filter(f => fs.statSync(path.join(layoutsDir, f)).isDirectory());

const heroStatus = [];

allLayouts.forEach(layout => {
  const bodyDir = path.join(layoutsDir, layout, 'body');
  if (!fs.existsSync(bodyDir)) return;
  const siteFiles = fs.readdirSync(bodyDir).filter(f => f.endsWith('Site.tsx') || f.endsWith('Site2.tsx') || f.endsWith('Site3.tsx'));
  siteFiles.forEach(sf => {
    const code = fs.readFileSync(path.join(bodyDir, sf), 'utf8');
    const heroLines = code.split('\n').filter(l => l.includes('import ') && (l.includes('Hero') || l.includes('Slider') || l.includes('Banner')));
    heroLines.forEach(hl => {
      const match = hl.match(/from\s+['"](.+)['"]/);
      if (match) {
        let relPath = match[1];
        let resolved = path.resolve(bodyDir, relPath);
        if (!fs.existsSync(resolved)) {
          if (fs.existsSync(resolved + '.tsx')) resolved = resolved + '.tsx';
          else if (fs.existsSync(resolved + '/index.tsx')) resolved = resolved + '/index.tsx';
        }
        if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
          if (fs.existsSync(resolved + '/index.tsx')) resolved = resolved + '/index.tsx';
        }
        
        if (fs.existsSync(resolved) && !fs.statSync(resolved).isDirectory()) {
          const compCode = fs.readFileSync(resolved, 'utf8');
          const hasEd = compCode.includes('EditableElement');
          heroStatus.push({ layout, sf, importLine: hl.trim(), resolved, hasEd });
        }
      }
    });
  });
});

console.log('Total hero imports evaluated:', heroStatus.length);
const uneditable = heroStatus.filter(h => !h.hasEd);
console.log('Uneditable hero count:', uneditable.length);
uneditable.forEach(u => console.log(u.layout, '->', path.relative('.', u.resolved)));
