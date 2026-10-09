const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const [users, companies, products, listings, orders] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.product.count(),
    prisma.marketplaceListings.count(),
    prisma.customerOrder.count()
  ]);
  console.log("=== VPS MONGODB LIVE COUNTS ===");
  console.log("  Users:", users);
  console.log("  Companies:", companies);
  console.log("  Products:", products);
  console.log("  Marketplace Listings:", listings);
  console.log("  Customer Orders:", orders);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
