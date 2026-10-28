const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const url = 'https://developers.facebook.com/apps/2655372574841094/app-review/submissions/?business_id=2136306163848491';
  console.log('Navigating to App Review Submissions:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('=== App Review Submissions Page Text ===');
  console.log(bodyText);

  process.exit(0);
}

main().catch(console.error);
