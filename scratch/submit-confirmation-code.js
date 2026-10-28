const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('Filling confirmation code: 716620...');
  const input = page.locator('[role="dialog"] input[type="text"]').first();
  await input.fill('716620');
  await page.waitForTimeout(1000);

  console.log('Clicking Next...');
  const nextBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Next"), div[role="dialog"] button:has-text("Next")').last();
  await nextBtn.click();
  await page.waitForTimeout(5000);

  const dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('=== Step Text After Submitting Code ===\n', dialogText);

  // Check buttons or completion
  const buttons = await page.$$eval('[role="dialog"] [role="button"], [role="dialog"] button', els => els.map(e => e.innerText.trim()).filter(Boolean));
  console.log('Buttons on new screen:', buttons);

  process.exit(0);
}

main().catch(console.error);
