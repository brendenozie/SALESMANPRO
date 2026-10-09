const { PrismaClient } = require('@prisma/client');
const os = require('os');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkHostAndTarget() {
  console.log('=== EXECUTION HOST METADATA ===');
  console.log('OS Platform:', os.platform(), os.release());
  console.log('OS Hostname:', os.hostname());
  console.log('Node Version:', process.version);
  console.log('Process CWD:', process.cwd());
  console.log('User Domain/Name:', process.env.USERDOMAIN || process.env.USERNAME || 'N/A');

  console.log('\n=== DATABASE TARGET METADATA (REDACTED) ===');
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl) {
    console.log('DATABASE_URL is not set!');
  } else {
    try {
      const parsed = new URL(dbUrl.replace(/^prisma\+mongodb:\/\//, 'mongodb://'));
      console.log('Protocol:', parsed.protocol);
      console.log('Host:', parsed.host);
      console.log('Port:', parsed.port || 'default');
      console.log('Database Name:', parsed.pathname.replace(/^\//, ''));
      console.log('Query Params:', parsed.search);
      console.log('Auth Present:', parsed.username ? `Yes (User: ${parsed.username.slice(0, 3)}***)` : 'No');
    } catch (e) {
      // Fallback regex redactor
      const redacted = dbUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
      console.log('Redacted URL:', redacted);
    }
  }

  // Query MongoDB buildInfo and serverStatus via Prisma raw command
  try {
    const buildInfo = await prisma.$runCommandRaw({ buildInfo: 1 });
    console.log('\n=== MONGODB ATLAS SERVER BUILD INFO ===');
    console.log('MongoDB Version:', buildInfo.version);
    console.log('Git Version:', buildInfo.gitVersion);
    console.log('Target Architecture:', buildInfo.buildEnvironment?.target_arch || 'N/A');
    console.log('Max BSON Object Size:', buildInfo.maxBsonObjectSize);
  } catch (err) {
    console.log('MongoDB raw command error:', err.message);
  }

  // Check current DB collection stats
  try {
    const serverStatus = await prisma.$runCommandRaw({ connectionStatus: 1 });
    console.log('\n=== CONNECTION STATUS (REDACTED) ===');
    console.log('Authenticated Users:', (serverStatus.authInfo?.authenticatedUsers || []).map(u => ({
      user: u.user ? `${u.user.slice(0, 3)}***` : 'N/A',
      db: u.db
    })));
  } catch (err) {
    console.log('Connection status error:', err.message);
  }

  await prisma.$disconnect();
}

checkHostAndTarget().catch(console.error);
