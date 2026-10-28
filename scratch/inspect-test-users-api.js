const APP_ID = '2655372574841094';
const APP_SECRET = '7853cf7ad2f9f85cbd2b4951ca68a09e';
const APP_TOKEN = `${APP_ID}|${APP_SECRET}`;
const GRAPH_BASE = 'https://graph.facebook.com/v20.0';

async function main() {
  const url = `${GRAPH_BASE}/${APP_ID}/accounts/test-users?access_token=${encodeURIComponent(APP_TOKEN)}&limit=100`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('Test users response:', JSON.stringify(data, null, 2));

  // Also check roles on the app
  const rolesUrl = `${GRAPH_BASE}/${APP_ID}/roles?access_token=${encodeURIComponent(APP_TOKEN)}`;
  const rolesRes = await fetch(rolesUrl);
  const rolesData = await rolesRes.json();
  console.log('\nApp Roles:', JSON.stringify(rolesData, null, 2));
}

main().catch(console.error);
