const { chromium } = require('playwright-core');

async function run() {
  console.log('Connecting to Chrome on port 9222...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  console.log(`Open pages count: ${pages.length}`);

  let page = pages.find(p => p.url().includes('facebook.com')) || pages[0];
  console.log('Current URL:', page.url());

  // Check if cookies indicate logged in
  const cookies = await context.cookies(['https://www.facebook.com']);
  const hasCUser = cookies.some(c => c.name === 'c_user');
  console.log('Is c_user cookie present (logged in):', hasCUser);

  if (!hasCUser) {
    console.log('Not logged in yet. Navigating to login screen with redirect to apps...');
    await page.goto('https://www.facebook.com/login.php?next=https%3A%2F%2Fdevelopers.facebook.com%2Fapps%2F', { waitUntil: 'domcontentloaded' });
    console.log('Login screen presented on user screen.');
  } else {
    console.log('User is logged in! Navigating to https://developers.facebook.com/apps/ ...');
    await page.goto('https://developers.facebook.com/apps/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    console.log('Page Title:', await page.title());
  }

  await browser.close();
}

run().catch(console.error);
