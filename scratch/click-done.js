const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('Clicking "Done"...');
  const doneBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Done"), div[role="dialog"] button:has-text("Done")').first();
  await doneBtn.click();
  await page.waitForTimeout(3000);

  console.log('Security center page URL:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Body Text snippet:\n', bodyText);

  process.exit(0);
}

main().catch(console.error);
