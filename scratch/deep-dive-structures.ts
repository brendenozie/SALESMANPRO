import fs from 'fs';
import path from 'path';

const layoutsDir = path.resolve('components/site/layouts');
const layouts = fs.readdirSync(layoutsDir);

// Patterns to investigate:
// 1. True Features / Values
// 2. Testimonials
// 3. Product Grids (Header)
// 4. Category Browsers (Header)

interface DeepAnalysis {
  filePath: string;
  category: string;
  dataSourceType: 'internal-fallback-array' | 'pure-props' | 'store-context';
  hasSectionHeader: boolean;
  headerFields: { tag: string; textSnippet: string; isDynamicProp: boolean }[];
  itemVariable: string;
  itemFields: string[];
}

const analyses: DeepAnalysis[] = [];

layouts.forEach((l) => {
  const bodyCompDir = path.join(layoutsDir, l, 'body', 'components');
  if (!fs.existsSync(bodyCompDir)) return;

  const comps = fs.readdirSync(bodyCompDir);
  comps.forEach((c) => {
    const compPath = path.join(bodyCompDir, c);
    let fPath = '';
    if (fs.statSync(compPath).isDirectory()) {
      const idx = path.join(compPath, 'index.tsx');
      const named = path.join(compPath, c + '.tsx');
      if (fs.existsSync(idx)) fPath = idx;
      else if (fs.existsSync(named)) fPath = named;
    } else if (compPath.endsWith('.tsx')) {
      fPath = compPath;
    }
    if (!fPath) return;

    const lower = c.toLowerCase();
    let cat = '';
    if (lower.includes('feature') && !lower.includes('product') && !lower.includes('listing')) cat = 'feature';
    else if (lower.includes('testim') || lower.includes('review')) cat = 'testimonial';
    else if (lower.includes('value') || lower.includes('why') || lower.includes('benefit')) cat = 'value';
    else if (lower.includes('product') || lower.includes('listing') || lower.includes('popular') || lower.includes('bestsell')) cat = 'productGrid';
    else if (lower.includes('categor')) cat = 'categoryBrowser';

    if (!cat) return;

    const code = fs.readFileSync(fPath, 'utf8');

    // Data source type
    let dataSourceType: DeepAnalysis['dataSourceType'] = 'pure-props';
    if (code.includes('useStoreContext')) dataSourceType = 'store-context';
    else if (code.match(/const\s+(?:features|items|testimonials|values|benefits|cards|reviews)\s*=\s*\[/)) {
      dataSourceType = 'internal-fallback-array';
    }

    // Header fields
    const headerFields: DeepAnalysis['headerFields'] = [];
    const hMatches = Array.from(code.matchAll(/<(h[1-4]|span|p)[^>]*class(?:Name)?=["'][^"']*(?:title|heading|text-[2-5]xl|eyebrow|sub|badge)[^"']*["'][^>]*>([^<]+)<\/\1>/gi));
    hMatches.slice(0, 3).forEach((m) => {
      headerFields.push({
        tag: m[1],
        textSnippet: m[2].trim().slice(0, 40),
        isDynamicProp: m[2].includes('{'),
      });
    });

    // Array map
    const mapMatch = code.match(/\.map\s*\(\s*\(([^,)\s]+)(?:,\s*([^)\s]+))?\)\s*=>/);
    const itemVar = mapMatch ? mapMatch[1] : '';

    // Item fields
    const itemFields: string[] = [];
    const cleanItemVar = itemVar.replace(/[^\w]/g, '');
    if (cleanItemVar) {
      const regex = new RegExp(`\\b${cleanItemVar}\\.([A-Za-z0-9_]+)\\b`, 'g');
      for (const m of code.matchAll(regex)) {
        if (!itemFields.includes(m[1]) && m[1] !== 'id' && m[1] !== 'map') {
          itemFields.push(m[1]);
        }
      }
    }

    analyses.push({
      filePath: path.relative(process.cwd(), fPath),
      category: cat,
      dataSourceType,
      hasSectionHeader: headerFields.length > 0,
      headerFields,
      itemVariable: itemVar,
      itemFields,
    });
  });
});

console.log('Total analyzed components:', analyses.length);

const catCounts: Record<string, number> = {};
analyses.forEach((a) => {
  catCounts[a.category] = (catCounts[a.category] || 0) + 1;
});
console.log('Category breakdown:', catCounts);

const dataSources: Record<string, number> = {};
analyses.forEach((a) => {
  dataSources[`${a.category}_${a.dataSourceType}`] = (dataSources[`${a.category}_${a.dataSourceType}`] || 0) + 1;
});
console.log('Data source breakdown:', dataSources);

fs.writeFileSync('scratch/deep-analysis.json', JSON.stringify(analyses, null, 2));
console.log('Wrote detailed analysis to scratch/deep-analysis.json');
