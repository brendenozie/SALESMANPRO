const { execSync } = require('child_process');

const remoteScript = `
cd /var/www/salesmanpro/current || cd /var/www/salesmanpro
node -e "
require('dotenv').config({ path: '/var/www/salesmanpro/shared/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany({
    take: 3,
    select: { id: true, email: true, name: true, role: true, companyId: true }
  });
  console.log('=== Users ===\\n', JSON.stringify(users, null, 2));

  const companies = await prisma.company.findMany({
    take: 3,
    select: { id: true, name: true, slug: true, userId: true }
  });
  console.log('=== Companies ===\\n', JSON.stringify(companies, null, 2));

  const accounts = await prisma.connectedSocialAccount.findMany({
    take: 5,
    select: { id: true, platform: true, accountName: true, accountType: true, companyId: true }
  });
  console.log('=== Connected Accounts ===\\n', JSON.stringify(accounts, null, 2));

  await prisma['\\$disconnect']();
}
run().catch(console.error);
"
`;

try {
  const out = execSync('ssh -p 2222 brenden@161.97.149.171 "bash -s"', {
    input: remoteScript,
    encoding: 'utf-8',
    timeout: 30000,
  });
  console.log(out);
} catch (err) {
  console.error('Remote execution error:', err.message);
  if (err.stdout) console.log('stdout:', err.stdout);
  if (err.stderr) console.error('stderr:', err.stderr);
}
