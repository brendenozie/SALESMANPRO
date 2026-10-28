const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('security_center')) || context.pages()[0];

  console.log('Page URL:', page.url());

  // Check if dialog is open
  const dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('Dialog:\n', dialogText);

  // If on Select your business type, select Sole proprietorship
  if (dialogText.includes('Select your business type')) {
    console.log('Selecting Sole proprietorship radio...');
    // Click the label or radio for Sole proprietorship
    const solePropOption = page.locator('[role="dialog"]').getByText('Sole proprietorship', { exact: false }).first();
    await solePropOption.click();
    await page.waitForTimeout(1000);

    const nextBtn = page.locator('div[role="dialog"] div[role="button"][aria-label="Next"], div[role="dialog"] button:has-text("Next")').last();
    await nextBtn.click();
    await page.waitForTimeout(4000);

    const stepText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
    console.log('=== Step Text After Sole Proprietorship ===\n', stepText);

    // Check all inputs
    const inputs = await page.$$eval('[role="dialog"] input, [role="dialog"] select, [role="dialog"] textarea', els => els.map(e => ({
      tag: e.tagName,
      type: e.type,
      name: e.name,
      placeholder: e.placeholder,
      ariaLabel: e.getAttribute('aria-label')
    })));
    console.log('Inputs in step:', inputs);
  }

  process.exit(0);
}

main().catch(console.error);
