const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const newPage = await context.newPage();

  console.log('Navigating to Business Info...');
  await newPage.goto('https://business.facebook.com/latest/settings/business_info?business_id=2136306163848491', { waitUntil: 'domcontentloaded' });
  await newPage.waitForTimeout(4000);

  const text = await newPage.evaluate(() => document.body.innerText);
  console.log('=== Business Info Text ===\n', text.slice(0, 2500));

  await newPage.close();
  process.exit(0);
}

main().catch(console.error);
