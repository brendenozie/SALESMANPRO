const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('app-review/submissions')) || context.pages()[0];

  console.log('Clicking Next on App Review submissions...');
  const nextBtn = page.locator('div[role="button"]:has-text("Next"), button:has-text("Next")');
  await nextBtn.click();

  await page.waitForTimeout(4000);
  console.log('Current URL after Next:', page.url());

  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('=== Review Requirements Page Text (first 3000 chars) ===\n', pageText.slice(0, 3000));

  process.exit(0);
}

main().catch(console.error);
