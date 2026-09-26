const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const url = process.env.DATABASE_URLLL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: { db: { url } }
});

async function main() {
  console.log("=== ALL PLANS IN DB ===");
  const plans = await prisma.plan.findMany();
  console.log("Plans count:", plans.length);
  for (const p of plans) {
    console.log(JSON.stringify(p, null, 2));
  }

  console.log("\n=== SUBSCRIPTIONS ===");
  const subs = await prisma.subscriptionCompany.findMany({
    take: 10,
    include: {
      plan: true,
      company: { select: { id: true, name: true, slug: true } }
    }
  });
  console.log("Sample SubscriptionCompanies:", JSON.stringify(subs, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
