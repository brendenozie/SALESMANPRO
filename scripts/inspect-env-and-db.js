const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '..', '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

console.log('--- SalesmanPro Environment Config ---');
console.log('NEXTAUTH_URL:', envConfig.NEXTAUTH_URL);
console.log('NEXT_PUBLIC_APP_URL:', envConfig.NEXT_PUBLIC_APP_URL);
console.log('PORT:', envConfig.PORT || 3000);
console.log('NODE_ENV:', envConfig.NODE_ENV);

// Now test Prisma connection
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'brendenozie@gmail.com' },
      select: { id: true, name: true, email: true, role: true }
    });
    console.log('User brendenozie@gmail.com:', user);

    if (user) {
      const stores = await prisma.store.findMany({
        where: { userId: user.id },
        select: { id: true, name: true, slug: true, domain: true, currency: true }
      });
      console.log('Stores owned by user:', stores);

      if (stores.length > 0) {
        const storeId = stores[0].id;
        const productsCount = await prisma.product.count({ where: { storeId } });
        const ordersCount = await prisma.order.count({ where: { storeId } });
        console.log(`Store [${stores[0].name}] products:`, productsCount, 'orders:', ordersCount);
      }
    }
  } catch (err) {
    console.error('DB inspection error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();

