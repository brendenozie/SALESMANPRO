const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('security_center')) || context.pages()[0];

  console.log('Clicking Continue using Playwright locator...');
  const continueBtn = page.locator('div[role="button"]:has-text("Continue")');
  await continueBtn.scrollIntoViewIfNeeded();
  await continueBtn.click();

  await page.waitForTimeout(5000);

  // Check if new window was opened or if page changed
  const allPages = context.pages();
  console.log('All Pages now:');
  allPages.forEach(p => console.log(' - ', p.url()));

  const activePage = allPages[allPages.length - 1];
  console.log('Active Page URL:', activePage.url());
  const bodyText = await activePage.evaluate(() => document.body.innerText);
  console.log('=== Body Text (first 2500 chars) ===');
  console.log(bodyText.slice(0, 2500));

  process.exit(0);
}

main().catch(console.error);
