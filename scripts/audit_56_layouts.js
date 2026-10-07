const fs = require('fs');
const path = require('path');

// Let's parse all templates in lib/website-builder/registry/*.ts
const regDir = path.resolve('lib/website-builder/registry');
const regFiles = fs.readdirSync(regDir).filter(f => f !== 'aliases.ts' && f !== 'helpers.ts');

const templates = {};
for (const file of regFiles) {
  const content = fs.readFileSync(path.join(regDir, file), 'utf8');
  // Extract template objects
  const tmplRegex = /["']([a-z0-9\-]+@v[0-9]+)["']\s*:\s*\{([^]*?)(?=\n\s*["'][a-z0-9\-]+@v[0-9]+["']\s*:|\n\};|\nexport const)/g;
  let match;
  while ((match = tmplRegex.exec(content)) !== null) {
    const id = match[1];
    const block = match[2];
    
    // extract bodyComponent
    const bodyCompMatch = block.match(/bodyComponent\s*:\s*["']([^"']+)["']/);
    const bodyComponent = bodyCompMatch ? bodyCompMatch[1] : '';

    // extract layoutFolder
    const layoutMatch = block.match(/layoutComponent\s*:\s*["']([^"']+)["']/);
    const layoutComponent = layoutMatch ? layoutMatch[1] : '';

    // extract authenticSections
    const sections = [];
    const secRegex = /\{\s*id\s*:\s*["']([^"']+)["'],\s*name\s*:\s*["']([^"']+)["'],\s*type\s*:\s*["']([^"']+)["'],\s*component\s*:\s*["']([^"']+)["']/g;
    let secMatch;
    while ((secMatch = secRegex.exec(block)) !== null) {
      sections.push({
        id: secMatch[1],
        name: secMatch[2],
        type: secMatch[3],
        component: secMatch[4]
      });
    }

    templates[id] = {
      id,
      file,
      bodyComponent,
      layoutComponent,
      sections
    };
  }
}

console.log('Parsed templates:', Object.keys(templates).length);

// Now let's inspect the layout folder for each template
const layoutsDir = path.resolve('components/site/layouts');
const auditResults = [];

for (const [id, tmpl] of Object.entries(templates)) {
  // Find layout folder
  // Either layoutComponent matches or we check siteBodyComponentMap
  let layoutFolder = tmpl.layoutComponent;
  if (!fs.existsSync(path.join(layoutsDir, layoutFolder))) {
    // try to find dir where body contains bodyComponent
    const allDirs = fs.readdirSync(layoutsDir).filter(d => fs.statSync(path.join(layoutsDir, d)).isDirectory());
    for (const d of allDirs) {
      const bPath = path.join(layoutsDir, d, 'body');
      if (fs.existsSync(bPath)) {
        const files = fs.readdirSync(bPath);
        if (files.some(f => f.includes(tmpl.bodyComponent) || f.replace('.tsx','') === tmpl.bodyComponent)) {
          layoutFolder = d;
          break;
        }
      }
    }
  }

  const bodyDirPath = path.join(layoutsDir, layoutFolder, 'body');
  let bodyFile = '';
  let bodyContent = '';
  let usesContainer = false;
  let sectionMapKeys = [];

  if (fs.existsSync(bodyDirPath)) {
    const files = fs.readdirSync(bodyDirPath).filter(f => f.endsWith('.tsx'));
    for (const f of files) {
      const c = fs.readFileSync(path.join(bodyDirPath, f), 'utf8');
      if (c.includes('ThemeSectionContainer') || c.includes('renderSectionComponent') || f.includes(tmpl.bodyComponent)) {
        bodyFile = f;
        bodyContent = c;
        break;
      }
    }
    if (!bodyFile && files.length > 0) {
      bodyFile = files[0];
      bodyContent = fs.readFileSync(path.join(bodyDirPath, bodyFile), 'utf8');
    }
  }

  if (bodyContent.includes('ThemeSectionContainer')) {
    usesContainer = true;
    // Extract sectionMap keys
    const smMatch = bodyContent.match(/sectionMap\s*=\s*\{\s*\{([^]*?)\}\s*\}/);
    if (smMatch) {
      const smContent = smMatch[1];
      const keyMatches = smContent.match(/["']?([a-zA-Z0-9_\-]+)["']?\s*:/g);
      if (keyMatches) {
        sectionMapKeys = keyMatches.map(k => k.replace(/[:"']/g, '').trim());
      }
    }
  } else if (bodyContent.includes('renderSectionComponent')) {
    // Custom dynamic renderer (like FurnitureSite, DeliverySite)
    usesContainer = 'custom-dynamic';
    // Extract cases
    const caseMatches = bodyContent.match(/case\s+["']([^"']+)["']\s*:/g);
    if (caseMatches) {
      sectionMapKeys = caseMatches.map(k => k.replace(/case\s+["']|["']\s*:/g, '').trim());
    }
  }

  auditResults.push({
    canonicalId: id,
    layoutFolder,
    bodyComponent: tmpl.bodyComponent,
    bodyFile,
    usesContainer,
    authenticSectionsCount: tmpl.sections.length,
    sections: tmpl.sections,
    sectionMapKeysCount: sectionMapKeys.length,
    sectionMapKeys
  });
}

fs.writeFileSync('scripts/audit_output.json', JSON.stringify(auditResults, null, 2));
console.log('Audit complete! Total templates audited:', auditResults.length);
console.log('Summary:');
const missingSections = auditResults.filter(r => r.authenticSectionsCount === 0);
console.log('Templates with 0 authenticSections declared:', missingSections.length, missingSections.map(m => m.canonicalId));
const missingContainer = auditResults.filter(r => !r.usesContainer);
console.log('Templates without ThemeSectionContainer or custom-dynamic:', missingContainer.length, missingContainer.map(m => m.canonicalId));
