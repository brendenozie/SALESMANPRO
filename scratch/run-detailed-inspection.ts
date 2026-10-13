import fs from 'fs';
import path from 'path';

const layoutsDir = path.resolve('components/site/layouts');
const layouts = fs.readdirSync(layoutsDir).filter((l) => {
  return fs.statSync(path.join(layoutsDir, l)).isDirectory() && l !== 'EcommerceShoesLayout';
});

interface DetailedComponentInspection {
  layout: string;
  category: 'features' | 'testimonials' | 'productGrid' | 'categoryBrowser';
  componentName: string;
  filePath: string;
  hasEditableElement: boolean;
  dataSource: 'useStoreContext' | 'props' | 'hardcoded-array' | 'other';
  arrayVarName?: string;
  itemProperties: string[];
  headerStructure: {
    hasTitle: boolean;
    hasEyebrowOrBadge: boolean;
    hasSubtitleOrDescription: boolean;
    titleSnippet?: string;
    eyebrowSnippet?: string;
    descriptionSnippet?: string;
  };
  sampleItemJSXSnippet?: string;
}

const detailedInventory: DetailedComponentInspection[] = [];

layouts.forEach((layout) => {
  const bodyCompDir = path.join(layoutsDir, layout, 'body', 'components');
  if (!fs.existsSync(bodyCompDir)) return;

  const comps = fs.readdirSync(bodyCompDir);
  comps.forEach((comp) => {
    const compPath = path.join(bodyCompDir, comp);
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

    const lower = comp.toLowerCase();
    let category: DetailedComponentInspection['category'] | null = null;
    if (lower.includes('feature') || lower.includes('value') || lower.includes('why') || lower.includes('metric') || lower.includes('benefit')) {
      if (!lower.includes('product') && !lower.includes('listing')) {
        category = 'features';
      }
    } else if (lower.includes('testim') || lower.includes('review')) {
      category = 'testimonials';
    } else if (lower.includes('product') || lower.includes('listing') || lower.includes('bestsell') || lower.includes('popular') || lower.includes('deal') || lower.includes('catalog')) {
      category = 'productGrid';
    } else if (lower.includes('categor')) {
      category = 'categoryBrowser';
    }

    if (!category) return;

    const code = fs.readFileSync(filePath, 'utf8');
    const hasEditableElement = code.includes('EditableElement');

    // Data source detection
    let dataSource: DetailedComponentInspection['dataSource'] = 'other';
    if (code.includes('useStoreContext()') || code.includes('useStoreContext(')) {
      dataSource = 'useStoreContext';
    } else if (code.match(/function\s+[A-Za-z0-9_]+\s*\(\s*\{[^}]+\}/)) {
      dataSource = 'props';
    } else if (code.match(/const\s+(?:features|items|testimonials|values|benefits|reviews)\s*=\s*\[/i)) {
      dataSource = 'hardcoded-array';
    }

    // Array and mapping analysis
    const mapRegex = /\.map\s*\(\s*\(\s*([A-Za-z0-9_]+)(?:\s*,\s*([A-Za-z0-9_]+))?\s*\)\s*=>/g;
    const mapMatches = Array.from(code.matchAll(mapRegex));
    let arrayVarName: string | undefined;
    const itemPropsSet = new Set<string>();
    let sampleJSX = '';

    if (mapMatches.length > 0) {
      const firstMap = mapMatches[0];
      const itemVar = firstMap[1];
      const idxVar = firstMap[2] || 'idx';

      // Find what was mapped before .map
      const idxOfMap = firstMap.index || 0;
      const beforeMap = code.slice(Math.max(0, idxOfMap - 40), idxOfMap).trim();
      const arrayMatch = beforeMap.match(/([A-Za-z0-9_.]+)\s*$/);
      if (arrayMatch) arrayVarName = arrayMatch[1];

      // Find item property accesses like item.title, item.quote
      const propRegex = new RegExp(`\\b${itemVar}\\.([A-Za-z0-9_]+)\\b`, 'g');
      for (const m of code.matchAll(propRegex)) {
        if (!['id', 'map', 'key', 'length', 'toString'].includes(m[1])) {
          itemPropsSet.add(m[1]);
        }
      }

      // Grab snippet of the JSX inside the map
      const snippetSlice = code.slice(idxOfMap, idxOfMap + 350);
      sampleJSX = snippetSlice.replace(/\s+/g, ' ').trim();
    }

    // Header inspection: titles, eyebrows, descriptions
    const titleMatch = code.match(/<(h[1-4])[^>]*>([\s\S]*?)<\/\1>/i);
    const eyebrowMatch = code.match(/<(?:span|p)[^>]*class(?:Name)?=["'][^"']*(?:badge|eyebrow|tag|tracking-widest|uppercase)[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|p)>/i);
    const descMatch = code.match(/<p[^>]*class(?:Name)?=["'][^"']*(?:subtitle|description|text-gray-[45]00|text-zinc-[45]00|max-w-)[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);

    detailedInventory.push({
      layout,
      category,
      componentName: comp,
      filePath: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
      hasEditableElement,
      dataSource,
      arrayVarName,
      itemProperties: Array.from(itemPropsSet),
      headerStructure: {
        hasTitle: !!titleMatch,
        hasEyebrowOrBadge: !!eyebrowMatch,
        hasSubtitleOrDescription: !!descMatch,
        titleSnippet: titleMatch ? titleMatch[2].trim().slice(0, 60).replace(/\s+/g, ' ') : undefined,
        eyebrowSnippet: eyebrowMatch ? eyebrowMatch[1].trim().slice(0, 50).replace(/\s+/g, ' ') : undefined,
        descriptionSnippet: descMatch ? descMatch[1].trim().slice(0, 70).replace(/\s+/g, ' ') : undefined,
      },
      sampleItemJSXSnippet: sampleJSX || undefined,
    });
  });
});

console.log('Total Components Inspected:', detailedInventory.length);

const grouped = {
  testimonials: detailedInventory.filter((c) => c.category === 'testimonials'),
  features: detailedInventory.filter((c) => c.category === 'features'),
  productGrid: detailedInventory.filter((c) => c.category === 'productGrid'),
  categoryBrowser: detailedInventory.filter((c) => c.category === 'categoryBrowser'),
};

console.log('\n--- BREAKDOWN ---');
console.log(`Testimonials: ${grouped.testimonials.length} (EditableElement: ${grouped.testimonials.filter((c) => c.hasEditableElement).length}, Needs: ${grouped.testimonials.filter((c) => !c.hasEditableElement).length})`);
console.log(`Features/Values: ${grouped.features.length} (EditableElement: ${grouped.features.filter((c) => c.hasEditableElement).length}, Needs: ${grouped.features.filter((c) => !c.hasEditableElement).length})`);
console.log(`Product Grids: ${grouped.productGrid.length} (EditableElement: ${grouped.productGrid.filter((c) => c.hasEditableElement).length}, Needs Header: ${grouped.productGrid.filter((c) => !c.hasEditableElement).length})`);
console.log(`Category Browsers: ${grouped.categoryBrowser.length} (EditableElement: ${grouped.categoryBrowser.filter((c) => c.hasEditableElement).length}, Needs Header: ${grouped.categoryBrowser.filter((c) => !c.hasEditableElement).length})`);

fs.writeFileSync('scratch/detailed-inventory.json', JSON.stringify(detailedInventory, null, 2));
console.log('Wrote scratch/detailed-inventory.json');
