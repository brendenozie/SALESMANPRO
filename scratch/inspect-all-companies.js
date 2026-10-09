const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany({
    include: {
      user: { select: { id: true, email: true, name: true } },
      _count: {
        select: {
          Product: true,
          marketplaceListings: true,
          productCategories: true,
          StoreCategory: true,
          customerOrders: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Total companies in DB: ${companies.length}\n`);

  companies.forEach((c, idx) => {
    console.log(`[${idx + 1}] ID: ${c.id}`);
    console.log(`    Name: "${c.name}" | Slug: "${c.slug}" | Domain: "${c.domain || 'N/A'}"`);
    console.log(`    Category: "${c.category || 'N/A'}" | Variant: "${c.variant || 'N/A'}"`);
    console.log(`    ContactEmail: "${c.contactEmail}" | User: ${c.user ? `${c.user.email} (${c.user.id})` : `No User (userId: ${c.userId})`}`);
    console.log(`    ShowOnGhuba: ${c.showOnGhuba} | HasWebsite: ${c.hasWebsite}`);
    console.log(`    Counts: Products=${c._count.Product}, Listings=${c._count.marketplaceListings}, ProdCats=${c._count.productCategories}, StoreCats=${c._count.StoreCategory}, Orders=${c._count.customerOrders}`);
    console.log('--------------------------------------------------------------------------------');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
