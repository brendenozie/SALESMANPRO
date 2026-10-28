/**
 * scripts/verify-meta-integration.ts
 *
 * End-to-end verification for Meta App Configuration & Facebook + Instagram Integration
 */

import dotenv from 'dotenv';
dotenv.config();

import { IntegrationOAuthService } from '../lib/integrations/oauth';
import { INTEGRATION_DEFINITIONS } from '../lib/integrations/registry';
import { socialCrypto } from '../lib/social/socialCrypto';

async function runVerification() {
  console.log('================================================================');
  console.log('       META & SOCIAL INTEGRATION VERIFICATION SUITE             ');
  console.log('================================================================\n');

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  // 1. App Credentials Integrity Check
  console.log('--- 1. CREDENTIALS INTEGRITY ---');
  console.log(`Meta App ID:     ${appId}`);
  console.log(`Meta App Secret: ${appSecret ? appSecret.slice(0, 6) + '...' + appSecret.slice(-4) + ' (' + appSecret.length + ' chars)' : 'MISSING'}`);

  if (!appId || !/^\d+$/.test(appId)) {
    throw new Error(`Invalid App ID: expected numeric ID, got ${appId}`);
  }
  if (!appSecret || !/^[0-9a-f]{32}$/i.test(appSecret)) {
    throw new Error(`Invalid App Secret: expected 32-character hex, got ${appSecret}`);
  }
  console.log('✅ Credentials format validated: 16-digit App ID & 32-hex App Secret.\n');

  // 2. Direct Meta Graph API Validation
  console.log('--- 2. META GRAPH API APP VALIDATION ---');
  const appAccessToken = `${appId}|${appSecret}`;
  const graphUrl = `https://graph.facebook.com/v20.0/${appId}?access_token=${encodeURIComponent(appAccessToken)}&fields=id,name,link,category`;

  try {
    const res = await fetch(graphUrl);
    const data = await res.json();

    if (!res.ok || data.error) {
      console.error('Graph API error response:', data);
      throw new Error(`Meta Graph API rejected credentials: ${data.error?.message || res.statusText}`);
    }

    console.log('✅ Graph API Credentials Confirmed Live & Valid:');
    console.log(`   - App Name: ${data.name}`);
    console.log(`   - App ID:   ${data.id}`);
    console.log(`   - Category: ${data.category || 'N/A'}`);
    console.log(`   - Link:     ${data.link || 'N/A'}\n`);
  } catch (err: any) {
    console.error('❌ Graph API call failed:', err.message);
    throw err;
  }

  // 3. OAuth URL Generation & Permissions
  console.log('--- 3. OAUTH URL & SCOPE GENERATION ---');
  const testCompanyId = '68a4420ea20efd318d51db70';
  const testUserId = '68a4420ea20efd318d51db71';
  const origin = 'https://salesmanpro.store';

  // Facebook
  const fbResult = await IntegrationOAuthService.buildAuthorizationUrl({
    companyId: testCompanyId,
    userId: testUserId,
    providerId: 'facebook',
    origin,
    redirectPath: '/admin/social',
  });

  console.log('✅ Facebook Authorization URL Generated:');
  console.log(`   URL: ${fbResult.url.slice(0, 100)}...`);
  console.log(`   State Token: ${fbResult.state.slice(0, 30)}...`);

  const fbParsed = new URL(fbResult.url);
  if (fbParsed.searchParams.get('client_id') !== appId) {
    throw new Error(`Facebook client_id mismatch: expected ${appId}, got ${fbParsed.searchParams.get('client_id')}`);
  }
  if (!fbParsed.searchParams.get('redirect_uri')?.includes('/api/integrations/oauth/facebook/callback')) {
    throw new Error(`Facebook redirect_uri invalid: ${fbParsed.searchParams.get('redirect_uri')}`);
  }
  const fbScopes = fbParsed.searchParams.get('scope')?.split(',') || [];
  console.log(`   Scopes Requested: ${fbScopes.join(', ')}`);
  ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'].forEach(scope => {
    if (!fbScopes.includes(scope)) {
      throw new Error(`Missing expected Facebook scope: ${scope}`);
    }
  });

  // Instagram
  const igResult = await IntegrationOAuthService.buildAuthorizationUrl({
    companyId: testCompanyId,
    userId: testUserId,
    providerId: 'instagram',
    origin,
    redirectPath: '/admin/social',
  });

  console.log('\n✅ Instagram Authorization URL Generated:');
  console.log(`   URL: ${igResult.url.slice(0, 100)}...`);
  console.log(`   State Token: ${igResult.state.slice(0, 30)}...`);

  const igParsed = new URL(igResult.url);
  if (igParsed.searchParams.get('client_id') !== appId) {
    throw new Error(`Instagram client_id mismatch: expected ${appId}, got ${igParsed.searchParams.get('client_id')}`);
  }
  if (!igParsed.searchParams.get('redirect_uri')?.includes('/api/integrations/oauth/instagram/callback')) {
    throw new Error(`Instagram redirect_uri invalid: ${igParsed.searchParams.get('redirect_uri')}`);
  }
  const igScopes = igParsed.searchParams.get('scope')?.split(',') || [];
  console.log(`   Scopes Requested: ${igScopes.join(', ')}`);
  ['instagram_basic', 'instagram_content_publish'].forEach(scope => {
    if (!igScopes.includes(scope)) {
      throw new Error(`Missing expected Instagram scope: ${scope}`);
    }
  });

  // 4. State Security & HMAC Validation
  console.log('\n--- 4. STATE SECURITY & HMAC CSRF PROTECTION ---');
  const decodedFb = IntegrationOAuthService.validateState(fbResult.state);
  console.log('✅ State verification succeeded:');
  console.log(`   - Company ID: ${decodedFb.companyId}`);
  console.log(`   - User ID:    ${decodedFb.userId}`);
  console.log(`   - Provider:   ${decodedFb.provider}`);
  console.log(`   - Timestamp:  ${new Date(decodedFb.timestamp).toISOString()}`);

  // Tamper resistance test
  let tampered = false;
  try {
    const tamperedState = fbResult.state.slice(0, -4) + 'abcd';
    IntegrationOAuthService.validateState(tamperedState);
  } catch (err: any) {
    tampered = true;
    console.log(`✅ Tampered state correctly rejected: "${err.message}"`);
  }
  if (!tampered) {
    throw new Error('Security failure: Tampered state was not rejected!');
  }

  // 5. Token Encryption / Decryption Validation (AES-256-GCM)
  console.log('\n--- 5. TOKEN ENCRYPTION AUDIT (AES-256-GCM) ---');
  const dummyToken = 'EAAlvDBsR2QYBO' + Math.random().toString(36).substring(2) + 'TESTACCESSTOKEN';
  const encrypted = socialCrypto.encryptToken(dummyToken);
  console.log('✅ Token encrypted with AES-256-GCM:');
  console.log(`   - Ciphertext: ${encrypted.encrypted.slice(0, 24)}... (length: ${encrypted.encrypted.length})`);
  console.log(`   - IV:         ${encrypted.iv} (length: ${encrypted.iv.length})`);
  console.log(`   - Auth Tag:   ${encrypted.tag} (length: ${encrypted.tag.length})`);

  const decrypted = socialCrypto.decryptToken(encrypted);
  if (decrypted !== dummyToken) {
    throw new Error('AES-256-GCM roundtrip decryption failed: values do not match');
  }
  console.log('✅ AES-256-GCM roundtrip verified: Decrypted token matches original exactly.\n');

  console.log('================================================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  console.log('================================================================');
}

runVerification().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
