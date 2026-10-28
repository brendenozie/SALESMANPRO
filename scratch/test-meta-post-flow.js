/**
 * scratch/test-meta-post-flow.js
 *
 * Automated verification of Facebook & Instagram Post Publishing flow
 * using Meta Graph API Test Users and Page publishing.
 */

const APP_ID = '2655372574841094';
const APP_SECRET = '7853cf7ad2f9f85cbd2b4951ca68a09e';
const APP_TOKEN = `${APP_ID}|${APP_SECRET}`;
const GRAPH_BASE = 'https://graph.facebook.com/v20.0';

async function main() {
  console.log('================================================================');
  console.log('   META OAUTH & POST PUBLISHING FLOW TEST (TEST ACCOUNTS)       ');
  console.log('================================================================\n');

  console.log(`Using App ID: ${APP_ID}`);

  // 1. Fetch existing test users or create a new test user
  console.log('\n--- 1. FETCHING OR CREATING TEST USER ---');
  const testUsersUrl = `${GRAPH_BASE}/${APP_ID}/accounts/test-users?access_token=${encodeURIComponent(APP_TOKEN)}`;
  const listRes = await fetch(testUsersUrl);
  const listData = await listRes.json();

  if (listData.error) {
    console.error('Error fetching test users:', listData.error);
    return;
  }

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
      return;
    }

    testUser = createData;
    console.log('✅ Test User created successfully!');
  } else {
    console.log(`✅ Found existing Test User (Total count: ${listData.data.length})`);
  }

  console.log(`   - Test User ID:   ${testUser.id}`);
  console.log(`   - Access Token:   ${testUser.access_token.slice(0, 25)}...`);
  if (testUser.login_url) {
    console.log(`   - One-Click Login URL: ${testUser.login_url}`);
  }

  // 2. Fetch or create a Facebook Page for the test user
  console.log('\n--- 2. VERIFYING MANAGED FACEBOOK PAGES ---');
  const userToken = testUser.access_token;
  const accountsUrl = `${GRAPH_BASE}/me/accounts?access_token=${encodeURIComponent(userToken)}&fields=id,name,access_token,tasks`;
  const accountsRes = await fetch(accountsUrl);
  const accountsData = await accountsRes.json();

  let page = accountsData.data && accountsData.data[0];

  if (!page) {
    console.log('Creating a test Facebook Page for this test user...');
    const createPageUrl = `${GRAPH_BASE}/${testUser.id}/accounts?` + new URLSearchParams({
      access_token: userToken,
      name: 'SalesmanPro Demo Page',
      category_enum: 'SHOPPING_RETAIL',
      about: 'Official SalesmanPro Test Storefront',
    }).toString();

    const createPageRes = await fetch(createPageUrl, { method: 'POST' });
    const createPageData = await createPageRes.json();

    if (createPageData.error) {
      console.log('Create Page response:', createPageData.error.message);
      // Re-fetch
      const retryRes = await fetch(accountsUrl);
      const retryData = await retryRes.json();
      page = retryData.data && retryData.data[0];
    } else {
      page = createPageData;
      console.log('✅ Test Page created successfully:', page.name, page.id);
    }
  }

  if (page) {
    console.log('✅ Connected Facebook Page Available:');
    console.log(`   - Page Name:  ${page.name}`);
    console.log(`   - Page ID:    ${page.id}`);
    console.log(`   - Page Token: ${page.access_token ? page.access_token.slice(0, 25) + '...' : 'N/A'}`);

    // 3. Publish a post to the Facebook Page feed
    console.log('\n--- 3. TESTING POST PUBLISHING VIA GRAPH API ---');
    const pageToken = page.access_token || userToken;
    const postMessage = `🎉 Hello from SalesmanPro!\n\nThis is a verified test post demonstrating automated multi-channel social publishing.\n\nTimestamp: ${new Date().toLocaleString()}\nPlatform: Meta Graph API v20.0`;

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
      console.log('🎉 POST SUCCESSFULLY PUBLISHED TO FACEBOOK PAGE!');
      console.log(`   - Published Post ID: ${publishData.id}`);

      // 4. Retrieve published post details & verify
      const getPostUrl = `${GRAPH_BASE}/${publishData.id}?access_token=${encodeURIComponent(pageToken)}&fields=id,message,created_time,permalink_url`;
      const getPostRes = await fetch(getPostUrl);
      const getPostData = await getPostRes.json();

      console.log('\n✅ Verified Live Post Object:');
      console.log(`   - Post ID:      ${getPostData.id}`);
      console.log(`   - Created Time: ${getPostData.created_time}`);
      console.log(`   - Message Preview:\n     ${getPostData.message.replace(/\n/g, '\n     ')}`);
      if (getPostData.permalink_url) {
        console.log(`   - Post URL:     ${getPostData.permalink_url}`);
      }
    }
  } else {
    console.log('ℹ️ Test user is active. Facebook Page can be created via test user login URL or Graph API.');
  }

  console.log('\n================================================================');
  console.log('       TEST SUITE RUN FINISHED                                  ');
  console.log('================================================================');
}

main().catch(console.error);
