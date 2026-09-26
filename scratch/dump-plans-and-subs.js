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
    console.log({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      priceMonthly: p.priceMonthly,
      priceAnnually: p.priceAnnually,
      price: p.price,
      currency: p.currency,
      status: p.status,
      isPopular: p.isPopular,
      companyId: p.companyId,
      siteTypePrices: p.siteTypePrices,
      features: p.features
    });
  }

  console.log("\n=== COMPANIES SAMPLE WITH SUBSCRIPTIONS ===");
  const companies = await prisma.company.findMany({
    take: 10,
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      currentTier: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      trialEndsAt: true,
      subscriptionCompanies: {
        include: {
          plan: { select: { id: true, name: true } },
          package: { select: { id: true, title: true } }
        }
      }
    }
  });
  console.log(JSON.stringify(companies, null, 2));

  console.log("\n=== ALL SUBSCRIPTION COMPANY RECORDS (SAMPLE) ===");
  const subs = await prisma.subscriptionCompany.findMany({
    take: 10,
    include: {
      plan: { select: { id: true, name: true } },
      company: { select: { id: true, name: true, slug: true } }
    }
  });
  console.log(JSON.stringify(subs, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
