import fs from 'fs';
import path from 'path';
import { TEMPLATE_REGISTRY, getAllTemplates } from '../lib/website-builder/template-registry';
import { getEditableComponent, getAllEditableComponents } from '../lib/website-builder/editable-adapters';
import { categoryHeaderFooterLayoutMap } from '../components/site/layouts/categoryHeaderFooterLayoutMap';
import { BodyComponentMap } from '../components/site/BodyComponentMap';

interface ComponentInventoryItem {
  themeId: string;
  themeName: string;
  category: string;
  variant: string;
  shellLayout: string;
  bodyComponent: string;
  sectionId: string;
  sectionName: string;
  sectionType: string;
  componentName: string;
  componentFilePath: string | null;
  componentFileExists: boolean;
  adapterFound: boolean;
  adapterStatus: string;
  adapterPropertiesCount: number;
  adapterProperties: string[];
  hasEditableElement: boolean;
  discoveredTargetIds: string[];
  usesUseEditableContent: boolean;
  usesStoreContext: boolean;
  repeatedContentStrategy: 'index' | 'id' | 'none';
  mappedInApplyWebsiteConfig: boolean;
  status: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'DEFECTIVE' | 'NOT_TESTED';
  defects: string[];
  evidence: string;
}

async function runInventory() {
  console.log('Building full theme & component inventory across all canonical templates...\n');
  const templates = getAllTemplates();
  console.log(`Found ${templates.length} canonical templates in registry.`);

  const inventory: ComponentInventoryItem[] = [];

  // Read applyWebsiteConfigToStoreData.ts to see what fields are explicitly mapped
  const applyConfigPath = path.resolve('lib/website-builder/applyWebsiteConfigToStoreData.ts');
  const applyConfigSrc = fs.existsSync(applyConfigPath) ? fs.readFileSync(applyConfigPath, 'utf8') : '';

  for (const tpl of templates) {
    const sections = tpl.authenticSections || [];

    // Find the layout directory
    // e.g. for bodyComponent 'EcommerceShoesSite', find where it is located
    const bodyCompName = tpl.bodyComponent;
    let layoutDirName = '';
    
    // Check known mappings in components/site/layouts/
    const layoutsDir = path.resolve('components/site/layouts');
    const layoutSubdirs = fs.readdirSync(layoutsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const sub of layoutSubdirs) {
      const candidateBody = path.join(layoutsDir, sub, 'body', `${bodyCompName}.tsx`);
      if (fs.existsSync(candidateBody)) {
        layoutDirName = sub;
        break;
      }
      // Also check if sub matches shellLayout or category/variant
      if (!layoutDirName && sub.toLowerCase().includes(tpl.variant.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
        layoutDirName = sub;
      }
    }

    // Fallback: match by shellLayout name (e.g., "SalonBookingsLayout" -> directory "SalonBookingsLayout")
    if (!layoutDirName && tpl.shellLayout) {
      for (const sub of layoutSubdirs) {
        if (sub === tpl.shellLayout) {
          layoutDirName = sub;
          break;
        }
        if (sub.toLowerCase().replace(/[^a-z0-9]/g, '') === tpl.shellLayout.toLowerCase().replace(/[^a-z0-9]/g, '')) {
          layoutDirName = sub;
          break;
        }
      }
    }

    if (!layoutDirName) {
      // Fallback heuristics
      for (const sub of layoutSubdirs) {
        if (sub.toLowerCase().includes(tpl.category.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
          layoutDirName = sub;
          break;
        }
      }
    }

    for (const sec of sections) {
      const compName = sec.component || sec.type || sec.id;
      
      // Look for the component file in layoutDir/body/components/compName/index.tsx or compName.tsx
      let compFilePath: string | null = null;
      let compFileExists = false;
      let compSrc = '';

      if (layoutDirName) {
        const candidatePaths = [
          path.join(layoutsDir, layoutDirName, 'body', 'components', compName, 'index.tsx'),
          path.join(layoutsDir, layoutDirName, 'body', 'components', `${compName}.tsx`),
          path.join(layoutsDir, layoutDirName, 'body', 'components', compName.replace(/Section$/, ''), 'index.tsx'),
          path.join(layoutsDir, layoutDirName, 'body', 'components', `${compName.replace(/Section$/, '')}.tsx`),
          path.join(layoutsDir, layoutDirName, 'body', `${compName}.tsx`),
          path.join(layoutsDir, layoutDirName, 'body', `${bodyCompName}.tsx`), // might be inline in body
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

      // Check adapter
      const adapter = getEditableComponent(compName) || getEditableComponent(sec.id) || getEditableComponent(sec.type);
      const adapterFound = !!adapter;
      const adapterStatus = adapter?.status || 'VIEW_ONLY';
      const adapterProperties = adapter?.properties ? Object.keys(adapter.properties) : [];
      const adapterPropertiesCount = adapterProperties.length;

      // Check component source code
      const hasEditableElement = compSrc.includes('EditableElement');
      const usesUseEditableContent = compSrc.includes('useEditableContent');
      const usesStoreContext = compSrc.includes('useStoreContext') || compSrc.includes('StoreContext');

      // Discover target IDs in source
      const discoveredTargetIds: string[] = [];
      const targetMatches = compSrc.matchAll(/targetId=(?:["']([^"']+)["']|\{`([^`]+)`\})/g);
      for (const m of targetMatches) {
        const tid = m[1] || m[2];
        if (tid && !discoveredTargetIds.includes(tid)) {
          discoveredTargetIds.push(tid);
        }
      }

      // Repeated content strategy
      let repeatedStrategy: 'index' | 'id' | 'none' = 'none';
      if (compSrc.includes('.slide') || compSrc.includes('.items.${') || compSrc.includes('.features.${') || compSrc.includes('.perks.${')) {
        repeatedStrategy = compSrc.includes('item.id') || compSrc.includes('slide.id') ? 'id' : 'index';
      }

      // Mapped in applyWebsiteConfigToStoreData
      const lowerKey = `${sec.type || ''} ${sec.id || ''} ${compName}`.toLowerCase();
      const mappedInApplyWebsiteConfig = applyConfigSrc.toLowerCase().includes(compName.toLowerCase()) ||
        applyConfigSrc.toLowerCase().includes(sec.id.toLowerCase()) ||
        (lowerKey.includes('hero') && applyConfigSrc.includes('heroSlides')) ||
        (lowerKey.includes('feature') && applyConfigSrc.includes('CoreValues')) ||
        (lowerKey.includes('testimonial') && applyConfigSrc.includes('testimonials')) ||
        (lowerKey.includes('faq') && applyConfigSrc.includes('faqs'));

      // Defect analysis
      const defects: string[] = [];
      if (!compFileExists) {
        defects.push(`Component file not found on disk for ${compName}`);
      }
      if (adapterStatus === 'VIEW_ONLY' && hasEditableElement) {
        defects.push(`Component has EditableElement in JSX but adapter status is VIEW_ONLY`);
      }
      if (adapterPropertiesCount === 0 && (sec.editableProps?.length || 0) > 0) {
        defects.push(`Authentic section declares editableProps [${sec.editableProps.join(', ')}] but adapter has 0 properties`);
      }
      if (hasEditableElement && discoveredTargetIds.length === 0) {
        defects.push(`EditableElement used with complex/unparsed targetId`);
      }
      if (repeatedStrategy === 'index') {
        defects.push(`Uses array index targeting for repeated items (risk on reordering)`);
      }

      let itemStatus: ComponentInventoryItem['status'] = 'VERIFIED';
      if (defects.some(d => d.includes('not found') || d.includes('VIEW_ONLY but'))) {
        itemStatus = 'DEFECTIVE';
      } else if (defects.length > 0) {
        itemStatus = 'PARTIALLY_VERIFIED';
      }

      inventory.push({
        themeId: tpl.id,
        themeName: tpl.name,
        category: tpl.category,
        variant: tpl.variant,
        shellLayout: tpl.shellLayout,
        bodyComponent: tpl.bodyComponent,
        sectionId: sec.id,
        sectionName: sec.name,
        sectionType: sec.type,
        componentName: compName,
        componentFilePath: compFilePath ? path.relative(process.cwd(), compFilePath).replace(/\\/g, '/') : null,
        componentFileExists: compFileExists,
        adapterFound,
        adapterStatus,
        adapterPropertiesCount,
        adapterProperties,
        hasEditableElement,
        discoveredTargetIds,
        usesUseEditableContent,
        usesStoreContext,
        repeatedContentStrategy: repeatedStrategy,
        mappedInApplyWebsiteConfig,
        status: itemStatus,
        defects,
        evidence: compFilePath ? `${path.basename(compFilePath)}: L1 (hasEditableElement: ${hasEditableElement}, adapterProps: ${adapterPropertiesCount})` : 'Unresolved component file',
      });
    }
  }

  // Write machine-readable JSON inventory
  const jsonPath = path.resolve('scratch/theme-component-inventory.json');
  fs.writeFileSync(jsonPath, JSON.stringify(inventory, null, 2), 'utf8');

  // Also write CSV version
  const csvHeaders = [
    'Theme ID',
    'Theme Name',
    'Category',
    'Variant',
    'Shell Layout',
    'Body Component',
    'Section ID',
    'Section Name',
    'Component Name',
    'File Path',
    'File Exists',
    'Adapter Found',
    'Adapter Status',
    'Adapter Props Count',
    'Has EditableElement',
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
    `"${item.sectionId}"`,
    `"${item.sectionName}"`,
    `"${item.componentName}"`,
    `"${item.componentFilePath || 'N/A'}"`,
    item.componentFileExists ? 'YES' : 'NO',
    item.adapterFound ? 'YES' : 'NO',
    `"${item.adapterStatus}"`,
    item.adapterPropertiesCount,
    item.hasEditableElement ? 'YES' : 'NO',
    `"${item.repeatedContentStrategy}"`,
    item.mappedInApplyWebsiteConfig ? 'YES' : 'NO',
    `"${item.status}"`,
    item.defects.length,
  ]);

  const csvContent = [csvHeaders.join(','), ...csvRows.map(r => r.join(','))].join('\n');
  const csvPath = path.resolve('scratch/theme-component-inventory.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf8');

  console.log(`\nInventory complete!`);
  console.log(`Total component records generated: ${inventory.length}`);
  console.log(`Total unique themes covered: ${new Set(inventory.map(i => i.themeId)).size}`);
  console.log(`Verified components: ${inventory.filter(i => i.status === 'VERIFIED').length}`);
  console.log(`Partially verified: ${inventory.filter(i => i.status === 'PARTIALLY_VERIFIED').length}`);
  console.log(`Defective: ${inventory.filter(i => i.status === 'DEFECTIVE').length}`);
  console.log(`JSON written to: ${jsonPath}`);
  console.log(`CSV written to: ${csvPath}`);
}

runInventory().catch(err => {
  console.error('Inventory error:', err);
  process.exit(1);
});
