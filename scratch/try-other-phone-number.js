const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('Changing phone number to 732771353...');
  const input = page.locator('[role="dialog"] input[type="text"]').first();
  await input.fill('732771353');
  await page.waitForTimeout(1000);

  console.log('Clicking Call for +254 732 771 353...');
  const callBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Call"), div[role="dialog"] button:has-text("Call")').last();
  await callBtn.click();
  await page.waitForTimeout(3000);

  const dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('Dialog text after Call:\n', dialogText);

  process.exit(0);
}

main().catch(console.error);
