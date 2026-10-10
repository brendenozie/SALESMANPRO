const fs = require('fs');
const path = require('path');

const jiti = require('jiti')(path.join(process.cwd(), 'index.js'), {
  alias: { '@': process.cwd() },
});

const { TEMPLATE_REGISTRY, getAllTemplates } = jiti('@/lib/website-builder/template-registry');
const { getEditableComponent } = jiti('@/lib/website-builder/editable-adapters');
// Parse categoryHeaderFooterLayoutMap keys
const shellMapSrc = fs.readFileSync(path.resolve('components/site/layouts/categoryHeaderFooterLayoutMap.ts'), 'utf8');
const shellKeys = new Set();
const shellKeyMatches = shellMapSrc.matchAll(/["']?([a-zA-Z0-9_\-]+)["']?\s*:\s*[A-Z][a-zA-Z0-9_]+/g);
for (const m of shellKeyMatches) {
  shellKeys.add(m[1]);
}
const defaultExportMatch = shellMapSrc.match(/export\s+default\s*\{([^]*?)\};/);
if (defaultExportMatch) {
  const km = defaultExportMatch[1].matchAll(/["']?([a-zA-Z0-9_\-]+)["']?\s*:/g);
  for (const m of km) shellKeys.add(m[1]);
}

// Parse BodyComponentMap keys
const bodyMapSrc = fs.readFileSync(path.resolve('components/site/BodyComponentMap.tsx'), 'utf8');
const bodyKeys = new Set();
const bodyKeyMatches = bodyMapSrc.matchAll(/["']?([a-zA-Z0-9_\-]+)["']?\s*:\s*[A-Z][a-zA-Z0-9_]+/g);
for (const m of bodyKeyMatches) {
  bodyKeys.add(m[1]);
}

async function main() {
  console.log('--- SalesmanPro Website Builder Complete Inventory Generator ---');
  const templates = getAllTemplates();
  console.log(`Loaded ${templates.length} canonical templates.`);

  const layoutsDir = path.resolve('components/site/layouts');
  const layoutSubdirs = fs.readdirSync(layoutsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const applyConfigPath = path.resolve('lib/website-builder/applyWebsiteConfigToStoreData.ts');
  const applyConfigSrc = fs.existsSync(applyConfigPath) ? fs.readFileSync(applyConfigPath, 'utf8') : '';

  const inventory = [];
  const defects = [];
  let defectIdCounter = 1;

  for (const tpl of templates) {
    const sections = tpl.authenticSections || [];
    const bodyCompName = tpl.bodyComponent;

    // Shell & Page resolution check
    const shellResolved = shellKeys.has(tpl.shellLayout);
    const bodyResolved = bodyKeys.has(bodyCompName);

    if (!shellResolved) {
      defects.push({
        defectId: `DEF-${String(defectIdCounter++).padStart(3, '0')}`,
        themeId: tpl.id,
        component: tpl.shellLayout,
        severity: 'HIGH',
        category: 'SHELL_RESOLUTION',
        rootCause: `Shell layout '${tpl.shellLayout}' not found in categoryHeaderFooterLayoutMap`,
        impact: 'Store layout shell fails to resolve or falls back to generic default',
      });
    }

    if (!bodyResolved) {
      defects.push({
        defectId: `DEF-${String(defectIdCounter++).padStart(3, '0')}`,
        themeId: tpl.id,
        component: bodyCompName,
        severity: 'HIGH',
        category: 'BODY_RESOLUTION',
        rootCause: `Body component '${bodyCompName}' not found in BodyComponentMap`,
        impact: 'Store page fails to render body or falls back to DefaultSite',
      });
    }

    // Find the layout folder on disk
    let layoutFolder = '';
    for (const sub of layoutSubdirs) {
      const candidateBody = path.join(layoutsDir, sub, 'body', `${bodyCompName}.tsx`);
      if (fs.existsSync(candidateBody)) {
        layoutFolder = sub;
        break;
      }
    }

    // Fallback: match by shellLayout name (e.g., "SalonBookingsLayout" → directory "SalonBookingsLayout")
    if (!layoutFolder && tpl.shellLayout) {
      for (const sub of layoutSubdirs) {
        if (sub === tpl.shellLayout) {
          layoutFolder = sub;
          break;
        }
        // Also try normalized match (e.g. "SalonBookingsLayout" matches "SalonBookingsLayout")
        if (sub.toLowerCase().replace(/[^a-z0-9]/g, '') === tpl.shellLayout.toLowerCase().replace(/[^a-z0-9]/g, '')) {
          layoutFolder = sub;
          break;
        }
      }
    }

    if (!layoutFolder) {
      for (const sub of layoutSubdirs) {
        if (sub.toLowerCase().replace(/[^a-z0-9]/g, '') === tpl.variant.toLowerCase().replace(/[^a-z0-9]/g, '')) {
          layoutFolder = sub;
          break;
        }
      }
    }

    if (!layoutFolder) {
      for (const sub of layoutSubdirs) {
        if (sub.toLowerCase().includes(tpl.category.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
          layoutFolder = sub;
          break;
        }
      }
    }

    // Read body file to see how it renders sections
    let bodySrc = '';
    let bodyFilePath = '';
    if (layoutFolder) {
      const bp = path.join(layoutsDir, layoutFolder, 'body', `${bodyCompName}.tsx`);
      if (fs.existsSync(bp)) {
        bodyFilePath = bp;
        bodySrc = fs.readFileSync(bp, 'utf8');
      } else {
        // Fallback: find any *Site.tsx in the body directory
        const bodyDir = path.join(layoutsDir, layoutFolder, 'body');
        if (fs.existsSync(bodyDir)) {
          const bodyFiles = fs.readdirSync(bodyDir).filter(f => f.endsWith('Site.tsx'));
          if (bodyFiles.length === 1) {
            bodyFilePath = path.join(bodyDir, bodyFiles[0]);
            bodySrc = fs.readFileSync(bodyFilePath, 'utf8');
          } else if (bodyFiles.length > 1) {
            // Multiple candidates; pick the one most likely matching
            const best = bodyFiles.find(f => f.toLowerCase().includes(tpl.variant?.toLowerCase() || '')) || bodyFiles[0];
            bodyFilePath = path.join(bodyDir, best);
            bodySrc = fs.readFileSync(bodyFilePath, 'utf8');
          }
        }
      }
    }

    const usesThemeSectionContainer = bodySrc.includes('ThemeSectionContainer');
    const usesCustomDynamic = bodySrc.includes('renderSectionComponent') || bodySrc.includes('renderSection');

    for (const sec of sections) {
      const compName = sec.component || sec.type || sec.id;

      // Locate component file
      let compFilePath = null;
      let compFileExists = false;
      let compSrc = '';

      if (layoutFolder) {
        const candidatePaths = [
          path.join(layoutsDir, layoutFolder, 'body', 'components', compName, 'index.tsx'),
          path.join(layoutsDir, layoutFolder, 'body', 'components', `${compName}.tsx`),
          path.join(layoutsDir, layoutFolder, 'body', 'components', compName.replace(/Section$/, ''), 'index.tsx'),
          path.join(layoutsDir, layoutFolder, 'body', 'components', `${compName.replace(/Section$/, '')}.tsx`),
          path.join(layoutsDir, layoutFolder, 'body', `${compName}.tsx`),
          path.join(layoutsDir, layoutFolder, 'body', `${bodyCompName}.tsx`),
        ];

        for (const cp of candidatePaths) {
          if (fs.existsSync(cp)) {
            compFilePath = cp;
            compFileExists = true;
            compSrc = fs.readFileSync(cp, 'utf8');
            break;
          }
        }
      }

      // If not in layoutFolder, search other layout subdirs (shared component)
      if (!compFileExists) {
        for (const sub of layoutSubdirs) {
          const cp = path.join(layoutsDir, sub, 'body', 'components', compName, 'index.tsx');
          const cp2 = path.join(layoutsDir, sub, 'body', 'components', `${compName}.tsx`);
          if (fs.existsSync(cp)) {
            compFilePath = cp;
            compFileExists = true;
            compSrc = fs.readFileSync(cp, 'utf8');
            break;
          } else if (fs.existsSync(cp2)) {
            compFilePath = cp2;
            compFileExists = true;
            compSrc = fs.readFileSync(cp2, 'utf8');
            break;
          }
        }
      }

      // Check adapter
      const adapter = getEditableComponent(compName) || getEditableComponent(sec.id) || getEditableComponent(sec.type);
      const adapterFound = !!adapter;
      const adapterStatus = adapter?.status || 'VIEW_ONLY';
      const adapterProps = adapter?.properties ? Object.keys(adapter.properties) : [];

      // Check component source
      const hasEditableElement = compSrc.includes('EditableElement');
      const usesUseEditableContent = compSrc.includes('useEditableContent');
      const usesStoreContext = compSrc.includes('useStoreContext') || compSrc.includes('StoreContext');

      // Discover target IDs in source
      const targetMatches = compSrc.matchAll(/targetId=(?:["']([^"']+)["']|\{`([^`]+)`\})/g);
      const discoveredTargetIds = [];
      for (const m of targetMatches) {
        const tid = m[1] || m[2];
        if (tid && !discoveredTargetIds.includes(tid)) {
          discoveredTargetIds.push(tid);
        }
      }

      // Check repeated item strategy
      let repeatedStrategy = 'none';
      if (compSrc.includes('.slide') || compSrc.includes('.items.${') || compSrc.includes('.features.${') || compSrc.includes('.perks.${')) {
        repeatedStrategy = compSrc.includes('item.id') || compSrc.includes('slide.id') ? 'id' : 'index';
      }

      // Check mapping in applyWebsiteConfigToStoreData
      const lowerKey = `${sec.type || ''} ${sec.id || ''} ${compName}`.toLowerCase();
      const mappedInStoreData = applyConfigSrc.toLowerCase().includes(compName.toLowerCase()) ||
        applyConfigSrc.toLowerCase().includes(sec.id.toLowerCase()) ||
        (lowerKey.includes('hero') && applyConfigSrc.includes('heroSlides')) ||
        (lowerKey.includes('feature') && applyConfigSrc.includes('CoreValues')) ||
        (lowerKey.includes('testimonial') && applyConfigSrc.includes('testimonials')) ||
        (lowerKey.includes('faq') && applyConfigSrc.includes('faqs'));

      // Defect identification for this component
      const compDefects = [];

      if (!compFileExists) {
        const d = {
          defectId: `DEF-${String(defectIdCounter++).padStart(3, '0')}`,
          themeId: tpl.id,
          component: compName,
          severity: 'HIGH',
          category: 'MISSING_COMPONENT_FILE',
          rootCause: `Physical component '${compName}' not found in layout directory '${layoutFolder}' or shared locations`,
          impact: 'Section fails to render or produces runtime import crash',
        };
        compDefects.push(d.rootCause);
        defects.push(d);
      }

      if (hasEditableElement && adapterStatus === 'VIEW_ONLY') {
        const d = {
          defectId: `DEF-${String(defectIdCounter++).padStart(3, '0')}`,
          themeId: tpl.id,
          component: compName,
          severity: 'MEDIUM',
          category: 'ADAPTER_MISMATCH',
          rootCause: `Component '${compName}' wraps fields in EditableElement but adapter status is VIEW_ONLY`,
          impact: 'Inspector displays VIEW_ONLY badge despite component having live editable elements',
        };
        compDefects.push(d.rootCause);
        defects.push(d);
      }

      if (!hasEditableElement && (sec.editableProps?.length || 0) > 0 && adapterStatus !== 'DATA_DRIVEN') {
        const d = {
          defectId: `DEF-${String(defectIdCounter++).padStart(3, '0')}`,
          themeId: tpl.id,
          component: compName,
          severity: 'LOW',
          category: 'UNWRAPPED_COMPONENT',
          rootCause: `Section declares editableProps [${sec.editableProps.join(', ')}] but JSX does not use EditableElement`,
          impact: 'Fields rely on schema fallback in inspector instead of live DOM selection',
        };
        compDefects.push(d.rootCause);
        defects.push(d);
      }

      if (repeatedStrategy === 'index') {
        compDefects.push(`Index-based target identity on repeated items`);
      }

      let status = 'VERIFIED';
      if (!compFileExists || compDefects.some(d => d.includes('not found'))) {
        status = 'DEFECTIVE';
      } else if (compDefects.length > 0) {
        status = 'PARTIALLY_VERIFIED';
      }

      inventory.push({
        themeId: tpl.id,
        themeName: tpl.name,
        category: tpl.category,
        variant: tpl.variant,
        shellLayout: tpl.shellLayout,
        bodyComponent: bodyCompName,
        layoutFolder,
        usesThemeSectionContainer,
        usesCustomDynamic,
        sectionId: sec.id,
        sectionName: sec.name,
        sectionType: sec.type,
        componentName: compName,
        componentFilePath: compFilePath ? path.relative(process.cwd(), compFilePath).replace(/\\/g, '/') : null,
        componentFileExists: compFileExists,
        adapterFound,
        adapterStatus,
        adapterPropsCount: adapterProps.length,
        adapterProps,
        declaredEditableProps: sec.editableProps || [],
        hasEditableElement,
        discoveredTargetIds,
        usesUseEditableContent,
        usesStoreContext,
        repeatedStrategy,
        mappedInStoreData,
        status,
        defects: compDefects,
      });
    }
  }

  // Write outputs
  const jsonOut = path.resolve('scratch/theme-component-inventory.json');
  fs.writeFileSync(jsonOut, JSON.stringify(inventory, null, 2), 'utf8');

  const defectsOut = path.resolve('scratch/defect-register.json');
  fs.writeFileSync(defectsOut, JSON.stringify(defects, null, 2), 'utf8');

  // CSV
  const csvHeaders = [
    'Theme ID',
    'Theme Name',
    'Category',
    'Variant',
    'Shell Layout',
    'Body Component',
    'Layout Folder',
    'Uses Section Container',
    'Section ID',
    'Section Name',
    'Component Name',
    'Component File Path',
    'Component Exists',
    'Adapter Found',
    'Adapter Status',
    'Adapter Props Count',
    'Declared Props Count',
    'Has EditableElement',
    'Uses EditableContent',
    'Uses StoreContext',
    'Repeated Strategy',
    'Mapped in Store Data',
    'Status',
    'Defects Count',
  ];

  const csvRows = inventory.map(item => [
    `"${item.themeId}"`,
    `"${item.themeName}"`,
    `"${item.category}"`,
    `"${item.variant}"`,
    `"${item.shellLayout}"`,
    `"${item.bodyComponent}"`,
    `"${item.layoutFolder}"`,
    item.usesThemeSectionContainer ? 'YES' : 'NO',
    `"${item.sectionId}"`,
    `"${item.sectionName}"`,
    `"${item.componentName}"`,
    `"${item.componentFilePath || 'N/A'}"`,
    item.componentFileExists ? 'YES' : 'NO',
    item.adapterFound ? 'YES' : 'NO',
    `"${item.adapterStatus}"`,
    item.adapterPropsCount,
    item.declaredEditableProps.length,
    item.hasEditableElement ? 'YES' : 'NO',
    item.usesUseEditableContent ? 'YES' : 'NO',
    item.usesStoreContext ? 'YES' : 'NO',
    `"${item.repeatedStrategy}"`,
    item.mappedInStoreData ? 'YES' : 'NO',
    `"${item.status}"`,
    item.defects.length,
  ]);

  const csvOut = path.resolve('scratch/theme-component-inventory.csv');
  fs.writeFileSync(csvOut, [csvHeaders.join(','), ...csvRows.map(r => r.join(','))].join('\n'), 'utf8');

  console.log('\n--- INVENTORY RESULTS ---');
  console.log(`Total canonical templates: ${templates.length}`);
  console.log(`Total component instances inventoried: ${inventory.length}`);
  console.log(`Unique component names: ${new Set(inventory.map(i => i.componentName)).size}`);
  console.log(`Physical component files found: ${inventory.filter(i => i.componentFileExists).length} / ${inventory.length}`);
  console.log(`Components with live EditableElement in JSX: ${inventory.filter(i => i.hasEditableElement).length}`);
  console.log(`Components mapped in applyWebsiteConfigToStoreData: ${inventory.filter(i => i.mappedInStoreData).length}`);
  console.log(`Defects identified: ${defects.length}`);
  console.log(`VERIFIED: ${inventory.filter(i => i.status === 'VERIFIED').length}`);
  console.log(`PARTIALLY_VERIFIED: ${inventory.filter(i => i.status === 'PARTIALLY_VERIFIED').length}`);
  console.log(`DEFECTIVE: ${inventory.filter(i => i.status === 'DEFECTIVE').length}`);
  console.log(`\nOutputs written to:`);
  console.log(`- ${jsonOut}`);
  console.log(`- ${csvOut}`);
  console.log(`- ${defectsOut}`);
}

main().catch(err => {
  console.error('Fatal error running inventory generator:', err);
  process.exit(1);
});
