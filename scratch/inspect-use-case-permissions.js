const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const devPage = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('1. Inspecting Instagram Business Use Case...');
  await devPage.goto('https://developers.facebook.com/apps/2655372574841094/use_cases/customize/?use_case_enum=INSTAGRAM_BUSINESS&business_id=2136306163848491', { waitUntil: 'domcontentloaded' });
  await devPage.waitForTimeout(4000);

  const instaText = await devPage.evaluate(() => document.body.innerText);
  console.log('=== Instagram Business Use Case ===\n', instaText.slice(0, 2000));

  console.log('\n2. Inspecting Pages Use Case...');
  await devPage.goto('https://developers.facebook.com/apps/2655372574841094/use_cases/customize/?use_case_enum=PAGES_API&business_id=2136306163848491', { waitUntil: 'domcontentloaded' });
  await devPage.waitForTimeout(4000);

  const pagesText = await devPage.evaluate(() => document.body.innerText);
  console.log('=== Pages API Use Case ===\n', pagesText.slice(0, 2000));

  process.exit(0);
}

main().catch(console.error);
