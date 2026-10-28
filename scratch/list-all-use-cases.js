const { chromium } = require('playwright-core');
const fs = require('fs');

async function listAllUseCases() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Clicking "All (14)"...');
  const allBtn = await page.$('text="All (14)"');
  if (allBtn) {
    await allBtn.click();
    await page.waitForTimeout(2000);
  }

  const text = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]') || document.body;
    return dialog ? dialog.innerText : '';
  });

  console.log('All 14 use cases text:');
  console.log(text);
  fs.writeFileSync('scratch/all_14_use_cases.txt', text);
}

listAllUseCases().catch(console.error);
