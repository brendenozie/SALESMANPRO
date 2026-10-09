const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

const dummyNames = [
  "Nike Air Max", "Samsung Galaxy S23", "Dell XPS 13", "Genuine Leather Wallet",
  "Apple Watch Series 8", "Ergonomic Gaming Chair", "JBL Flip 6",
  "KitchenAid Mixer", "Oak Coffee Table", "Sony Bravia 43”", "New Name"
].map(n => n.toLowerCase().trim());

async function main() {
  const allListings = await prisma.marketplaceListings.findMany({
    include: {
      company: { select: { id: true, name: true, slug: true } },
      product: { select: { id: true, name: true } }
    }
  });

  const customListings = allListings.filter(l => {
    const n = (l.name || '').toLowerCase().trim();
    return !dummyNames.includes(n);
  });

  console.log(`Total listings in DB: ${allListings.length}`);
  console.log(`Dummy generated listings: ${allListings.length - customListings.length}`);
  console.log(`Custom/Real/Specific listings: ${customListings.length}\n`);

  customListings.forEach(l => {
    console.log(`- [${l.id}] "${l.name}"`);
    console.log(`    Store: "${l.company?.name}" (${l.company?.slug})`);
    console.log(`    Category: "${l.category}", SubCat: "${l.subCategoryName || JSON.stringify(l.subCategory)}"`);
    console.log(`    Brand: "${l.brand}", Price: ${l.sellingPrice}, Images: ${l.images?.length}`);
    console.log(`    Linked Product: ${l.productId ? `${l.product?.name} (${l.productId})` : 'UNLINKED'}`);
    console.log(`    Ghuba: showOnGhuba=${l.showOnGhuba}, approved=${l.ghubaAdminApproved}, status=${l.ghubaStatus}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
