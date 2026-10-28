const { chromium } = require('playwright-core');

async function openLogin() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  const page = pages.find(p => p.url().includes('developers.facebook.com')) || pages[0];

  console.log('Navigating to Meta Developer Login...');
  // Direct Meta developer login URL
  await page.goto('https://developers.facebook.com/async/registration/dialog/?referrer=https%3A%2F%2Fdevelopers.facebook.com%2Fapps%2F', { waitUntil: 'domcontentloaded' }).catch(() => {});
  // Or click the login button
  await page.goto('https://www.facebook.com/login.php?next=https%3A%2F%2Fdevelopers.facebook.com%2Fapps%2F', { waitUntil: 'domcontentloaded' });
  console.log('Current URL on user screen:', page.url());

  await browser.close();
}

openLogin().catch(console.error);
