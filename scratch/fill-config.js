const { chromium } = require('playwright-core');

async function fillConfig() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Finding input and typing with Playwright...');
  const input = await page.$('input:not([type="hidden"])');
  if (input) {
    await input.click();
    await input.fill('SalesmanPro Social Manager');
    await page.waitForTimeout(1000);
  }

  // Click Next
  const nextBtn = await page.$('button:has-text("Next"), [role="button"]:has-text("Next")');
  if (nextBtn) {
    console.log('Clicking Next button...');
    await nextBtn.click();
    await page.waitForTimeout(4000);
  }

  console.log('Page text after Next:');
  const text = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 3000) : '');
  console.log(text.slice(0, 1500));
}

fillConfig().catch(console.error);
