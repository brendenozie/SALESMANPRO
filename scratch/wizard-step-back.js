const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('security_center')) || context.pages()[0];

  console.log('Navigating Back in wizard...');
  const backBtn = page.locator('div[role="dialog"] div[role="button"][aria-label="Back"], div[role="dialog"] button:has-text("Back"), div[role="dialog"] div[role="button"]:has-text("Back")');
  if (await backBtn.count() > 0) {
    await backBtn.first().click();
    await page.waitForTimeout(1000);
    if (await backBtn.count() > 0) {
      await backBtn.first().click();
      await page.waitForTimeout(1000);
    }
  }

  const dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('Wizard now at:\n', dialogText);
  process.exit(0);
}

main().catch(console.error);
