import fs from 'fs';
import path from 'path';

interface Profile {
  layout: string;
  componentName: string;
  category: string;
  filePath: string;
}

const audit: Profile[] = JSON.parse(fs.readFileSync('scratch/comprehensive-component-audit.json', 'utf8'));
const prodAndCat = audit.filter((c) => c.category === 'product_grid' || c.category === 'category_browser');

interface Analysis {
  layout: string;
  comp: string;
  file: string;
  hasTitle: boolean;
  titleSnippet?: string;
  hasBadge: boolean;
  badgeSnippet?: string;
}

const results: Analysis[] = [];

prodAndCat.forEach((c) => {
  const code = fs.readFileSync(c.filePath, 'utf8');
  if (/targetId=\{?["'`][^"'`]*(?:title|headline|heading|badge|eyebrow)[^"'`]*["'`]/i.test(code)) {
    return; // Already has header targetId
  }

  const titleMatch = code.match(/<(h[1-3]|motion\.h[1-3])([^>]*)>([\s\S]*?)<\/\1>/i);
  const badgeMatch = code.match(/<(?:span|p|div)([^>]*class(?:Name)?=["'][^"']*(?:badge|eyebrow|subheading|tracking-|uppercase|text-\w+-[45]00)[^"']*["'][^>]*)>([\s\S]*?)<\/(?:span|p|div)>/i);

  results.push({
    layout: c.layout,
    comp: c.componentName,
    file: c.filePath,
    hasTitle: !!titleMatch,
    titleSnippet: titleMatch ? titleMatch[0].slice(0, 60).replace(/\s+/g, ' ') : undefined,
    hasBadge: !!badgeMatch,
    badgeSnippet: badgeMatch ? badgeMatch[0].slice(0, 60).replace(/\s+/g, ' ') : undefined,
  });
});

console.log(`Components needing header upgrade: ${results.length}`);
console.log(`With detected title: ${results.filter((r) => r.hasTitle).length}`);
console.log(`With detected badge: ${results.filter((r) => r.hasBadge).length}`);

fs.writeFileSync('scratch/missing-grid-headers.json', JSON.stringify(results, null, 2), 'utf8');
