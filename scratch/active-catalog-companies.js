const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany({
    where: {
      OR: [
        { Product: { some: {} } },
        { marketplaceListings: { some: {} } }
      ]
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      _count: {
        select: {
          Product: true,
          marketplaceListings: true,
          StoreCategory: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Companies with products or listings: ${companies.length}\n`);

  companies.forEach((c, idx) => {
    console.log(`[${idx + 1}] ID: ${c.id}`);
    console.log(`    Name: "${c.name}" | Slug: "${c.slug}" | Domain: "${c.domain || 'N/A'}"`);
    console.log(`    Category: "${c.category || 'N/A'}" | Variant: "${c.variant || 'N/A'}"`);
    console.log(`    User: ${c.user ? `${c.user.email} (${c.user.id})` : `No User (userId: ${c.userId})`}`);
    console.log(`    ShowOnGhuba: ${c.showOnGhuba} | HasWebsite: ${c.hasWebsite}`);
    console.log(`    Counts: Products=${c._count.Product}, Listings=${c._count.marketplaceListings}, StoreCats=${c._count.StoreCategory}`);
    console.log('--------------------------------------------------------------------------------');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
