const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runAudit() {
  console.log("=== GHUBA CATALOG INVENTORY AUDIT (READ-ONLY) ===");
  
  // Total raw listings
  const totalListings = await prisma.marketplaceListings.count();
  console.log(`Total Marketplace Listings in DB: ${totalListings}`);

  // Base Ghuba public where clause (from lib/ghuba-fetcher.ts)
  const ghubaPublicWhere = {
    status: "ACTIVE",
    isAvailable: true,
    AND: [
      {
        OR: [
          { ghubaAdminApproved: true },
          { ghubaAdminApproved: null },
          { ghubaAdminApproved: { isSet: false } },
        ],
      },
      {
        OR: [
          { ghubaStatus: "APPROVED" },
          { ghubaStatus: null },
          { ghubaStatus: { isSet: false } },
        ],
      },
    ],
  };

  const activeGhubaListings = await prisma.marketplaceListings.findMany({
    where: ghubaPublicWhere,
    select: {
      id: true,
      name: true,
      description: true,
      images: true,
      finalPrice: true,
      sellingPrice: true,
      isAvailable: true,
      quantity: true,
      category: true,
      productCategoryId: true,
      productCategory: { select: { id: true, name: true, slug: true } },
      companyId: true,
      company: { select: { id: true, name: true, slug: true } },
      isFlashDeal: true,
      isDiscounted: true,
      isNewArrival: true,
      isFeatured: true,
    }
  });

  console.log(`Active Public Ghuba Listings: ${activeGhubaListings.length}`);

  let purchasable = 0;
  let hasImage = 0;
  let noImage = 0;
  let hasPrice = 0;
  let zeroPrice = 0;
  let hasDescription = 0;
  let shortOrNoDesc = 0;
  let suitableForPromo = 0;

  const categoryCounts = {};
  const sellerCounts = {};

  for (const item of activeGhubaListings) {
    const images = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
    const price = item.finalPrice || item.sellingPrice || 0;
    const desc = item.description || "";

    const isImageValid = images.length > 0 && images.some(img => {
      const url = typeof img === 'string' ? img : img?.url;
      return url && typeof url === 'string' && url.trim().length > 5;
    });

    if (isImageValid) hasImage++;
    else noImage++;

    if (price > 0) hasPrice++;
    else zeroPrice++;

    if (item.isAvailable && price > 0 && (item.quantity === null || item.quantity === undefined || item.quantity > 0)) {
      purchasable++;
    }

    if (desc && desc.trim().length >= 20 && !desc.toLowerCase().includes("dummy")) {
      hasDescription++;
    } else {
      shortOrNoDesc++;
    }

    if (isImageValid && price > 0 && item.isAvailable && item.name && item.name.trim().length >= 3) {
      suitableForPromo++;
    }

    const catName = item.productCategory?.name || item.category || "Uncategorized";
    categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;

    const sellerName = item.company?.name || item.companyId || "Unknown Store";
    sellerCounts[sellerName] = (sellerCounts[sellerName] || 0) + 1;
  }

  console.log("\n--- Breakdown ---");
  console.log(`1. Active Public Listings: ${activeGhubaListings.length}`);
  console.log(`2. Genuinely Purchasable (Price > 0, available, in stock): ${purchasable}`);
  console.log(`3. With Valid Images: ${hasImage} | Missing/Empty Images: ${noImage}`);
  console.log(`4. With Price > 0: ${hasPrice} | Zero/Missing Price: ${zeroPrice}`);
  console.log(`5. Meaningful Description (>= 20 chars): ${hasDescription} | Incomplete/Missing: ${shortOrNoDesc}`);
  console.log(`6. High-Quality Suitable for Homepage Promotion: ${suitableForPromo}`);

  console.log("\n--- Category Coverage ---");
  const allCategories = await prisma.productCategory.findMany({
    select: { id: true, name: true, isFeatured: true, visible: true },
    orderBy: { name: 'asc' }
  });
  console.log(`Total Product Categories in DB: ${allCategories.length}`);
  console.log("Category Listing Distribution:");
  for (const cat of allCategories) {
    const count = categoryCounts[cat.name] || 0;
    console.log(`  - [${cat.name}] (Featured: ${cat.isFeatured}, Visible: ${cat.visible}): ${count} listings`);
  }
  if (categoryCounts["Uncategorized"]) {
    console.log(`  - [Uncategorized]: ${categoryCounts["Uncategorized"]} listings`);
  }

  console.log("\n--- Active Merchant Stores ---");
  for (const [seller, count] of Object.entries(sellerCounts)) {
    console.log(`  - ${seller}: ${count} listings`);
  }

  // Check section counts on homepage
  console.log("\n--- Homepage Section Feasibility ---");
  const flashDealsCount = activeGhubaListings.filter(l => l.isFlashDeal).length;
  const newArrivalsCount = activeGhubaListings.filter(l => l.isNewArrival).length;
  const discountsCount = activeGhubaListings.filter(l => l.isDiscounted).length;
  const featuredCount = activeGhubaListings.filter(l => l.isFeatured).length;
  console.log(`Flash Deals tagged: ${flashDealsCount}`);
  console.log(`New Arrivals tagged: ${newArrivalsCount}`);
  console.log(`Discounted tagged: ${discountsCount}`);
  console.log(`Featured tagged: ${featuredCount}`);

  await prisma.$disconnect();
}

runAudit().catch(err => {
  console.error("Audit error:", err);
  process.exit(1);
});
