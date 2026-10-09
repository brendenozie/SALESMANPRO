#!/bin/bash
echo "=== VPS LOCAL MONGODB INSPECTION ==="
cd /var/www/salesmanpro/current
node -e '
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const [users, companies, products, listings, orders] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.product.count(),
    prisma.marketplaceListings.count(),
    prisma.customerOrder.count()
  ]);
  console.log("VPS Database Counts:");
  console.log("  Users:", users);
  console.log("  Companies:", companies);
  console.log("  Products:", products);
  console.log("  Marketplace Listings:", listings);
  console.log("  Customer Orders:", orders);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
'
