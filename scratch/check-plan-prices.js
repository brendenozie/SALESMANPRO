const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const url = process.env.DATABASE_URLLL || process.env.DATABASE_URL;
const prisma = new PrismaClient({ datasources: { db: { url } } });

async function main() {
  const plans = await prisma.plan.findMany();
  for (const p of plans) {
    console.log(`Plan: ${p.name}`);
    console.log(`  priceMonthly: ${p.priceMonthly}, priceAnnually: ${p.priceAnnually}, price: ${p.price}`);
    console.log(`  siteTypePrices keys:`, p.siteTypePrices ? Object.keys(p.siteTypePrices).length : 'none');
    if (p.siteTypePrices) {
      console.log(`  siteTypePrices["Default"]:`, p.siteTypePrices["Default"]);
      console.log(`  siteTypePrices["ecommerce"]:`, p.siteTypePrices["ecommerce"]);
      console.log(`  siteTypePrices["School"]:`, p.siteTypePrices["School"]);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
