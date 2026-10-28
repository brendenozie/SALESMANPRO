const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('Clicking Next on documents screen...');
  const nextBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Next"), div[role="dialog"] button:has-text("Next")').last();
  await nextBtn.click();
  await page.waitForTimeout(4000);

  const dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('=== Dialog Text After Clicking Next ===\n', dialogText);

  // If there's a "Send message" or "Send WhatsApp" or "Confirm" button:
  const buttons = await page.$$eval('[role="dialog"] [role="button"], [role="dialog"] button', els => els.map(e => e.innerText.trim()).filter(Boolean));
  console.log('Buttons on new screen:', buttons);

  process.exit(0);
}

main().catch(console.error);
