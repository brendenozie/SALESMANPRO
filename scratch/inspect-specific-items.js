const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const specific = await prisma.marketplaceListings.findMany({
    where: {
      name: {
        in: [
          '7-Day Luxury Safari to Maasai Mara',
          'Awesome Apartments',
          'Fish Fry',
          'Corporate & Business Law',
          'Stepping Out: Life Skills Program',
          'Sample Programs book',
          'Bata Premium',
          'Sony Sample Title'
        ]
      }
    },
    include: { company: { select: { slug: true, name: true } } }
  });

  console.log(`Found ${specific.length} specific items:`);
  console.log(JSON.stringify(specific.map(s => ({
    id: s.id,
    store: s.company?.slug,
    name: s.name,
    category: s.category,
    subCategory: s.subCategory,
    price: s.sellingPrice,
    productId: s.productId,
    images: s.images
  })), null, 2));

  await prisma.$disconnect();
}

run().catch(console.error);
