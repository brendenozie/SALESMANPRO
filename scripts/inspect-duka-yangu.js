const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectDukaYangu() {
  const companyId = '6825c2c7969ab9f16f620f67';
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    console.log('Company:', company.name, 'slug:', company.slug);

    const products = await prisma.product.findMany({
      where: { companyId },
      select: { id: true, name: true, sellingPrice: true, costPrice: true, images: true, brand: true, active: true },
      take: 10
    });
    console.log(`Products in ${company.name} (${products.length}):`, products);

    const orders = await prisma.customerOrder.findMany({
      where: { companyId },
      take: 5
    });
    console.log(`Customer Orders count:`, orders.length);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

inspectDukaYangu();
