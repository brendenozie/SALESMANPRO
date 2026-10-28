const { chromium } = require('playwright-core');

async function snap() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  const page = pages.find(p => p.url().includes('facebook.com')) || pages[0];
  await page.screenshot({ path: 'scratch/user_login_screen.png' });
  console.log('Saved scratch/user_login_screen.png for URL:', page.url());
  await browser.close();
}

snap().catch(console.error);
