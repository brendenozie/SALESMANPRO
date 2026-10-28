const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('security_center')) || context.pages()[0];

  console.log('Selecting "Not yet registered"...');
  const notRegisteredOption = page.locator('[role="dialog"]').getByText('Not yet registered', { exact: false }).first();
  await notRegisteredOption.click();
  await page.waitForTimeout(1000);

  console.log('Clicking Next...');
  const nextBtn = page.locator('div[role="dialog"] div[role="button"][aria-label="Next"], div[role="dialog"] button:has-text("Next")').last();
  await nextBtn.click();
  await page.waitForTimeout(4000);

  const stepText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('=== Step Text After Not Yet Registered ===\n', stepText);

  // Check inputs
  const inputs = await page.$$eval('[role="dialog"] input, [role="dialog"] select, [role="dialog"] textarea', els => els.map(e => ({
    tag: e.tagName,
    type: e.type,
    name: e.name,
    placeholder: e.placeholder,
    ariaLabel: e.getAttribute('aria-label')
  })));
  console.log('Inputs in step:\n', JSON.stringify(inputs, null, 2));

  process.exit(0);
}

main().catch(console.error);
