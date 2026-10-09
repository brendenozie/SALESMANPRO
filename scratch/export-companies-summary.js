const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
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

  const summary = companies.map((c, i) => ({
    index: i + 1,
    id: c.id,
    name: c.name,
    slug: c.slug,
    domain: c.domain,
    category: c.category,
    variant: c.variant,
    contactEmail: c.contactEmail,
    userId: c.userId,
    userEmail: c.user?.email || null,
    showOnGhuba: c.showOnGhuba,
    hasWebsite: c.hasWebsite,
    counts: c._count
  }));

  fs.writeFileSync('scratch/companies_summary.json', JSON.stringify(summary, null, 2));
  console.log(`Saved ${summary.length} companies to scratch/companies_summary.json`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
