const fs = require('fs');
const path = require('path');

// 1. Parse all authentic section arrays and template definitions
const regDir = path.resolve('lib/website-builder/registry');
const regFiles = fs.readdirSync(regDir).filter(f => f.endsWith('.ts') && f !== 'aliases.ts' && f !== 'helpers.ts');

const sectionArrays = {};
for (const rf of regFiles) {
  const content = fs.readFileSync(path.join(regDir, rf), 'utf8');
  // Match `const XXX_SECTIONS: AuthenticSectionDefinition[] = [ ... ];`
  const arrayMatches = content.matchAll(/const\s+([A-Z0-9_]+_SECTIONS)\s*:\s*AuthenticSectionDefinition\[\]\s*=\s*\[([\s\S]*?)\]\s*;/g);
  for (const am of arrayMatches) {
    const varName = am[1];
    const arrayBody = am[2];
    const items = [];
    const itemMatches = arrayBody.matchAll(/\{[\s\S]*?id\s*:\s*["']([^"']+)["'][\s\S]*?name\s*:\s*["']([^"']+)["'][\s\S]*?component\s*:\s*["']([^"']+)["'][\s\S]*?type\s*:\s*["']([^"']+)["'][\s\S]*?\}/g);
    for (const im of itemMatches) {
      items.push({ id: im[1], name: im[2], component: im[3], type: im[4] });
    }
    // Also try order: id, name, type, component
    if (items.length === 0) {
      const itemMatches2 = arrayBody.matchAll(/\{[\s\S]*?id\s*:\s*["']([^"']+)["'][\s\S]*?name\s*:\s*["']([^"']+)["'][\s\S]*?type\s*:\s*["']([^"']+)["'][\s\S]*?component\s*:\s*["']([^"']+)["'][\s\S]*?\}/g);
      for (const im of itemMatches2) {
        items.push({ id: im[1], name: im[2], type: im[3], component: im[4] });
      }
    }
    sectionArrays[varName] = items;
  }
}

const templates = [];
for (const rf of regFiles) {
  const content = fs.readFileSync(path.join(regDir, rf), 'utf8');
  const tmplMatches = content.matchAll(/["']([a-z0-9\-]+@v[0-9]+)["']\s*:\s*\{([\s\S]*?)(?=\n\s*["'][a-z0-9\-]+@v[0-9]+["']\s*:|\n\};|\nexport const)/g);
  for (const tm of tmplMatches) {
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
      sections: sectionArrays[secRef] || []
    });
  }
}

// 2. Map all 56 layouts and inspect their section matching keys
const layoutsDir = path.resolve('components/site/layouts');
const allLayoutDirs = fs.readdirSync(layoutsDir).filter(d => fs.statSync(path.join(layoutsDir, d)).isDirectory());

const results = [];

for (const tmpl of templates) {
  let targetDir = tmpl.layoutFolder;
  if (!fs.existsSync(path.join(layoutsDir, targetDir))) {
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
  let recognizedKeys = [];
  let mechanism = 'unknown';

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

  if (bodyContent.includes('sectionMap')) {
    mechanism = 'sectionMap';
    // extract keys from sectionMap = { ... }
    const smMatch = bodyContent.match(/sectionMap[^{]*\{([\s\S]*?)\n\s*\};/);
    if (smMatch) {
      const kMatches = smMatch[1].matchAll(/["']([a-zA-Z0-9_\-]+)["']\s*:/g);
      for (const km of kMatches) {
        recognizedKeys.push(km[1].toLowerCase());
      }
      const unquotedMatches = smMatch[1].matchAll(/([a-zA-Z0-9_\-]+)\s*:/g);
      for (const um of unquotedMatches) {
        if (!recognizedKeys.includes(um[1].toLowerCase())) {
          recognizedKeys.push(um[1].toLowerCase());
        }
      }
    }
  } else if (bodyContent.includes('renderSection')) {
    mechanism = 'renderSection';
    // extract keys from key.includes('...') or case '...'
    const incMatches = bodyContent.matchAll(/key\.includes\(["']([^"']+)["']\)/g);
    for (const im of incMatches) {
      recognizedKeys.push(im[1].toLowerCase());
    }
    const caseMatches = bodyContent.matchAll(/case\s+["']([^"']+)["']\s*:/g);
    for (const cm of caseMatches) {
      recognizedKeys.push(cm[1].toLowerCase());
    }
  } else if (bodyContent.includes('renderSectionComponent')) {
    mechanism = 'custom-dynamic';
    const caseMatches = bodyContent.matchAll(/case\s+["']([^"']+)["']\s*:/g);
    for (const cm of caseMatches) {
      recognizedKeys.push(cm[1].toLowerCase());
    }
  }

  // Check matching for each authentic section
  const sectionMatchDetails = [];
  for (const s of tmpl.sections) {
    const sId = (s.id || '').toLowerCase();
    const sComp = (s.component || '').toLowerCase();
    const sType = (s.type || '').toLowerCase();
    const cleanId = sId.replace(/^sec-/, '');

    let matched = false;
    let matchedBy = '';

    for (const rk of recognizedKeys) {
      if (
        rk === sId ||
        rk === cleanId ||
        rk === sComp ||
        rk === sType ||
        sId.includes(rk) ||
        cleanId.includes(rk) ||
        sComp.includes(rk) ||
        rk.includes(sComp)
      ) {
        matched = true;
        matchedBy = rk;
        break;
      }
    }

    sectionMatchDetails.push({
      sectionId: s.id,
      component: s.component,
      type: s.type,
      matched,
      matchedBy
    });
  }

  const allMatched = sectionMatchDetails.every(s => s.matched);
  const matchedCount = sectionMatchDetails.filter(s => s.matched).length;

  results.push({
    canonicalId: tmpl.canonicalId,
    layoutFolder: targetDir,
    bodyComponent: tmpl.bodyComponent,
    mechanism,
    totalSections: tmpl.sections.length,
    matchedCount,
    allMatched,
    unmatched: sectionMatchDetails.filter(s => !s.matched)
  });
}

fs.writeFileSync('scripts/comprehensive_56_audit.json', JSON.stringify(results, null, 2));

console.log('Audit Summary:');
console.log('Total templates:', results.length);
console.log('Templates with 100% matched sections:', results.filter(r => r.allMatched).length);
console.log('Templates with partially matched sections:', results.filter(r => !r.allMatched && r.matchedCount > 0).length);
console.log('Templates with 0 matched sections:', results.filter(r => r.matchedCount === 0).length);

const imperfect = results.filter(r => !r.allMatched);
console.log('\nImperfect templates details:');
for (const imp of imperfect) {
  console.log(`- ${imp.canonicalId} (${imp.layoutFolder}): ${imp.matchedCount}/${imp.totalSections} matched. Unmatched:`, imp.unmatched.map(u => `${u.sectionId} (${u.component})`));
}
