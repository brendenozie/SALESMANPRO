const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const total = await p.marketplaceListings.count();
  const onGhuba = await p.marketplaceListings.count({ where: { showOnGhuba: true } });
  const active = await p.marketplaceListings.count({ where: { status: 'ACTIVE' } });
  const approved = await p.marketplaceListings.count({ where: { ghubaStatus: 'APPROVED' } });
  const adminApproved = await p.marketplaceListings.count({ where: { ghubaAdminApproved: true } });
  const sample = await p.marketplaceListings.findFirst();
  const flashDeals = await p.marketplaceListings.count({ where: { isFlashDeal: true } });
  const newArrivals = await p.marketplaceListings.count({ where: { isNewArrival: true } });
  const discounts = await p.marketplaceListings.count({ where: { isDiscounted: true } });
  const activeListing = await p.marketplaceListings.findFirst({
    where: { status: 'ACTIVE' }
  });
  console.log("Raw active listing keys:", Object.keys(activeListing || {}));
  console.log("Active listing sample:", {
    id: activeListing?.id,
    name: activeListing?.name,
    status: activeListing?.status,
    showOnGhuba: activeListing?.showOnGhuba,
    ghubaStatus: activeListing?.ghubaStatus,
    ghubaAdminApproved: activeListing?.ghubaAdminApproved,
  });
  const updatedAll = await p.marketplaceListings.updateMany({
    where: { status: 'ACTIVE' },
    data: {
      ghubaStatus: 'APPROVED',
      ghubaAdminApproved: true,
      showOnGhuba: true,
    }
  });
  console.log("Updated with status ACTIVE count:", updatedAll.count);
  await p.$disconnect();
}

main().catch(console.error);
