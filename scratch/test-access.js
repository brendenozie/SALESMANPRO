const { chromium } = require('playwright-core');
const fs = require('fs');

async function testAccess() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  console.log(`Open tabs: ${pages.length}`);

  let page = pages.find(p => p.url().includes('developers.facebook.com')) || pages[0];
  console.log(`Current URL before reload: ${page.url()}`);

  // Navigate to https://developers.facebook.com/apps/
  await page.goto('https://developers.facebook.com/apps/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const title = await page.title();
  const url = page.url();
  console.log(`Current URL after navigation: ${url}`);
  console.log(`Page Title: "${title}"`);

  // Check for apps
  const appCards = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('a[href*="/apps/"]').forEach(a => {
      const match = a.href.match(/\/apps\/(\d+)/);
      if (match && !list.some(x => x.appId === match[1])) {
        list.push({ appId: match[1], name: a.innerText.trim().replace(/\n+/g, ' '), href: a.href });
      }
    });
    return list;
  });

  console.log('Detected Apps Count:', appCards.length);
  console.log('Apps:', JSON.stringify(appCards, null, 2));

  // Screenshot
  await page.screenshot({ path: 'scratch/current_access_view.png' });
  console.log('Screenshot saved to scratch/current_access_view.png');

  // Check page text if no apps
  if (appCards.length === 0) {
    const text = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 1000) : '');
    console.log('Page Text snippet:\n', text);
  }

  await browser.close();
}

testAccess().catch(console.error);
