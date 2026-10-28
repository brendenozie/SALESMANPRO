const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('Clicking "Call" button...');
  const callBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Call"), div[role="dialog"] button:has-text("Call")').last();
  await callBtn.click();
  await page.waitForTimeout(3000);

  const stepText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('=== Step Text After Call ===\n', stepText);

  // Check inputs for verification code
  const inputs = await page.$$eval('[role="dialog"] input', els => els.map(e => ({
    type: e.type,
    name: e.name,
    placeholder: e.placeholder,
    ariaLabel: e.getAttribute('aria-label')
  })));
  console.log('Inputs in code step:\n', inputs);

  process.exit(0);
}

main().catch(console.error);
