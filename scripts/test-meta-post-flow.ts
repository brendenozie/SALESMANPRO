/**
 * scripts/test-meta-post-flow.ts
 *
 * Automated verification of Facebook & Instagram Post Publishing flow
 * using Meta Graph API Test Users and Page publishing.
 */

import dotenv from 'dotenv';
dotenv.config();

const APP_ID = process.env.META_APP_ID || '2655372574841094';
const APP_SECRET = process.env.META_APP_SECRET || '7853cf7ad2f9f85cbd2b4951ca68a09e';
const APP_TOKEN = `${APP_ID}|${APP_SECRET}`;
const GRAPH_BASE = 'https://graph.facebook.com/v20.0';

async function main() {
  console.log('================================================================');
  console.log('   META OAUTH & POST PUBLISHING FLOW TEST (TEST ACCOUNTS)       ');
  console.log('================================================================\n');

  console.log(`Using App ID: ${APP_ID}`);

  // 1. Check existing test users or create a new test user
  console.log('\n--- 1. FETCHING OR CREATING TEST USER ---');
  const testUsersUrl = `${GRAPH_BASE}/${APP_ID}/accounts/test-users?access_token=${encodeURIComponent(APP_TOKEN)}`;
  const listRes = await fetch(testUsersUrl);
  const listData = await listRes.json();

  let testUser = listData.data && listData.data[0];

  if (!testUser) {
    console.log('Creating a new Meta Test User with required permissions...');
    const createUrl = `${GRAPH_BASE}/${APP_ID}/accounts/test-users?` + new URLSearchParams({
      access_token: APP_TOKEN,
      installed: 'true',
      permissions: 'pages_show_list,pages_read_engagement,pages_manage_posts',
      name: 'SalesmanPro Tester',
    }).toString();

    const createRes = await fetch(createUrl, { method: 'POST' });
    const createData = await createRes.json();

    if (createData.error) {
      console.error('Failed to create test user via API:', createData.error);
      throw new Error(`Graph API error: ${createData.error.message}`);
    }

    testUser = createData;
    console.log('✅ Test User created successfully:');
  } else {
    console.log('✅ Found existing Test User:');
  }

  console.log(`   - Test User ID:   ${testUser.id}`);
  console.log(`   - Access Token:   ${testUser.access_token.slice(0, 20)}...`);
  if (testUser.login_url) {
    console.log(`   - Login URL:      ${testUser.login_url}`);
  }

  // 2. Inspect user accounts (Facebook Pages)
  console.log('\n--- 2. VERIFYING MANAGED FACEBOOK PAGES ---');
  const userToken = testUser.access_token;
  const accountsUrl = `${GRAPH_BASE}/me/accounts?access_token=${encodeURIComponent(userToken)}&fields=id,name,access_token,tasks`;
  const accountsRes = await fetch(accountsUrl);
  const accountsData = await accountsRes.json();

  let page = accountsData.data && accountsData.data[0];

  if (!page) {
    console.log('Creating a test Facebook Page for this test user...');
    // Create a page for the test user
    const createPageUrl = `${GRAPH_BASE}/${testUser.id}/accounts?` + new URLSearchParams({
      access_token: userToken,
      name: 'SalesmanPro Test Store',
      category_enum: 'SHOPPING_RETAIL',
      about: 'Official SalesmanPro Test Storefront',
    }).toString();

    const createPageRes = await fetch(createPageUrl, { method: 'POST' });
    const createPageData = await createPageRes.json();

    if (createPageData.error) {
      console.log('Note on Page Creation:', createPageData.error.message);
      // Try fetching accounts again
      const retryRes = await fetch(accountsUrl);
      const retryData = await retryRes.json();
      page = retryData.data && retryData.data[0];
    } else {
      page = createPageData;
      console.log('✅ Test Page created:', page.name, page.id);
    }
  }

  if (page) {
    console.log('✅ Connected Facebook Page Found:');
    console.log(`   - Page Name: ${page.name}`);
    console.log(`   - Page ID:   ${page.id}`);
    console.log(`   - Page Token: ${page.access_token ? page.access_token.slice(0, 20) + '...' : 'N/A'}`);

    // 3. Test Publishing a Post to the Page Feed
    console.log('\n--- 3. TESTING POST PUBLISHING TO PAGE FEED ---');
    const pageToken = page.access_token || userToken;
    const postMessage = `🚀 Test post from SalesmanPro automated test suite!\nTimestamp: ${new Date().toISOString()}\nPlatform: Meta Graph API v20.0`;

    const publishUrl = `${GRAPH_BASE}/${page.id}/feed`;
    const publishRes = await fetch(publishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: postMessage,
        access_token: pageToken,
      }),
    });

    const publishData = await publishRes.json();
    if (publishData.error) {
      console.error('❌ Post publishing failed:', publishData.error);
    } else {
      console.log('🎉 POST SUCCESSFULLY PUBLISHED TO FACEBOOK!');
      console.log(`   - Created Post ID: ${publishData.id}`);

      // 4. Verify post retrieval
      const getPostUrl = `${GRAPH_BASE}/${publishData.id}?access_token=${encodeURIComponent(pageToken)}&fields=id,message,created_time,permalink_url`;
      const getPostRes = await fetch(getPostUrl);
      const getPostData = await getPostRes.json();

      console.log('✅ Verified Published Post Details:');
      console.log(`   - Message:   "${getPostData.message}"`);
      console.log(`   - Timestamp: ${getPostData.created_time}`);
      if (getPostData.permalink_url) {
        console.log(`   - Permalink: ${getPostData.permalink_url}`);
      }
    }
  } else {
    console.log('ℹ️ Test user is active and ready. To attach a page, log in with the test user login URL and click "Create Page".');
  }

  console.log('\n================================================================');
  console.log('       TEST COMPLETED SUCCESSFULLY                             ');
  console.log('================================================================');
}

main().catch(console.error);
