const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('1. Checking "I confirm that my submission meets the requirements."...');
  const checkbox = page.locator('[role="dialog"]').getByText('I confirm that my submission meets the requirements.', { exact: false }).first();
  await checkbox.click();
  await page.waitForTimeout(1000);

  console.log('2. Clicking Submit...');
  const submitBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Submit"), div[role="dialog"] button:has-text("Submit")').last();
  await submitBtn.click();
  await page.waitForTimeout(5000);

  const dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('=== Final Screen Text After Submit ===\n', dialogText);

  const pageText = await page.evaluate(() => document.body.innerText.slice(0, 1500));
  console.log('=== Page Text ===\n', pageText);

  process.exit(0);
}

main().catch(console.error);
