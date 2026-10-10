// test-all-prisma.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Testing findMany on all marketplaceListings with relations...");
    const all = await prisma.marketplaceListings.findMany({
      include: {
        company: { select: { name: true } },
        productCategory: true,
        product: true
      }
    });
    console.log(`SUCCESS: Fetched all ${all.length} marketplace listings with product & category relations!`);
    
    console.log("Testing findMany on all Products...");
    const allProds = await prisma.product.findMany();
    console.log(`SUCCESS: Fetched all ${allProds.length} products!`);

    console.log("\nSimulating /api/admin/marketplace-gh query:");
    const adminQuery = await prisma.marketplaceListings.findMany({
      where: {},
      take: 12,
      skip: 0,
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { name: true } },
        productCategory: true,
        product: true
      }
    });
    console.log(`SUCCESS: Admin query returned ${adminQuery.length} listings!`);

    console.log("\nSimulating ghuba.shop public catalog query (showOnGhuba: true, isAvailable: true):");
    const publicQuery = await prisma.marketplaceListings.findMany({
      where: {
        showOnGhuba: true,
        isAvailable: true
      },
      include: {
        company: { select: { name: true } },
        productCategory: true
      }
    });
    console.log(`SUCCESS: Public query returned ${publicQuery.length} active listings!`);

  } catch (err) {
    console.error("PRISMA VERIFICATION ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
