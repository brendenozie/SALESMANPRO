const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyze() {
  const allListings = await prisma.marketplaceListings.findMany({
    select: {
      id: true,
      name: true,
      companyId: true,
      productId: true,
      category: true,
      brand: true,
      company: { select: { slug: true, name: true } }
    }
  });

  console.log(`Total marketplace listings in DB: ${allListings.length}`);

  // Group by company
  const byCompany = {};
  for (const l of allListings) {
    const slug = l.company?.slug || 'unknown';
    if (!byCompany[slug]) byCompany[slug] = [];
    byCompany[slug].push(l);
  }

  for (const [slug, list] of Object.entries(byCompany)) {
    const dummyCount = list.filter(l => 
      l.name.includes('Samsung Galaxy') || 
      l.name.includes('MacBook Pro') || 
      l.name.includes('WH-1000XM5') ||
      l.name.includes('Jordan 1') ||
      l.name.includes('Canon EOS') ||
      l.name.includes('KitchenAid') ||
      l.name.includes('Dyson V15') ||
      l.name.includes("Levi's 501") ||
      l.name.includes('Lego Star Wars') ||
      l.name.includes('Rolex Submariner')
    ).length;

    const realCount = list.length - dummyCount;
    console.log(`Store [${slug}]: total=${list.length}, dummy=${dummyCount}, non-dummy=${realCount}`);
  }

  await prisma.$disconnect();
}

analyze().catch(console.error);
