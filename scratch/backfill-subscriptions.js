/**
 * backfill-subscriptions.js
 *
 * Creates a 14-day TRIALING SubscriptionCompany record for every Company
 * that currently has zero subscription records.
 *
 * Safe to run multiple times — idempotent.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== BACKFILL: Trial Subscriptions for Existing Companies ===\n");

  // 1. Resolve the trial plan (prefer Ghuba Starter, fallback to Ghuba Basic)
  const trialPlan = await prisma.plan.findFirst({
    where: {
      OR: [
        { name: "Ghuba Starter" },
        { name: "Ghuba Basic" },
      ],
      status: "ACTIVE",
    },
    orderBy: { priceMonthly: "desc" },
  });

  if (!trialPlan) {
    console.error("No active Ghuba Starter or Basic plan found in DB. Aborting.");
    process.exit(1);
  }

  console.log('Trial plan resolved: "' + trialPlan.name + '" (' + trialPlan.id + ')\n');

  // 2. Find all companies with no SubscriptionCompany records
  const companiesWithNoSub = await prisma.company.findMany({
    where: {
      subscriptionCompanies: { none: {} },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      userId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log('Found ' + companiesWithNoSub.length + ' companies with no subscription records.\n');

  if (companiesWithNoSub.length === 0) {
    console.log("All companies already have subscription records. Nothing to backfill.");
    return;
  }

  const now = new Date();
  const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  let created = 0;
  let failed = 0;

  for (const company of companiesWithNoSub) {
    try {
      await prisma.subscriptionCompany.create({
        data: {
          companyId: company.id,
          userId: company.userId,
          planId: trialPlan.id,
          status: "TRIALING",
          billingCycle: "TRIAL",
          amountPaid: 0,
          currency: "KES",
          startedAt: company.createdAt ?? now,
          renewalDate: trialEnd,
          trialEndsAt: trialEnd,
          meta: {
            isTrial: true,
            trialDays: 14,
            trialEndsAt: trialEnd.toISOString(),
            planName: trialPlan.name,
            backfilled: true,
            backfilledAt: now.toISOString(),
          },
        },
      });
      created++;
      console.log('  OK [' + created + '] ' + company.name + ' (' + company.id + ') — ' + company.category);
    } catch (err) {
      console.error('  FAIL ' + company.name + ' (' + company.id + '): ' + err.message);
      failed++;
    }
  }

  console.log("\n=== BACKFILL COMPLETE ===");
  console.log("  Created : " + created);
  console.log("  Failed  : " + failed);
  console.log("  Plan    : " + trialPlan.name);
  console.log("  Expires : " + trialEnd.toISOString());
}

main()
  .catch((e) => { console.error("Fatal:", e); process.exit(1); })
  .finally(() => prisma.());
