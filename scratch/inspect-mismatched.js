const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectMismatched() {
  const listings = await prisma.marketplaceListings.findMany({
    where: {
      name: { in: ['Dell XPS 13', 'Sony Bravia 43"', 'Nike Air Max'] }
    },
    select: {
      id: true,
      name: true,
      images: true,
      finalPrice: true,
      sellingPrice: true,
      company: { select: { id: true, name: true, slug: true } },
      productCategory: { select: { name: true } },
      status: true,
      isAvailable: true,
      createdAt: true
    }
  });

  console.log("Listings found:", listings.length);
  for (const l of listings) {
    console.log(`\nID: ${l.id} | Name: "${l.name}" | Store: ${l.company?.name} (${l.company?.slug})`);
    console.log(`Price: KES ${l.finalPrice || l.sellingPrice} | Category: ${l.productCategory?.name}`);
    console.log(`Images: ${JSON.stringify(l.images)}`);
    console.log(`Created: ${l.createdAt}`);
  }

  await prisma.$disconnect();
}

inspectMismatched();
