// Check Company fields and owner-specific companies
const { PrismaClient } = require('../node_modules/.prisma/client');
const p = new PrismaClient();

async function main() {
  // First try without filter to see total count and field names
  const sample = await p.company.findFirst();
  if (sample) {
    console.log('Company fields:', JSON.stringify(Object.keys(sample)));
  } else {
    console.log('No companies found at all!');
  }

  const total = await p.company.count();
  console.log('Total companies:', total);

  // Try different possible user field names
  const byUserId = await p.company.count({ where: { userId: '67c5b0182e2372b5f2366dbe' } });
  console.log('Companies with userId=target:', byUserId);

  // Also check the user relation
  const userEmail = await p.user.findFirst({ where: { email: 'brendenozie@gmail.com' } });
  if (userEmail) {
    console.log('User found:', userEmail.id, userEmail.email);
    const byUser = await p.company.count({ where: { userId: userEmail.id } });
    console.log('Companies by email lookup userId:', byUser);
  } else {
    console.log('User brendenozie@gmail.com NOT found in User collection');
  }
}

main().catch(console.error).finally(() => p.$disconnect());
