const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));
  if (page) {
    console.log('URL:', page.url());
    const dialogs = await page.$$eval('[role="dialog"]', els => els.map(e => e.innerText));
    console.log('Dialogs found:', dialogs.length);
    dialogs.forEach((d, i) => console.log(`Dialog ${i}:\n`, d));
    if (dialogs.length === 0) {
      console.log('Page text snippet:\n', (await page.evaluate(() => document.body.innerText)).slice(0, 1000));
    }
  }
  process.exit(0);
}

main().catch(console.error);
