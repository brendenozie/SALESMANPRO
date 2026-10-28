const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const url = 'https://developers.facebook.com/apps/2655372574841094/settings/basic/?business_id=2136306163848491';
  console.log('Navigating to Basic Settings:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const text = await page.evaluate(() => document.body.innerText);
  console.log('=== Basic Settings Text ===\n', text.slice(0, 3000));

  // Check if Add Platform button exists
  const addPlatform = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, div[role="button"], a[role="button"]'));
    const btn = btns.find(b => b.innerText && b.innerText.trim().toLowerCase().includes('add platform'));
    return btn ? { text: btn.innerText.trim(), tag: btn.tagName } : null;
  });
  console.log('Add Platform button:', addPlatform);

  process.exit(0);
}

main().catch(console.error);
