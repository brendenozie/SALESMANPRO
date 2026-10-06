const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { resolveCanonicalTemplate } = require('../lib/website-builder/template-registry');

async function main() {
  const companies = await prisma.company.findMany({
    select: { id: true, name: true, slug: true, category: true, variant: true, website: true },
    orderBy: { slug: 'asc' }
  });
  console.log('Total live companies in DB:', companies.length);
  const rows = [];
  for (const c of companies) {
    const isGhuba = c.slug === 'ghuba' || c.slug === 'ghubamarketplace';
    const tmpl = isGhuba 
      ? resolveCanonicalTemplate('portal', 'ghuba', 'ghuba@v1')
      : resolveCanonicalTemplate(c.category || '', c.variant || '', c.website ? c.website.templateKey : undefined);
    rows.push({
      slug: c.slug,
      name: c.name,
      category: c.category,
      variant: c.variant,
      themeId: tmpl ? tmpl.id : 'UNRESOLVED',
      layoutFolder: tmpl ? tmpl.layoutFolder : 'UNKNOWN',
      bodyComponent: tmpl ? tmpl.bodyComponent : 'UNKNOWN'
    });
  }
  console.log(JSON.stringify(rows, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
