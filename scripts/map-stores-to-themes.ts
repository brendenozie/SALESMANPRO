import { TEMPLATE_REGISTRY, resolveCanonicalTemplate } from '../lib/website-builder/template-registry';
import prisma from '../server/db/prismadb';
import fs from 'fs';
import path from 'path';

async function main() {
  const templates = Object.entries(TEMPLATE_REGISTRY);
  console.log('Total Canonical Templates in Registry:', templates.length);

  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      variant: true,
      website: true,
    }
  });

  console.log('Total Store Instances (Companies) in DB:', companies.length);

  const themeToStores = new Map<string, any>();
  for (const [key, tmpl] of templates) {
    themeToStores.set(tmpl.id, {
      templateKey: key,
      name: tmpl.name,
      layoutFolder: tmpl.layoutFolder,
      bodyComponent: tmpl.bodyComponent,
      category: tmpl.category,
      authenticSections: tmpl.authenticSections?.map(s => s.component) || [],
      stores: []
    });
  }

  const unmappedStores = [];

  for (const company of companies) {
    const isGhuba = company.slug === 'ghuba' || company.slug === 'ghubamarketplace';
    const tmpl = isGhuba 
      ? resolveCanonicalTemplate('portal', 'ghuba', 'ghuba@v1')
      : resolveCanonicalTemplate(company.category || '', company.variant || '', (company.website as any)?.templateKey);

    if (tmpl && themeToStores.has(tmpl.id)) {
      themeToStores.get(tmpl.id).stores.push({
        id: company.id,
        name: company.name,
        slug: company.slug,
        category: company.category,
        variant: company.variant,
      });
    } else {
      unmappedStores.push({
        id: company.id,
        name: company.name,
        slug: company.slug,
        resolvedTemplate: tmpl?.id || 'UNKNOWN'
      });
    }
  }

  let mappedStoresCount = 0;
  let themesWithStores = 0;
  let themesWithoutStores = 0;

  for (const [id, data] of themeToStores.entries()) {
    mappedStoresCount += data.stores.length;
    if (data.stores.length > 0) {
      themesWithStores++;
    } else {
      themesWithoutStores++;
    }
  }

  console.log('Mapped Store Instances:', mappedStoresCount);
  console.log('Unmapped Store Instances:', unmappedStores.length);
  console.log('Themes with active store instances in DB:', themesWithStores);
  console.log('Themes without active store instances in DB (unseeded/standby):', themesWithoutStores);

  const summary = Array.from(themeToStores.entries()).map(([id, d]) => ({
    id,
    name: d.name,
    layoutFolder: d.layoutFolder,
    bodyComponent: d.bodyComponent,
    category: d.category,
    storeCount: d.stores.length,
    stores: d.stores.map((s: any) => s.slug),
    authenticSections: d.authenticSections
  }));

  const outputPath = path.join(__dirname, '..', 'docs', 'performance', 'theme-to-store-mapping.json');
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  console.log('Saved mapping to', outputPath);

  for (const s of summary) {
    if (s.storeCount > 0) {
      console.log(`[${s.id}] ${s.name} (${s.layoutFolder}) -> ${s.storeCount} stores: ${s.stores.join(', ')}`);
    }
  }
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
});
