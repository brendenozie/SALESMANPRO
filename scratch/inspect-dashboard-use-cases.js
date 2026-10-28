const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const devPage = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Navigating to App Dashboard...');
  await devPage.goto('https://developers.facebook.com/apps/2655372574841094/dashboard/?business_id=2136306163848491', { waitUntil: 'domcontentloaded' });
  await devPage.waitForTimeout(4000);

  const text = await devPage.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText;
  });

  console.log('=== App Dashboard Content ===\n', text);

  // Check what use cases are listed
  const useCaseCards = await devPage.$$eval('h3, h4, [role="heading"]', els => els.map(e => e.innerText.trim()).filter(Boolean));
  console.log('Headings/Cards on Dashboard:', useCaseCards);

  process.exit(0);
}

main().catch(console.error);
