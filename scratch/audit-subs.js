const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const url = process.env.DATABASE_URLLL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: { db: { url } }
});

async function main() {
  console.log("=== INSPECTING ALL 53 SUBSCRIPTION COMPANY RECORDS ===");
  const allSubs = await prisma.subscriptionCompany.findMany({
    include: {
      plan: true,
      package: true,
      company: {
        select: { id: true, name: true, slug: true }
      }
    }
  });

  console.log(`Total SubscriptionCompany records: ${allSubs.length}`);

  let withPlan = 0;
  let withoutPlan = 0;
  let withPackage = 0;
  const statusCounts = {};

  for (const s of allSubs) {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
    if (s.plan) withPlan++;
    else withoutPlan++;
    if (s.package) withPackage++;
  }

  console.log("Status distribution:", statusCounts);
  console.log(`With plan: ${withPlan}, Without plan: ${withoutPlan}, With package: ${withPackage}`);

  console.log("\nSample 15 subscriptions:");
  allSubs.slice(0, 15).forEach(s => {
    console.log({
      id: s.id,
      companyName: s.company?.name,
      companySlug: s.company?.slug,
      status: s.status,
      planId: s.planId,
      planName: s.plan?.name,
      packageId: s.packageId,
      packageTitle: s.package?.title,
      renewalDate: s.renewalDate,
      trialEndsAt: s.trialEndsAt,
      billingCycle: s.billingCycle,
      createdAt: s.createdAt
    });
  });

  console.log("\nSubscriptions where plan is NULL:");
  allSubs.filter(s => !s.plan).slice(0, 10).forEach(s => {
    console.log({
      id: s.id,
      companyName: s.company?.name,
      companySlug: s.company?.slug,
      status: s.status,
      planId: s.planId,
      packageId: s.packageId,
      packageTitle: s.package?.title
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
