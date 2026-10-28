const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('settings/basic'));
  const dialog = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('Dialog on basic settings:\n', dialog);

  // If dialog is "Select platform", let's see its buttons
  if (dialog !== 'No dialog') {
    const btns = await page.$$eval('[role="dialog"] [role="button"], [role="dialog"] button', els => els.map(e => e.innerText));
    console.log('Dialog buttons:', btns);
  }

  process.exit(0);
}

main().catch(console.error);
