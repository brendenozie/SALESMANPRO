const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const allOrders = await prisma.customerOrder.count();
  const deletedOrders = await prisma.customerOrder.count({ where: { deletedAt: { not: null } } });
  const activeOrders = await prisma.customerOrder.count({ where: { deletedAt: null } });
  console.log({ allOrders, deletedOrders, activeOrders });

  // Check mongodb directly via prisma.$runCommandRaw if available
  try {
    const rawCount = await prisma.$runCommandRaw({ count: 'CustomerOrder' });
    console.log("Raw count CustomerOrder:", rawCount);
    const rawOrderItems = await prisma.$runCommandRaw({ count: 'OrderItem' });
    console.log("Raw count OrderItem:", rawOrderItems);
  } catch (e) {
    console.log("runCommandRaw err:", e.message);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
