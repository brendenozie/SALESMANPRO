const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('Clicking "Resend code"...');
  const resendBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Resend code")').first();
  await resendBtn.click();
  await page.waitForTimeout(2000);

  const dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('Dialog text after resend:\n', dialogText);

  process.exit(0);
}

main().catch(console.error);
