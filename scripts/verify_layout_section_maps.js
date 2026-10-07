const fs = require('fs');
const path = require('path');

// 1. Load all registry files
const regDir = path.resolve('lib/website-builder/registry');
const regFiles = fs.readdirSync(regDir).filter(f => f.endsWith('.ts') && f !== 'aliases.ts' && f !== 'helpers.ts');

const templates = [];

for (const rf of regFiles) {
  const content = fs.readFileSync(path.join(regDir, rf), 'utf8');

  // Find all sections arrays
  // const SOMETHING_SECTIONS: AuthenticSectionDefinition[] = [ ... ];
  const secArrayRegex = /const\s+([A-Z0-9_]+_SECTIONS)\s*:\s*AuthenticSectionDefinition\[\]\s*=\s*\[([\s\S]*?)\];/g;
  const sectionsMap = {};
  let m;
  while ((m = secArrayRegex.exec(content)) !== null) {
    const varName = m[1];
    const body = m[2];
    const items = [];
    const itemRegex = /\{\s*id\s*:\s*["']([^"']+)["'],\s*name\s*:\s*["']([^"']+)["'],\s*component\s*:\s*["']([^"']+)["'],\s*type\s*:\s*["']([^"']+)["']/g;
    let im;
    while ((im = itemRegex.exec(body)) !== null) {
      items.push({ id: im[1], name: im[2], component: im[3], type: im[4] });
    }
    // Also try alternative property order: id, name, type, component
    if (items.length === 0) {
      const itemRegex2 = /\{\s*id\s*:\s*["']([^"']+)["'],\s*name\s*:\s*["']([^"']+)["'],\s*type\s*:\s*["']([^"']+)["'],\s*component\s*:\s*["']([^"']+)["']/g;
      while ((im = itemRegex2.exec(body)) !== null) {
        items.push({ id: im[1], name: im[2], type: im[3], component: im[4] });
      }
    }
    sectionsMap[varName] = items;
  }

  // Find template definitions
  const tmplRegex = /["']([a-z0-9\-]+@v[0-9]+)["']\s*:\s*\{([\s\S]*?)(?=\n\s*["'][a-z0-9\-]+@v[0-9]+["']\s*:|\n\};|\nexport const)/g;
  let tm;
  while ((tm = tmplRegex.exec(content)) !== null) {
    const tId = tm[1];
    const tBody = tm[2];

    const bodyComp = (tBody.match(/bodyComponent\s*:\s*["']([^"']+)["']/) || [])[1] || '';
    const shellLayout = (tBody.match(/shellLayout\s*:\s*["']([^"']+)["']/) || [])[1] || '';
    const layoutComp = (tBody.match(/layoutComponent\s*:\s*["']([^"']+)["']/) || [])[1] || '';
    const secRef = (tBody.match(/authenticSections\s*:\s*([A-Z0-9_]+_SECTIONS)/) || [])[1] || '';

    templates.push({
      canonicalId: tId,
      bodyComponent: bodyComp,
      layoutFolder: shellLayout || layoutComp,
      sectionVar: secRef,
      sections: sectionsMap[secRef] || []
    });
  }
}

console.log('Total templates extracted:', templates.length);

// 2. Now inspect all 56 layouts
const layoutsDir = path.resolve('components/site/layouts');
const allLayoutDirs = fs.readdirSync(layoutsDir).filter(d => fs.statSync(path.join(layoutsDir, d)).isDirectory());

const matchReport = [];

for (const tmpl of templates) {
  // Find layout directory
  let targetDir = tmpl.layoutFolder;
  if (!fs.existsSync(path.join(layoutsDir, targetDir))) {
    // search for folder
    for (const d of allLayoutDirs) {
      const b = path.join(layoutsDir, d, 'body');
      if (fs.existsSync(b)) {
        const files = fs.readdirSync(b);
        if (files.some(f => f.includes(tmpl.bodyComponent) || f.replace('.tsx', '') === tmpl.bodyComponent)) {
          targetDir = d;
          break;
        }
      }
    }
  }

  const bodyDir = path.join(layoutsDir, targetDir, 'body');
  let bodyFile = '';
  let bodyContent = '';
  let mapKeys = [];
  let mechanism = 'none';

  if (fs.existsSync(bodyDir)) {
    const files = fs.readdirSync(bodyDir).filter(f => f.endsWith('.tsx'));
    for (const f of files) {
      const fc = fs.readFileSync(path.join(bodyDir, f), 'utf8');
      if (fc.includes('ThemeSectionContainer') || fc.includes('renderSectionComponent')) {
        bodyFile = f;
        bodyContent = fc;
        break;
      }
    }
  }

  if (bodyContent.includes('ThemeSectionContainer')) {
    mechanism = 'ThemeSectionContainer';
    // extract sectionMap keys
    const smMatch = bodyContent.match(/sectionMap\s*=\s*\{\s*\{([\s\S]*?)\}\s*\}/);
    if (smMatch) {
      const keys = (smMatch[1].match(/["']?([a-zA-Z0-9_\-]+)["']?\s*:/g) || [])
        .map(k => k.replace(/[:"']/g, '').trim());
      mapKeys = keys;
    }
  } else if (bodyContent.includes('renderSectionComponent')) {
    mechanism = 'custom-dynamic';
    const cases = (bodyContent.match(/case\s+["']([^"']+)["']\s*:/g) || [])
      .map(k => k.replace(/case\s+["']|["']\s*:/g, '').trim());
    mapKeys = cases;
  }

  matchReport.push({
    canonicalId: tmpl.canonicalId,
    layoutFolder: targetDir,
    bodyComponent: tmpl.bodyComponent,
    mechanism,
    authenticSectionsCount: tmpl.sections.length,
    sectionMapKeysCount: mapKeys.length,
    sections: tmpl.sections.map(s => s.id),
    mapKeys
  });
}

fs.writeFileSync('scripts/layout_match_report.json', JSON.stringify(matchReport, null, 2));
console.log('Report written to scripts/layout_match_report.json');
console.log('Sample result (first 5):', matchReport.slice(0, 5));
