import dotenv from 'dotenv';
dotenv.config();

import { IntegrationOAuthService } from '../lib/integrations/oauth';

async function main() {
  const companyId = '6818d4e95526443bb3999c80'; // TheVehicleShop
  const userId = '67c5b0182e2372b5f2366dbe'; // Brenden Odhiambo
  const origin = 'https://salesmanpro.store';

  const fbResult = await IntegrationOAuthService.buildAuthorizationUrl({
    companyId,
    userId,
    providerId: 'facebook',
    origin,
    redirectPath: '/admin/social',
  });

  const igResult = await IntegrationOAuthService.buildAuthorizationUrl({
    companyId,
    userId,
    providerId: 'instagram',
    origin,
    redirectPath: '/admin/social',
  });

  console.log('================================================================');
  console.log('               LIVE META AUTHORIZATION LINKS                    ');
  console.log('================================================================');
  console.log('\n🔵 FACEBOOK CONNECT URL:');
  console.log(fbResult.url);
  console.log('\n🟣 INSTAGRAM CONNECT URL:');
  console.log(igResult.url);
  console.log('\n================================================================');
}

main().catch(console.error);
