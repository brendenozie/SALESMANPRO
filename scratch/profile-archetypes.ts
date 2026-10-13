import fs from 'fs';
import path from 'path';

const layoutsDir = path.resolve('components/site/layouts');
const layouts = fs.readdirSync(layoutsDir).filter((l) => {
  return fs.statSync(path.join(layoutsDir, l)).isDirectory() && l !== 'EcommerceShoesLayout';
});

export interface ComponentProfile {
  layout: string;
  componentName: string;
  filePath: string;
  trueType: 'features_values' | 'testimonials' | 'product_grid' | 'category_browser' | 'other';
  hasEditableElement: boolean;
  hasEditableItems: boolean;
  hasEditableHeader: boolean;
  
  // Data source & state
  dataSource: {
    usesStoreContext: boolean;
    usesProps: boolean;
    hasFallbackArray: boolean;
    arrayName?: string;
  };

  // Item schema (if list/grid)
  itemSchema: {
    itemVar?: string;
    idxVar?: string;
    fields: string[];
    sampleAccesses: string[];
  };

  // Header / Section Titles
  headerSchema: {
    titleTag?: string;
    titleTextOrProp?: string;
    eyebrowTextOrProp?: string;
    descriptionTextOrProp?: string;
    hasDynamicTitle: boolean;
  };
}

const profiles: ComponentProfile[] = [];

layouts.forEach((layout) => {
  const compDir = path.join(layoutsDir, layout, 'body', 'components');
  if (!fs.existsSync(compDir)) return;

  const comps = fs.readdirSync(compDir);
  comps.forEach((comp) => {
    const compPath = path.join(compDir, comp);
    let filePath = '';
    if (fs.statSync(compPath).isDirectory()) {
      const idx = path.join(compPath, 'index.tsx');
      const named = path.join(compPath, comp + '.tsx');
      if (fs.existsSync(idx)) filePath = idx;
      else if (fs.existsSync(named)) filePath = named;
    } else if (compPath.endsWith('.tsx')) {
      filePath = compPath;
    }
    if (!filePath) return;

    const code = fs.readFileSync(filePath, 'utf8');
    const lower = comp.toLowerCase();

    // Determine True Type
    let trueType: ComponentProfile['trueType'] = 'other';
    
    // Testimonials
    if (lower.includes('testim') || lower.includes('review') || lower.includes('feedback')) {
      trueType = 'testimonials';
    }
    // Category Browsers
    else if (lower.includes('category') || lower.includes('categories')) {
      trueType = 'category_browser';
    }
    // Product Grids / Listings
    else if (
      lower.includes('product') ||
      lower.includes('listing') ||
      lower.includes('bestsell') ||
      lower.includes('popular') ||
      lower.includes('deal') ||
      lower.includes('program') ||
      lower.includes('catalog') ||
      lower.includes('course') ||
      lower.includes('vehicle') ||
      lower.includes('property') ||
      lower.includes('menu') ||
      lower.includes('dishes') ||
      code.includes('marketplaceListings') ||
      code.includes('productsByFlag') ||
      code.includes('MarketListingForm')
    ) {
      trueType = 'product_grid';
    }
    // Features / Values
    else if (
      lower.includes('feature') ||
      lower.includes('value') ||
      lower.includes('why') ||
      lower.includes('benefit') ||
      lower.includes('metric') ||
      lower.includes('guarantee') ||
      lower.includes('process') ||
      lower.includes('steps') ||
      lower.includes('servicesection') ||
      lower.includes('trust')
    ) {
      trueType = 'features_values';
    }

    if (trueType === 'other') return;

    // Check existing EditableElement
    const hasEditableElement = code.includes('EditableElement');
    const hasEditableItems = code.includes('.items.') || code.includes('.item.');
    const hasEditableHeader = code.includes('.title') || code.includes('.heading') || code.includes('.badge') || code.includes('.eyebrow');

    // Data Source Analysis
    const usesStoreContext = code.includes('useStoreContext(') || code.includes('useStoreContext()');
    const usesProps = /function\s+[A-Za-z0-9_]+\s*\(\s*\{[^}]+\}/.test(code);
    const hasFallbackArray = /const\s+(?:features|items|testimonials|values|benefits|reviews|default[A-Za-z]+)\s*=\s*\[/i.test(code);

    // Array / Map Analysis
    const mapRegex = /([A-Za-z0-9_.]+)\.map\s*\(\s*\(\s*([A-Za-z0-9_]+)(?:\s*,\s*([A-Za-z0-9_]+))?\s*\)\s*=>/;
    const mapMatch = code.match(mapRegex);
    let arrayName: string | undefined;
    let itemVar: string | undefined;
    let idxVar: string | undefined;
    const itemFields: string[] = [];
    const sampleAccesses: string[] = [];

    if (mapMatch) {
      arrayName = mapMatch[1];
      itemVar = mapMatch[2];
      idxVar = mapMatch[3] || 'idx';

      const fieldRegex = new RegExp(`\\b${itemVar}\\.([A-Za-z0-9_]+)\\b`, 'g');
      for (const m of code.matchAll(fieldRegex)) {
        const prop = m[1];
        if (!['id', 'map', 'key', 'length', 'toString', 'slice', 'filter'].includes(prop)) {
          if (!itemFields.includes(prop)) itemFields.push(prop);
        }
      }

      // Sample accesses
      itemFields.forEach((f) => {
        sampleAccesses.push(`${itemVar}.${f}`);
      });
    }

    // Header Analysis
    const titleRegex = /<(h[1-4])[^>]*>([\s\S]*?)<\/\1>/i;
    const titleMatch = code.match(titleRegex);
    let titleTag: string | undefined;
    let titleTextOrProp: string | undefined;
    let hasDynamicTitle = false;

    if (titleMatch) {
      titleTag = titleMatch[1];
      titleTextOrProp = titleMatch[2].trim().replace(/\s+/g, ' ').slice(0, 80);
      hasDynamicTitle = titleTextOrProp.includes('{');
    }

    // Eyebrow / Badge analysis
    const eyebrowRegex = /<(?:span|p|div)[^>]*class(?:Name)?=["'][^"']*(?:badge|eyebrow|subheading|tracking-widest|uppercase)[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|p|div)>/i;
    const eyebrowMatch = code.match(eyebrowRegex);
    const eyebrowTextOrProp = eyebrowMatch ? eyebrowMatch[1].trim().replace(/\s+/g, ' ').slice(0, 60) : undefined;

    // Subtitle / Description analysis
    const descRegex = /<p[^>]*class(?:Name)?=["'][^"']*(?:subtitle|description|text-gray-[45]00|text-zinc-[45]00|max-w-)[^"']*["'][^>]*>([\s\S]*?)<\/p>/i;
    const descMatch = code.match(descRegex);
    const descriptionTextOrProp = descMatch ? descMatch[1].trim().replace(/\s+/g, ' ').slice(0, 80) : undefined;

    profiles.push({
      layout,
      componentName: comp,
      filePath: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
      trueType,
      hasEditableElement,
      hasEditableItems,
      hasEditableHeader,
      dataSource: {
        usesStoreContext,
        usesProps,
        hasFallbackArray,
        arrayName,
      },
      itemSchema: {
        itemVar,
        idxVar,
        fields: itemFields,
        sampleAccesses,
      },
      headerSchema: {
        titleTag,
        titleTextOrProp,
        eyebrowTextOrProp,
        descriptionTextOrProp,
        hasDynamicTitle,
      },
    });
  });
});

fs.writeFileSync('scratch/true-component-profiles.json', JSON.stringify(profiles, null, 2));

console.log('--- TRUE COMPONENT ARCHETYPE DISCOVERY ---');
console.log('Total Profiled Components:', profiles.length);

const byType = {
  features_values: profiles.filter((p) => p.trueType === 'features_values'),
  testimonials: profiles.filter((p) => p.trueType === 'testimonials'),
  product_grid: profiles.filter((p) => p.trueType === 'product_grid'),
  category_browser: profiles.filter((p) => p.trueType === 'category_browser'),
};

console.log(`\n1. Features & Values: ${byType.features_values.length}`);
console.log(`   - Fully editable items: ${byType.features_values.filter((p) => p.hasEditableItems).length}`);
console.log(`   - Needs item upgrade: ${byType.features_values.filter((p) => !p.hasEditableItems).length}`);

console.log(`\n2. Testimonials: ${byType.testimonials.length}`);
console.log(`   - Fully editable items: ${byType.testimonials.filter((p) => p.hasEditableItems).length}`);
console.log(`   - Needs item upgrade: ${byType.testimonials.filter((p) => !p.hasEditableItems).length}`);

console.log(`\n3. Product Grids: ${byType.product_grid.length}`);
console.log(`   - Header has EditableElement: ${byType.product_grid.filter((p) => p.hasEditableHeader).length}`);
console.log(`   - Needs header upgrade: ${byType.product_grid.filter((p) => !p.hasEditableHeader).length}`);

console.log(`\n4. Category Browsers: ${byType.category_browser.length}`);
console.log(`   - Header has EditableElement: ${byType.category_browser.filter((p) => p.hasEditableHeader).length}`);
console.log(`   - Needs header upgrade: ${byType.category_browser.filter((p) => !p.hasEditableHeader).length}`);
