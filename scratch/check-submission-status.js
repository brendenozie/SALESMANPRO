const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  await page.waitForTimeout(5000);

  const text = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    return dialog ? dialog.innerText : document.body.innerText.slice(0, 1500);
  });

  console.log('=== Status after processing ===\n', text);

  const buttons = await page.$$eval('[role="dialog"] [role="button"], [role="dialog"] button', els => els.map(e => e.innerText.trim()).filter(Boolean));
  console.log('Buttons:', buttons);

  process.exit(0);
}

main().catch(console.error);
