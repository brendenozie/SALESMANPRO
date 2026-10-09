const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const orderItems = await prisma.orderItem.findMany({
    select: {
      id: true,
      productId: true,
      marketplaceListingId: true,
      orderId: true,
      price: true,
      quantity: true,
      product: { select: { id: true, name: true, companyId: true } },
      marketplaceListing: { select: { id: true, name: true, companyId: true } }
    }
  });

  console.log(`Found ${orderItems.length} OrderItems:`);
  orderItems.forEach(oi => {
    console.log(`- Item [${oi.id}]: orderId=${oi.orderId}, price=${oi.price}, qty=${oi.quantity}`);
    console.log(`    productId=${oi.productId} (${oi.product?.name || 'NO_PROD'}), listingId=${oi.marketplaceListingId} (${oi.marketplaceListing?.name || 'NO_LISTING'})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
