const { execSync } = require('child_process');

const remoteScript = `
cd /var/www/salesmanpro/current || cd /var/www/salesmanpro
node -e "
require('dotenv').config({ path: '/var/www/salesmanpro/shared/.env' });
const { IntegrationOAuthService } = require('./lib/integrations/oauth');

async function run() {
  const companyId = '6818d4e95526443bb3999c80'; // TheVehicleShop
  const userId = '67c5b0182e2372b5f2366dbe'; // Brenden Odhiambo
  const origin = 'https://salesmanpro.store';

  const fbResult = await IntegrationOAuthService.buildAuthorizationUrl({
    companyId,
    userId,
    providerId: 'facebook',
    origin,
    redirectPath: '/admin/thevehicleshop/social',
  });

  console.log('=== FACEBOOK CONNECT OAUTH URL ===\\n', fbResult.url);

  const igResult = await IntegrationOAuthService.buildAuthorizationUrl({
    companyId,
    userId,
    providerId: 'instagram',
    origin,
    redirectPath: '/admin/thevehicleshop/social',
  });

  console.log('\\n=== INSTAGRAM CONNECT OAUTH URL ===\\n', igResult.url);
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
