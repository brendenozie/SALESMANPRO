const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Connecting to Chrome over CDP on port 9222...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  console.log(`Connected! Total open pages: ${pages.length}`);

  // Use existing page or create new one
  let page = pages.find(p => !p.url().startsWith('chrome://') && !p.url().startsWith('chrome-extension://'));
  if (!page) {
    page = await context.newPage();
  }

  console.log(`Navigating to https://developers.facebook.com/apps/ ...`);
  await page.goto('https://developers.facebook.com/apps/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const title = await page.title();
  const url = page.url();
  console.log(`Page loaded: "${title}" - URL: ${url}`);

  // Take screenshot
  const screenshotPath = path.resolve(__dirname, 'meta_apps_screen.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Screenshot saved to: ${screenshotPath}`);

  // Extract page content / text / links
  const bodyText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 3000) : '');
  console.log('--- Page text preview ---');
  console.log(bodyText.slice(0, 1000));
  console.log('-------------------------');

  // Look for apps or links
  const apps = await page.evaluate(() => {
    const list = [];
    // Select app cards or rows
    document.querySelectorAll('a[href*="/apps/"]').forEach(a => {
      const text = a.innerText.trim();
      const href = a.getAttribute('href');
      if (text && href && !list.some(x => x.href === href)) {
        list.push({ text: text.replace(/\n+/g, ' | '), href });
      }
    });
    return list;
  });

  console.log('Apps / links found with /apps/:', JSON.stringify(apps, null, 2));

  // Disconnect from browser without closing it
  await browser.close();
}

run().catch(err => {
  console.error('Error during CDP inspection:', err);
  process.exit(1);
});
