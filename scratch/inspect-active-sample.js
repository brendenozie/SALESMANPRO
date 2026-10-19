const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectActive() {
  const listings = await prisma.marketplaceListings.findMany({
    where: { status: 'ACTIVE', isAvailable: true },
    select: {
      id: true,
      name: true,
      finalPrice: true,
      sellingPrice: true,
      images: true,
      company: { select: { name: true, slug: true } },
      productCategory: { select: { name: true } },
      isFlashDeal: true,
      isNewArrival: true,
      isDiscounted: true,
      isFeatured: true,
    },
    take: 30
  });

  console.log("Sample 30 Active Listings in DB:");
  listings.forEach((l, i) => {
    const img = Array.isArray(l.images) && l.images[0] ? (typeof l.images[0] === 'string' ? l.images[0] : l.images[0]?.url) : 'NO_IMAGE';
    console.log(`${i+1}. [${l.company?.name}] "${l.name}" | Cat: ${l.productCategory?.name} | KES ${l.finalPrice || l.sellingPrice} | Img: ${img.substring(0, 50)}...`);
  });

  await prisma.$disconnect();
}

inspectActive();
