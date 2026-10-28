const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const devPage = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Navigating to App Review requests/submissions...');
  await devPage.goto('https://developers.facebook.com/apps/2655372574841094/app-review/requests/?business_id=2136306163848491', { waitUntil: 'domcontentloaded' });
  await devPage.waitForTimeout(4000);

  const mainText = await devPage.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText;
  });

  console.log('=== App Review Requests Page Content ===\n', mainText);

  process.exit(0);
}

main().catch(console.error);
