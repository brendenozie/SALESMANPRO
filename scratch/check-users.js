const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const u1 = await prisma.user.findUnique({ where: { id: '67c5b0182e2372b5f2366dbe' } });
  const u2 = await prisma.user.findUnique({ where: { email: 'brendenozie@gmail.com' } });
  console.log('User by ID 67c5b0182e2372b5f2366dbe:', u1);
  console.log('User by Email brendenozie@gmail.com:', u2);
  const allUsers = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, companyId: true } });
  console.log('\nAll Users (' + allUsers.length + '):');
  allUsers.forEach(u => console.log(`- ${u.id} | ${u.email} | ${u.name} | role: ${u.role} | companyId: ${u.companyId}`));
}
main().catch(console.error).finally(() => prisma.$disconnect());
