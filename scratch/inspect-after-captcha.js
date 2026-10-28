const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('security_center')) || context.pages()[0];

  console.log('Page URL:', page.url());
  const dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('=== Dialog Text ===\n', dialogText);

  // Check inputs or file inputs
  const inputs = await page.$$eval('[role="dialog"] input, [role="dialog"] select, [role="dialog"] button, [role="dialog"] [role="button"]', els => els.map(e => ({
    tag: e.tagName,
    type: e.type,
    text: e.innerText ? e.innerText.trim() : '',
    ariaLabel: e.getAttribute('aria-label')
  })));
  console.log('=== Interactive Elements in Dialog ===\n', JSON.stringify(inputs, null, 2));

  process.exit(0);
}

main().catch(console.error);
