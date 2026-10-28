const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Current URL:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body Text (first 1500 chars):\n', bodyText.slice(0, 1500));

  // Find all buttons on page
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a[role="button"], [role="button"]')).map(b => ({
      text: b.innerText.trim(),
      ariaLabel: b.getAttribute('aria-label')
    })).filter(b => b.text.length > 0 || b.ariaLabel);
  });
  console.log('Buttons:', buttons);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
