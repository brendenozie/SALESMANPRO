const fs = require('fs');
const path = require('path');

// 1. Parse all authentic section arrays and template definitions
const regDir = path.resolve('lib/website-builder/registry');
const regFiles = fs.readdirSync(regDir).filter(f => f.endsWith('.ts') && f !== 'aliases.ts' && f !== 'helpers.ts');

const sectionArrays = {};
for (const rf of regFiles) {
  const content = fs.readFileSync(path.join(regDir, rf), 'utf8');
  const arrayMatches = content.matchAll(/const\s+([A-Z0-9_]+_SECTIONS)\s*:\s*AuthenticSectionDefinition\[\]\s*=\s*\[([\s\S]*?)\]\s*;/g);
  for (const am of arrayMatches) {
    const varName = am[1];
    const arrayBody = am[2];
    const items = [];
    const itemMatches = arrayBody.matchAll(/\{[\s\S]*?id\s*:\s*["']([^"']+)["'][\s\S]*?name\s*:\s*["']([^"']+)["'][\s\S]*?component\s*:\s*["']([^"']+)["'][\s\S]*?type\s*:\s*["']([^"']+)["'][\s\S]*?\}/g);
    for (const im of itemMatches) {
      items.push({ id: im[1], name: im[2], component: im[3], type: im[4] });
    }
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
    let secRef = (tBody.match(/authenticSections\s*:\s*([A-Z0-9_]+_SECTIONS)/) || [])[1] || '';

    // Fix drycleaning reference
    if (tId === 'drycleaning@v1' && secRef === 'SERVICES_SECTIONS') {
      secRef = 'BARBERSHOP_BOOKINGS_SECTIONS';
    }

    templates.push({
      canonicalId: tId,
      bodyComponent: bodyComp,
      layoutFolder: shellLayout || layoutComp,
      sectionVar: secRef,
      sections: sectionArrays[secRef] || []
    });
  }
}

// 2. Map all 56 layouts
const layoutsDir = path.resolve('components/site/layouts');
const allLayoutDirs = fs.readdirSync(layoutsDir).filter(d => fs.statSync(path.join(layoutsDir, d)).isDirectory());

const results = [];

const normalizeStr = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

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
    const smMatch = bodyContent.match(/sectionMap[^{]*\{([\s\S]*?)\n\s*\};/);
    if (smMatch) {
      const kMatches = smMatch[1].matchAll(/["']([a-zA-Z0-9_\-]+)["']\s*:/g);
      for (const km of kMatches) {
        recognizedKeys.push(km[1]);
      }
      const unquotedMatches = smMatch[1].matchAll(/([a-zA-Z0-9_\-]+)\s*:/g);
      for (const um of unquotedMatches) {
        if (!recognizedKeys.includes(um[1])) {
          recognizedKeys.push(um[1]);
        }
      }
    }
  }
  // also grab renderSection and case keys
  const incMatches = bodyContent.matchAll(/key\.includes\(["']([^"']+)["']\)/g);
  for (const im of incMatches) {
    if (!recognizedKeys.includes(im[1])) recognizedKeys.push(im[1]);
  }
  const caseMatches = bodyContent.matchAll(/case\s+["']([^"']+)["']\s*:/g);
  for (const cm of caseMatches) {
    if (!recognizedKeys.includes(cm[1])) recognizedKeys.push(cm[1]);
  }

  // Also check if body has static fallback or subcomponents
  // Let's test matching using our robust normalizeStr matcher:
  const sectionMatchDetails = [];
  for (const s of tmpl.sections) {
    const normId = normalizeStr(s.id);
    const normCleanId = normalizeStr((s.id || '').replace(/^sec-/, '').replace(/^[a-z0-9]+-/, ''));
    const normComp = normalizeStr(s.component);
    const normType = normalizeStr(s.type);

    let matched = false;
    let matchedBy = '';

    for (const rawKey of recognizedKeys) {
      const normKey = normalizeStr(rawKey);
      if (!normKey) continue;

      if (
        normKey === normId ||
        normKey === normCleanId ||
        normKey === normComp ||
        normKey === normType ||
        normId.includes(normKey) ||
        normKey.includes(normId) ||
        normCleanId.includes(normKey) ||
        normKey.includes(normCleanId) ||
        normComp.includes(normKey) ||
        normKey.includes(normComp)
      ) {
        matched = true;
        matchedBy = rawKey;
        break;
      }
    }

    sectionMatchDetails.push({
      sectionId: s.id,
      component: s.component,
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
    totalSections: tmpl.sections.length,
    matchedCount,
    allMatched,
    unmatched: sectionMatchDetails.filter(s => !s.matched)
  });
}

console.log('Normalized Matcher Summary:');
console.log('Total templates:', results.length);
console.log('Templates with 100% matched sections:', results.filter(r => r.allMatched).length);
console.log('Templates with partially matched sections:', results.filter(r => !r.allMatched).length);

const remaining = results.filter(r => !r.allMatched);
for (const rem of remaining) {
  console.log(`- ${rem.canonicalId} (${rem.layoutFolder}): ${rem.matchedCount}/${rem.totalSections}. Unmatched:`, rem.unmatched.map(u => `${u.sectionId} (${u.component})`));
}
