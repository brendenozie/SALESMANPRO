const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('settings/basic'));

  console.log('1. Clicking Add platform button...');
  await page.locator('div[role="button"]:has-text("Add platform")').click();
  await page.waitForTimeout(2000);

  const dialog = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('Dialog:\n', dialog);

  // Find all cards inside dialog
  const cards = await page.$$eval('[role="dialog"] *', els => els.map(e => ({ text: e.innerText ? e.innerText.trim() : '', role: e.getAttribute('role'), tag: e.tagName })).filter(e => e.text && e.text.length < 30));
  console.log('Cards/Elements in dialog:', cards.slice(0, 20));

  // Click Website
  console.log('2. Clicking Website card...');
  const websiteCard = page.locator('[role="dialog"]').getByText('Website', { exact: true });
  await websiteCard.click();
  await page.waitForTimeout(1000);

  // Find Next button in dialog
  const nextBtn = page.locator('[role="dialog"]').getByText('Next', { exact: true });
  console.log('Next button count:', await nextBtn.count());
  await nextBtn.click();
  await page.waitForTimeout(3000);

  console.log('3. After Next, dialog text:\n', await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog'));

  // Let's check if Website section is now on the page
  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('Does page have Site URL?', pageText.includes('Site URL'));

  process.exit(0);
}

main().catch(console.error);
