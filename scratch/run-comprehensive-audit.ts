import fs from 'fs';
import path from 'path';

const layoutsDir = path.resolve('components/site/layouts');
const layouts = fs.readdirSync(layoutsDir).filter((l) => {
  return fs.statSync(path.join(layoutsDir, l)).isDirectory() && l !== 'EcommerceShoesLayout';
});

export interface DetailedProfile {
  layout: string;
  componentName: string;
  category: 'testimonials' | 'features_values' | 'product_grid' | 'category_browser';
  filePath: string;
  currentEditabilityStatus: 'UNEDITABLE' | 'HEADER_ONLY' | 'LEGACY_TARGETS' | 'CANONICAL_ITEMS' | 'CARD_ISOLATED';
  existingTargetIds: string[];
  itemDataStructure: {
    source: 'useStoreContext' | 'props' | 'hardcoded_array' | 'other';
    arrayVar?: string;
    itemVar?: string;
    fields: string[];
  };
  headerStructure: {
    titleFound: boolean;
    titleSnippet?: string;
    titleIsDynamic: boolean;
    eyebrowFound: boolean;
    eyebrowSnippet?: string;
    descriptionFound: boolean;
    descriptionSnippet?: string;
  };
}

const report: DetailedProfile[] = [];

layouts.forEach((layout) => {
  const compDir = path.join(layoutsDir, layout, 'body', 'components');
  if (!fs.existsSync(compDir)) return;

  const comps = fs.readdirSync(compDir);
  comps.forEach((comp) => {
    const compPath = path.join(compDir, comp);
    let filePath = '';
    const isDir = fs.statSync(compPath).isDirectory();
    if (isDir) {
      const idx = path.join(compPath, 'index.tsx');
      const named = path.join(compPath, comp + '.tsx');
      if (fs.existsSync(idx)) filePath = idx;
      else if (fs.existsSync(named)) filePath = named;
    } else if (compPath.endsWith('.tsx')) {
      filePath = compPath;
    }
    if (!filePath) return;

    const lower = comp.toLowerCase();
    let category: DetailedProfile['category'] | null = null;

    if (lower.includes('testim') || lower.includes('review') || lower.includes('feedback')) {
      category = 'testimonials';
    } else if (lower.includes('category') || lower.includes('categories')) {
      category = 'category_browser';
    } else if (
      lower.includes('product') ||
      lower.includes('listing') ||
      lower.includes('bestsell') ||
      lower.includes('popular') ||
      lower.includes('deal') ||
      lower.includes('catalog') ||
      lower.includes('course') ||
      lower.includes('vehicle') ||
      lower.includes('property') ||
      lower.includes('dish') ||
      lower.includes('menu') ||
      lower.includes('program')
    ) {
      category = 'product_grid';
    } else if (
      lower.includes('feature') ||
      lower.includes('value') ||
      lower.includes('why') ||
      lower.includes('benefit') ||
      lower.includes('metric') ||
      lower.includes('guarantee') ||
      lower.includes('process') ||
      lower.includes('step') ||
      lower.includes('trust')
    ) {
      category = 'features_values';
    }

    if (!category) return;

    const code = fs.readFileSync(filePath, 'utf8');

    // Extract all targetIds, checking sibling files in directory if applicable
    const targetIds: string[] = [];
    let effectiveCode = code;
    if (isDir) {
      const allTsx = fs.readdirSync(compPath).filter((f) => f.endsWith('.tsx'));
      allTsx.forEach((f) => {
        if (f !== path.basename(filePath)) {
          effectiveCode += '\n' + fs.readFileSync(path.join(compPath, f), 'utf8');
        }
      });
    }

    if (code.includes('UniversalFeaturesSection')) {
      const sharedPath = path.resolve('components/site/shared/UniversalFeaturesSection.tsx');
      if (fs.existsSync(sharedPath)) {
        effectiveCode += '\n' + fs.readFileSync(sharedPath, 'utf8');
      }
    }

    for (const m of effectiveCode.matchAll(/targetId=\{?["'`]([^"'`]+)["'`]/g)) {
      targetIds.push(m[1]);
    }

    const isCardSubcomponent =
      lower.endsWith('card') ||
      lower.includes('checkout') ||
      (layout === 'MarketplaceLayout' && comp === 'ProductGrid');

    let status: DetailedProfile['currentEditabilityStatus'] = 'UNEDITABLE';
    if (targetIds.some((t) => t.includes('.items.'))) {
      status = 'CANONICAL_ITEMS';
    } else if (targetIds.some((t) => t.match(/\.(?:testimonial|slide|feature|card|val|review)\d+/i))) {
      status = 'LEGACY_TARGETS';
    } else if (targetIds.length > 0) {
      status = 'HEADER_ONLY';
    } else if (isCardSubcomponent) {
      status = 'CARD_ISOLATED';
    }

    // Determine data source
    let source: DetailedProfile['itemDataStructure']['source'] = 'other';
    if (code.includes('useStoreContext()') || code.includes('useStoreContext(')) {
      source = 'useStoreContext';
    } else if (/const\s+[A-Za-z0-9_]+\s*=\s*\[/i.test(code)) {
      source = 'hardcoded_array';
    } else if (/function\s+[A-Za-z0-9_]+\s*\(\s*\{[^}]+\}/.test(code)) {
      source = 'props';
    }

    // Extract loop & item fields
    let arrayVar: string | undefined;
    let itemVar: string | undefined;
    const fieldsSet = new Set<string>();

    const mapRegex = /([a-zA-Z0-9_.]+)\.map\s*\(\s*\(([^)]+)\)\s*=>/g;
    const firstMap = mapRegex.exec(code);
    if (firstMap) {
      arrayVar = firstMap[1];
      const params = firstMap[2].split(',').map((p) => p.trim());
      itemVar = params[0].replace(/[^\w]/g, '');

      if (itemVar) {
        const propRegex = new RegExp(`\\b${itemVar}\\.([a-zA-Z0-9_]+)\\b`, 'g');
        for (const m of code.matchAll(propRegex)) {
          if (!['id', 'key', 'map', 'length', 'toString', 'slice', 'filter'].includes(m[1])) {
            fieldsSet.add(m[1]);
          }
        }
      }
    }

    // Header extraction
    const titleMatch = effectiveCode.match(/<(h[1-4]|motion\.h[1-4])[^>]*>([\s\S]*?)<\/\1>/i);
    const eyebrowMatch = effectiveCode.match(/<(?:span|p|div)[^>]*class(?:Name)?=["'][^"']*(?:badge|eyebrow|subheading|tracking-widest|uppercase)[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|p|div)>/i);
    const descMatch = effectiveCode.match(/<p[^>]*class(?:Name)?=["'][^"']*(?:subtitle|description|text-gray-[45]00|text-zinc-[45]00|text-slate-[45]00|max-w-)[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);

    const titleSnippet = titleMatch ? titleMatch[2].trim().replace(/\s+/g, ' ').slice(0, 60) : undefined;
    const eyebrowSnippet = eyebrowMatch ? eyebrowMatch[1].trim().replace(/\s+/g, ' ').slice(0, 50) : undefined;
    const descriptionSnippet = descMatch ? descMatch[1].trim().replace(/\s+/g, ' ').slice(0, 60) : undefined;

    report.push({
      layout,
      componentName: comp,
      category,
      filePath: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
      currentEditabilityStatus: status,
      existingTargetIds: targetIds,
      itemDataStructure: {
        source,
        arrayVar,
        itemVar,
        fields: Array.from(fieldsSet),
      },
      headerStructure: {
        titleFound: !!titleMatch,
        titleSnippet,
        titleIsDynamic: titleSnippet ? titleSnippet.includes('{') : false,
        eyebrowFound: !!eyebrowMatch,
        eyebrowSnippet,
        descriptionFound: !!descMatch,
        descriptionSnippet,
      },
    });
  });
});

fs.writeFileSync('scratch/comprehensive-component-audit.json', JSON.stringify(report, null, 2));

console.log('=== COMPREHENSIVE COMPONENT AUDIT COMPLETE ===');
console.log('Total Components:', report.length);

const byCat = (c: DetailedProfile['category']) => report.filter((r) => r.category === c);

['testimonials', 'features_values', 'product_grid', 'category_browser'].forEach((cat) => {
  const items = byCat(cat as any);
  console.log(`\n--- ${cat.toUpperCase()} (${items.length}) ---`);
  console.log(`  CANONICAL_ITEMS: ${items.filter((i) => i.currentEditabilityStatus === 'CANONICAL_ITEMS').length}`);
  console.log(`  LEGACY_TARGETS:  ${items.filter((i) => i.currentEditabilityStatus === 'LEGACY_TARGETS').length}`);
  console.log(`  HEADER_ONLY:     ${items.filter((i) => i.currentEditabilityStatus === 'HEADER_ONLY').length}`);
  console.log(`  CARD_ISOLATED:   ${items.filter((i) => i.currentEditabilityStatus === 'CARD_ISOLATED').length}`);
  console.log(`  UNEDITABLE:      ${items.filter((i) => i.currentEditabilityStatus === 'UNEDITABLE').length}`);
});
