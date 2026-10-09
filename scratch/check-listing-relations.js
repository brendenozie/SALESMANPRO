const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRelations() {
  const orderItems = await prisma.orderItem.findMany({ select: { marketplaceListingId: true } });
  const referencedListingIds = new Set(orderItems.map(o => o.marketplaceListingId).filter(Boolean));
  console.log(`Unique marketplaceListingIds referenced by OrderItem: ${referencedListingIds.size}`);
  console.log([...referencedListingIds]);

  const userActivities = await prisma.userActivity.findMany({ 
    where: { marketplaceListingId: { not: null } },
    select: { marketplaceListingId: true } 
  });
  console.log(`Unique marketplaceListingIds in UserActivity: ${userActivities.length}`);

  const reviews = await prisma.productReview.findMany({
    where: { marketplaceListingId: { not: null } },
    select: { marketplaceListingId: true }
  });
  console.log(`Unique marketplaceListingIds in ProductReview: ${reviews.length}`);

  await prisma.$disconnect();
}

checkRelations().catch(console.error);
