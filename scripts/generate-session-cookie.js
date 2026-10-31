const { encode } = require('next-auth/jwt');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envConfig = dotenv.parse(fs.readFileSync('.env'));
const secret = envConfig.NEXTAUTH_SECRET;

async function generateTestCookie() {
  const token = await encode({
    token: {
      id: '68f1e945dcb9542a6b0a08eb',
      sub: '68f1e945dcb9542a6b0a08eb',
      name: 'Brenden Odhiambo',
      email: 'brendenozie@gmail.com',
      role: 'ADMIN',
      emailVerified: true,
      isActive: true,
      companyId: '6825c2c7969ab9f16f620f67',
      hasTenantAccess: true,
    },
    secret,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
  console.log('Generated next-auth.session-token length:', token.length);
  return token;
}

generateTestCookie();

