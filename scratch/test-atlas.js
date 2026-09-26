const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testConnection(url, label) {
  console.log(`Testing ${label}...`);
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  });

  try {
    const planCount = await prisma.plan.count();
    console.log(`[${label}] SUCCESS! Plan count:`, planCount);
    const companyCount = await prisma.company.count();
    console.log(`[${label}] SUCCESS! Company count:`, companyCount);
    const subCompCount = await prisma.subscriptionCompany.count();
    console.log(`[${label}] SUCCESS! SubscriptionCompany count:`, subCompCount);
    return true;
  } catch (err) {
    console.log(`[${label}] FAILED:`, err.message.slice(0, 300));
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const atlasUrl = process.env.DATABASE_URLLL;
  if (atlasUrl) {
    await testConnection(atlasUrl, 'DATABASE_URLLL (Atlas)');
  }
}

main().catch(console.error);
