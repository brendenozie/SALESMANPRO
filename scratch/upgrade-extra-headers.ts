import fs from 'fs';
import path from 'path';

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

// 1. Security2 MarketplaceListingsSection
const sec2File = path.resolve('components/site/layouts/Security2Layout/body/components/MarketplaceListingsSection/index.tsx');
if (fs.existsSync(sec2File)) {
  let code = fs.readFileSync(sec2File, 'utf8');
  code = ensureEditableImport(code);
  code = code.replace(
    /<h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-\[1\.1\]">\s*CRITICAL HARDWARE INVENTORY\s*<\/h2>/,
    `<EditableElement
                targetId="home.marketplace-listings.title"
                componentKey="MarketplaceListingsSection"
                elementKey="title"
                label="Inventory Title"
              >
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.1]">
                  CRITICAL HARDWARE INVENTORY
                </h2>
              </EditableElement>`
  );
  code = code.replace(
    /<p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">\s*HARDWARE_DEPLOYMENT \/\/ STOCKS\s*<\/p>/,
    `<EditableElement
                targetId="home.marketplace-listings.badge"
                componentKey="MarketplaceListingsSection"
                elementKey="badge"
                label="Inventory Badge"
                inline
              >
                <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                  HARDWARE_DEPLOYMENT // STOCKS
                </p>
              </EditableElement>`
  );
  fs.writeFileSync(sec2File, code, 'utf8');
  console.log('Upgraded Security2 MarketplaceListingsSection header');
}

// 2. BlogLayout PopularBlogsSection
const blogFile = path.resolve('components/site/layouts/BlogLayout/body/components/PopularBlogsSection/index.tsx');
if (fs.existsSync(blogFile)) {
  let code = fs.readFileSync(blogFile, 'utf8');
  code = ensureEditableImport(code);
  code = code.replace(
    /<h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase mb-2">\s*Popular Reads\s*<\/h2>/,
    `<EditableElement
              targetId="home.popular-blogs.title"
              componentKey="PopularBlogsSection"
              elementKey="title"
              label="Section Title"
            >
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase mb-2">
                Popular Reads
              </h2>
            </EditableElement>`
  );
  code = code.replace(
    /<p className="text-sm text-slate-400 font-normal">\s*Review our most high-traffic editorial publications and technical analysis boards from the past week\.\s*<\/p>/,
    `<EditableElement
              targetId="home.popular-blogs.description"
              componentKey="PopularBlogsSection"
              elementKey="description"
              label="Section Description"
              type="textarea"
            >
              <p className="text-sm text-slate-400 font-normal">
                Review our most high-traffic editorial publications and technical analysis boards from the past week.
              </p>
            </EditableElement>`
  );
  fs.writeFileSync(blogFile, code, 'utf8');
  console.log('Upgraded BlogLayout PopularBlogsSection header');
}
