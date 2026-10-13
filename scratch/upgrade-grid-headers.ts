import fs from 'fs';
import path from 'path';

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function getSectionKey(compName: string, category: string): string {
  if (category === 'category_browser' || compName.toLowerCase().includes('categor')) {
    return 'categories';
  }
  let s = toKebabCase(compName);
  s = s.replace(/-section$/, '');
  return s;
}

function ensureEditableImport(code: string): string {
  if (code.includes('EditableElement')) return code;
  if (code.includes("'use client';") || code.includes('"use client";')) {
    return code.replace(
      /(['"]use client['"];?\r?\n)/,
      "$1import { EditableElement } from '@/contexts/EditableContentContext';\n"
    );
  }
  return "import { EditableElement } from '@/contexts/EditableContentContext';\n" + code;
}

const missing: Array<{ layout: string; comp: string; file: string; cat: string }> = JSON.parse(
  fs.readFileSync('scratch/missing-grid-headers.json', 'utf8')
);

console.log(`Total missing: ${missing.length}`);

let upgradedCount = 0;

missing.forEach((item) => {
  const filePath = path.resolve(item.file);
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Skip sub-components that don't render a section
  if (item.comp === 'ProductCard' || item.comp === 'ProductGrid') return;

  const sectionKey = getSectionKey(item.comp, item.cat);
  let modified = false;

  // 1. Find section title: search for the first <h1, <h2, <h3, <motion.h1, <motion.h2, <motion.h3 before product mapping
  // We match only the section header heading (which appears before any item loop or product list)
  const mapIndex = code.indexOf('.map(');
  const searchLimit = mapIndex > 0 ? mapIndex : code.length;
  const headerCode = code.slice(0, searchLimit);

  const titleRegex = /<(h[1-3]|motion\.h[1-3])([^>]*)>([\s\S]*?)<\/\1>/i;
  const titleMatch = headerCode.match(titleRegex);

  if (titleMatch && !titleMatch[0].includes('targetId=')) {
    const fullTag = titleMatch[0];
    const wrappedTitle = `<EditableElement
              targetId="home.${sectionKey}.title"
              componentKey="${item.comp}"
              elementKey="title"
              label="${item.comp} Title"
            >
              ${fullTag}
            </EditableElement>`;
    code = code.replace(fullTag, wrappedTitle);
    modified = true;
  }

  // 2. Find badge / eyebrow in header
  const badgeRegex = /<(span|p)([^>]*class(?:Name)?=["'][^"']*(?:badge|eyebrow|subheading|tracking-|uppercase|text-\w+-[45]00)[^"']*["'][^>]*)>([\s\S]*?)<\/\1>/i;
  const badgeMatch = code.slice(0, searchLimit).match(badgeRegex);

  if (badgeMatch && !badgeMatch[0].includes('targetId=')) {
    const fullBadge = badgeMatch[0];
    const wrappedBadge = `<EditableElement
              targetId="home.${sectionKey}.badge"
              componentKey="${item.comp}"
              elementKey="badge"
              label="${item.comp} Badge"
              inline
            >
              ${fullBadge}
            </EditableElement>`;
    code = code.replace(fullBadge, wrappedBadge);
    modified = true;
  }

  if (modified) {
    code = ensureEditableImport(code);
    fs.writeFileSync(filePath, code, 'utf8');
    upgradedCount++;
    console.log(`[${upgradedCount}] Upgraded header in [${item.layout}] ${item.comp}`);
  }
});

console.log(`\nSuccessfully upgraded ${upgradedCount} grid & category headers!`);
