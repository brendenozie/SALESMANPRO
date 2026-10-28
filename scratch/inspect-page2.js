const { chromium } = require('playwright-core');
const fs = require('fs');

async function inspectPage2() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  const page = pages.find(p => p.url().includes('developers.facebook.com')) || pages[0];

  console.log('Target Page:', await page.title(), page.url());
  await page.screenshot({ path: 'scratch/meta_page_screenshot.png' });
  console.log('Screenshot saved to scratch/meta_page_screenshot.png');

  // Print all cookies in context
  const allCookies = await context.cookies();
  console.log('Total cookies in context:', allCookies.length);
  const fbCookies = allCookies.filter(c => c.domain.includes('facebook') || c.domain.includes('meta'));
  console.log('FB/Meta cookies:');
  fbCookies.forEach(c => console.log(`  - ${c.name} on ${c.domain} (expires: ${c.expires})`));

  // Check DOM text
  const text = await page.evaluate(() => document.body ? document.body.innerText : '');
  console.log('Page text snippet:\n', text.slice(0, 800));

  await browser.close();
}

inspectPage2().catch(console.error);
