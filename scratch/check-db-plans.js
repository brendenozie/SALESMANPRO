const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const subs = await prisma.subscriptionCompany.findMany({
    include: { plan: true },
  });
  const statusCounts = {};
  const planCounts = {};
  const companyMap = new Map();

  for (const s of subs) {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
    const planName = s.plan?.name || 'No Plan';
    planCounts[planName] = (planCounts[planName] || 0) + 1;

    const list = companyMap.get(s.companyId) || [];
    list.push(s);
    companyMap.set(s.companyId, list);
  }

  console.log('Status counts:', statusCounts);
  console.log('Plan counts:', planCounts);
  console.log('Unique companies with subscriptions:', companyMap.size);

  let multiCount = 0;
  for (const [cId, list] of companyMap.entries()) {
    if (list.length > 1) {
      multiCount++;
    }
  }
  console.log('Companies with multiple subscriptions:', multiCount);

  // Total companies in DB
  const totalCompanies = await prisma.company.count();
  console.log('Total companies in DB:', totalCompanies);
}

main().catch(console.error).finally(() => prisma.$disconnect());
