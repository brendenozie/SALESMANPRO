const { chromium } = require('playwright-core');

async function snapNow() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Current URL:', page.url());
  const text = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 2000) : '');
  console.log('Current Text:');
  console.log(text);
  await page.screenshot({ path: 'scratch/snap_wizard.png', timeout: 5000 }).catch(() => {});
}

snapNow().catch(console.error);
