const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  const dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('Dialog current text:\n', dialogText);

  // Check what happens if we click Back
  // Let's inspect the buttons in the dialog
  const buttons = await page.$$eval('[role="dialog"] [role="button"], [role="dialog"] button, [role="dialog"] a', els => els.map(e => ({
    text: e.innerText.trim(),
    role: e.getAttribute('role'),
    tag: e.tagName
  })));
  console.log('Buttons/Links in dialog:\n', buttons);

  process.exit(0);
}

main().catch(console.error);
