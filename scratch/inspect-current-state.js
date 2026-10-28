const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  const page = pages.find(p => p.url().includes('developers.facebook.com')) || pages[0];

  console.log('Current URL:', page.url());
  console.log('Title:', await page.title());

  await page.screenshot({ path: 'scratch/current_state.png' });
  console.log('Screenshot saved to scratch/current_state.png');

  // Check dialogs/modals
  const dialogs = await page.$$eval('[role="dialog"]', els => els.map(el => ({
    text: el.innerText.slice(0, 300),
    classes: el.className
  })));
  console.log('Dialogs count:', dialogs.length);
  dialogs.forEach((d, i) => console.log(`Dialog ${i}:`, d.text));

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
