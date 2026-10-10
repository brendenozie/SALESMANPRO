// test-prisma-query.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Attempting prisma.marketplaceListings.findMany...");
    const listings = await prisma.marketplaceListings.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { name: true } },
        productCategory: true
      }
    });
    console.log(`Success! Fetched ${listings.length} listings.`);
  } catch (err) {
    console.error("PRISMA ERROR REPRODUCED:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
