import fs from 'fs';
import path from 'path';

const layoutsDir = path.resolve('components/site/layouts');
const layouts = fs.readdirSync(layoutsDir);

interface ComponentStructure {
  layout: string;
  category: 'features' | 'testimonials' | 'productGrid' | 'categoryBrowser';
  componentName: string;
  filePath: string;
  hasEditableElement: boolean;
  propsFound: string[];
  arrayPropUsed?: string;
  itemFieldsFound: string[];
  headerTagsFound: string[];
  hardcodedTextSamples: string[];
  structurePattern: string;
}

const results: ComponentStructure[] = [];

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
    let cat: 'features' | 'testimonials' | 'productGrid' | 'categoryBrowser' | null = null;

    if (lower.includes('feature') || lower.includes('value') || lower.includes('why') || lower.includes('metric')) {
      cat = 'features';
    } else if (lower.includes('testim') || lower.includes('review')) {
      cat = 'testimonials';
    } else if (lower.includes('product') || lower.includes('listing') || lower.includes('bestsell') || lower.includes('popular') || lower.includes('deal')) {
      cat = 'productGrid';
    } else if (lower.includes('categor')) {
      cat = 'categoryBrowser';
    }

    if (!cat) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const hasEditableElement = content.includes('EditableElement');

    // Extract props from function signature or interface
    const propsMatch = content.match(/function\s+[A-Za-z0-9_]+\s*\(\s*\{([^}]+)\}/);
    const propsFound = propsMatch
      ? propsMatch[1]
          .split(',')
          .map((p) => p.trim().split(':')[0].trim())
          .filter((p) => p && !p.includes('//'))
      : [];

    // Extract array prop used in .map(...)
    const mapMatches = Array.from(content.matchAll(/([A-Za-z0-9_.]+)\.map\s*\(\s*\(([^,)]+)/g));
    const arrayPropUsed = mapMatches.length > 0 ? mapMatches[0][1] : undefined;

    // Detect item fields accessed (e.g. item.title, feature.description, testimonial.quote)
    const itemFieldsFound: string[] = [];
    const fieldPatterns = [
      /\b(?:item|feature|val|testimonial|review|card|step|f|t)\.([A-Za-z0-9_]+)\b/g,
    ];
    for (const pat of fieldPatterns) {
      for (const m of content.matchAll(pat)) {
        if (!itemFieldsFound.includes(m[1]) && m[1] !== 'id' && m[1] !== 'map') {
          itemFieldsFound.push(m[1]);
        }
      }
    }

    // Detect header tags
    const headerTagsFound: string[] = [];
    if (content.includes('<h2')) headerTagsFound.push('h2');
    if (content.includes('<h3')) headerTagsFound.push('h3');
    if (content.includes('<h4')) headerTagsFound.push('h4');

    // Detect structure pattern
    let structurePattern = 'standalone';
    if (content.includes('ThemeSectionContainer')) structurePattern = 'container-wrapped';
    else if (content.includes('useStoreContext')) structurePattern = 'store-context-direct';
    else if (propsFound.length > 0) structurePattern = 'pure-props';

    results.push({
      layout,
      category: cat,
      componentName: comp,
      filePath: path.relative(process.cwd(), filePath),
      hasEditableElement,
      propsFound,
      arrayPropUsed,
      itemFieldsFound,
      headerTagsFound,
      hardcodedTextSamples: [],
      structurePattern,
    });
  });
});

console.log('--- STRUCTURAL ANALYSIS SUMMARY ---');
console.log('Total targeted components analyzed:', results.length);

const byCat = {
  features: results.filter((r) => r.category === 'features'),
  testimonials: results.filter((r) => r.category === 'testimonials'),
  productGrid: results.filter((r) => r.category === 'productGrid'),
  categoryBrowser: results.filter((r) => r.category === 'categoryBrowser'),
};

console.log(`\n1. Features / Values: ${byCat.features.length} components`);
console.log(`   - Already has EditableElement: ${byCat.features.filter((r) => r.hasEditableElement).length}`);
console.log(`   - Needing structural update: ${byCat.features.filter((r) => !r.hasEditableElement).length}`);

console.log(`\n2. Testimonials: ${byCat.testimonials.length} components`);
console.log(`   - Already has EditableElement: ${byCat.testimonials.filter((r) => r.hasEditableElement).length}`);
console.log(`   - Needing structural update: ${byCat.testimonials.filter((r) => !r.hasEditableElement).length}`);

console.log(`\n3. Product Grids: ${byCat.productGrid.length} components`);
console.log(`   - Already has EditableElement on titles/eyebrows: ${byCat.productGrid.filter((r) => r.hasEditableElement).length}`);
console.log(`   - Needing structural update: ${byCat.productGrid.filter((r) => !r.hasEditableElement).length}`);

console.log(`\n4. Category Browsers: ${byCat.categoryBrowser.length} components`);
console.log(`   - Already has EditableElement on titles/eyebrows: ${byCat.categoryBrowser.filter((r) => r.hasEditableElement).length}`);
console.log(`   - Needing structural update: ${byCat.categoryBrowser.filter((r) => !r.hasEditableElement).length}`);

fs.writeFileSync('scratch/component-structures.json', JSON.stringify(results, null, 2));
console.log('\nWrote full details to scratch/component-structures.json');
