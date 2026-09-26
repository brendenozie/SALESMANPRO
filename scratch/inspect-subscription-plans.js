const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== CHECKING PLANS ===");
  const planCount = await prisma.plan.count();
  console.log("Total Plans:", planCount);
  const plans = await prisma.plan.findMany({ take: 20 });
  console.log("Sample Plans:", JSON.stringify(plans, null, 2));

  console.log("\n=== CHECKING PACKAGES ===");
  const pkgCount = await prisma.package.count();
  console.log("Total Packages:", pkgCount);
  const pkgs = await prisma.package.findMany({ take: 10 });
  console.log("Sample Packages:", JSON.stringify(pkgs, null, 2));

  console.log("\n=== CHECKING SUBSCRIPTION COMPANIES ===");
  const subCompCount = await prisma.subscriptionCompany.count();
  console.log("Total SubscriptionCompany records:", subCompCount);
  const subComps = await prisma.subscriptionCompany.findMany({ 
    take: 10,
    include: {
      plan: true,
      company: { select: { id: true, name: true, slug: true, category: true } }
    }
  });
  console.log("Sample SubscriptionCompany records:", JSON.stringify(subComps, null, 2));

  console.log("\n=== CHECKING SUBSCRIPTIONS ===");
  const subCount = await prisma.subscription.count();
  console.log("Total Subscription records:", subCount);
  const subs = await prisma.subscription.findMany({ take: 10, include: { plan: true } });
  console.log("Sample Subscriptions:", JSON.stringify(subs, null, 2));

  console.log("\n=== CHECKING COMPANIES ===");
  const compCount = await prisma.company.count();
  console.log("Total Companies:", compCount);
  const comps = await prisma.company.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      subscriptionCompanies: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          status: true,
          trialEndsAt: true,
          plan: { select: { name: true, priceMonthly: true } }
        }
      },
      _count: {
        select: {
          subscriptionCompanies: true,
        }
      }
    }
  });
  console.log("Sample Companies:", JSON.stringify(comps, null, 2));
}

main()
  .catch(e => console.error("Error running script:", e))
  .finally(() => prisma.$disconnect());
