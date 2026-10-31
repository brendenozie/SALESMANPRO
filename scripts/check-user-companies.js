const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectUserCompanies() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'brendenozie@gmail.com' },
      include: {
        Company: true,
        company: true
      }
    });
    console.log('User found:', { id: user.id, name: user.name, email: user.email });
    console.log('User.Company (created):', user.Company ? user.Company.map(c => ({ id: c.id, name: c.name, slug: c.slug, subDomain: c.subDomain, domain: c.domain })) : 'none');
    console.log('User.company (member):', user.company ? { id: user.company.id, name: user.company.name, slug: user.company.slug } : 'none');

    // Also let's inspect the first company details
    const targetCompany = (user.Company && user.Company[0]) || user.company;
    if (targetCompany) {
      const pCount = await prisma.product.count({ where: { companyId: targetCompany.id } });
      const oCount = await prisma.order.count({ where: { companyId: targetCompany.id } });
      const cCount = await prisma.customer.count({ where: { companyId: targetCompany.id } });
      console.log(`\n=== Target Company [${targetCompany.name}] ===`);
      console.log(`ID: ${targetCompany.id}`);
      console.log(`Slug: ${targetCompany.slug}`);
      console.log(`SubDomain: ${targetCompany.subDomain}`);
      console.log(`Domain: ${targetCompany.domain}`);
      console.log(`Products: ${pCount}, Orders: ${oCount}, Customers: ${cCount}`);

      // Sample products
      const products = await prisma.product.findMany({
        where: { companyId: targetCompany.id },
        take: 5,
        select: { id: true, title: true, price: true, quantity: true, images: true, category: true }
      });
      console.log('Sample Products:', products);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

inspectUserCompanies();
