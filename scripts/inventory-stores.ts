import * as fs from 'fs';
import * as path from 'path';

const layoutsDir = path.resolve(__dirname, '../components/site/layouts');
const subdirs = fs.readdirSync(layoutsDir).filter(f => {
  const full = path.join(layoutsDir, f);
  return fs.statSync(full).isDirectory();
});

interface StoreInventoryItem {
  id: string;
  name: string;
  folder: string;
  bodySiteComponent: string;
  hasHeader: boolean;
  hasFooter: boolean;
  hasBody: boolean;
  cardComponents: string[];
  backdropFilterOccurrences: number;
  unoptimizedImageOccurrences: number;
  scrollListenerOccurrences: number;
  virtualizerOccurrences: number;
  returnNullOccurrences: number;
  framerMotionOccurrences: number;
}

function countMatchesInDir(dir: string, regex: RegExp): number {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countMatchesInDir(full, regex);
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js|css)$/.test(entry.name)) {
      try {
        const content = fs.readFileSync(full, 'utf8');
        const matches = content.match(regex);
        if (matches) count += matches.length;
      } catch {}
    }
  }
  return count;
}

function findCardDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const cards: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (/card/i.test(entry.name)) {
        cards.push(entry.name);
      }
      cards.push(...findCardDirs(full));
    }
  }
  return Array.from(new Set(cards));
}

const inventory: StoreInventoryItem[] = [];

subdirs.sort().forEach((folder, idx) => {
  const storeId = `STORE-${String(idx + 1).padStart(3, '0')}`;
  const storePath = path.join(layoutsDir, folder);
  const bodyPath = path.join(storePath, 'body');
  const headerPath = path.join(storePath, 'header');
  const footerPath = path.join(storePath, 'footer');

  let bodySiteComponent = '';
  if (fs.existsSync(bodyPath)) {
    const bodyFiles = fs.readdirSync(bodyPath);
    const siteFile = bodyFiles.find(f => /Site\.(tsx|jsx|js|ts)$/.test(f));
    if (siteFile) bodySiteComponent = siteFile.replace(/\.(tsx|jsx|js|ts)$/, '');
  }

  const cards = findCardDirs(storePath);

  const backdropCount = countMatchesInDir(storePath, /backdrop-blur|backdrop-filter/g);
  const unoptimizedCount = countMatchesInDir(storePath, /unoptimized/g);
  const scrollListenerCount = countMatchesInDir(storePath, /addEventListener\(['"]scroll/g);
  const virtualizerCount = countMatchesInDir(storePath, /useWindowVirtualizer|useVirtualizer/g);
  const returnNullCount = countMatchesInDir(storePath, /return\s+null\s*;/g);
  const framerMotionCount = countMatchesInDir(storePath, /from\s+['"]framer-motion['"]|motion\./g);

  inventory.push({
    id: storeId,
    name: folder.replace(/Layout$/, ''),
    folder,
    bodySiteComponent,
    hasHeader: fs.existsSync(headerPath),
    hasFooter: fs.existsSync(footerPath),
    hasBody: fs.existsSync(bodyPath),
    cardComponents: cards,
    backdropFilterOccurrences: backdropCount,
    unoptimizedImageOccurrences: unoptimizedCount,
    scrollListenerOccurrences: scrollListenerCount,
    virtualizerOccurrences: virtualizerCount,
    returnNullOccurrences: returnNullCount,
    framerMotionOccurrences: framerMotionCount,
  });
});

fs.writeFileSync(path.resolve(__dirname, '../docs/performance/inventory.json'), JSON.stringify(inventory, null, 2));
console.log(`Successfully generated inventory for ${inventory.length} storefronts at docs/performance/inventory.json`);
