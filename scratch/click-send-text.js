const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  const input = page.locator('[role="dialog"] input[type="text"]').first();
  const val = await input.inputValue();
  console.log('Phone number input value:', val);

  console.log('Clicking "Send text" button...');
  const sendBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Send text"), div[role="dialog"] button:has-text("Send text")').last();
  await sendBtn.click();
  await page.waitForTimeout(3000);

  const dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('=== Dialog Text After Send text ===\n', dialogText);

  process.exit(0);
}

main().catch(console.error);
