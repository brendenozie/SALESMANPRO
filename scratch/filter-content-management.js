const { chromium } = require('playwright-core');
const fs = require('fs');

async function inspectContentManagementUseCases() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Clicking "Content management (5)" filter tab...');
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const tab = all.find(el => el.innerText && el.innerText.trim().startsWith('Content management'));
    if (tab) tab.click();
  });

  await page.waitForTimeout(3000);

  const text = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]') || document.body;
    return dialog ? dialog.innerText : '';
  });

  console.log('Content Management Use Cases:');
  console.log(text);
  fs.writeFileSync('scratch/content_management_use_cases.txt', text);
  await page.screenshot({ path: 'scratch/content_management_dialog.png', timeout: 5000 }).catch(() => {});
}

inspectContentManagementUseCases().catch(console.error);
