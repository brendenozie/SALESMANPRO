const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const devPage = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const testUsersUrl = 'https://developers.facebook.com/apps/2655372574841094/roles/test-users/?business_id=2136306163848491';
  console.log('Navigating to Test Users page:', testUsersUrl);
  await devPage.goto(testUsersUrl, { waitUntil: 'domcontentloaded' });
  await devPage.waitForTimeout(4000);

  const mainText = await devPage.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText;
  });

  console.log('=== Test Users Page Content ===\n', mainText.slice(0, 1500));

  // Check buttons (e.g. Create Test User or Add)
  const buttons = await devPage.$$eval('button, [role="button"], a', els => els.map(e => ({
    text: e.innerText ? e.innerText.trim() : '',
    role: e.getAttribute('role'),
    href: e.href || null
  })).filter(e => e.text && (e.text.includes('Create') || e.text.includes('Add') || e.text.includes('User'))));
  console.log('Buttons on Test Users page:', buttons);

  process.exit(0);
}

main().catch(console.error);
