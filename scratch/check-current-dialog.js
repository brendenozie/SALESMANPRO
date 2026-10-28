const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  const text = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    return dialog ? dialog.innerText : 'NO DIALOG. Body:\n' + document.body.innerText.slice(0, 1000);
  });

  console.log('Text:\n', text);
  process.exit(0);
}

main().catch(console.error);
