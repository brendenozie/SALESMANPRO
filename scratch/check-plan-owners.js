const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const url = process.env.DATABASE_URLLL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: { db: { url } }
});

async function main() {
  const plans = await prisma.plan.findMany();
  console.log("=== 4 PLANS SUMMARY ===");
  plans.forEach(p => {
    console.log({
      id: p.id,
      name: p.name,
      category: p.category,
      priceMonthly: p.priceMonthly,
      priceAnnually: p.priceAnnually,
      price: p.price,
      currency: p.currency,
      status: p.status,
      isPopular: p.isPopular,
      companyId: p.companyId
    });
  });

  console.log("\n=== DEFAULT COMPANY ID IN ENV ===");
  console.log("NEXT_PUBLIC_DEFAULT_COMPANY_ID:", process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID);

  console.log("\n=== DOES DEFAULT COMPANY EXIST? ===");
  if (process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID) {
    const c = await prisma.company.findUnique({
      where: { id: process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID },
      select: { id: true, name: true, slug: true }
    });
    console.log("Company with NEXT_PUBLIC_DEFAULT_COMPANY_ID:", c);
  }

  // Check the companyId that owns these plans:
  for (const p of plans) {
    const ownerComp = await prisma.company.findUnique({
      where: { id: p.companyId },
      select: { id: true, name: true, slug: true }
    });
    console.log(`Plan "${p.name}" companyId ${p.companyId} belongs to:`, ownerComp);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
