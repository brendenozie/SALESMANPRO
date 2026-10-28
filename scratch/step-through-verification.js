const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('1. Selecting "Not yet registered"...');
  const notRegistered = page.locator('[role="dialog"]').getByText('Not yet registered', { exact: false }).first();
  await notRegistered.click();
  await page.waitForTimeout(1000);

  console.log('Clicking Next...');
  let nextBtn = page.locator('div[role="dialog"] div[role="button"][aria-label="Next"], div[role="dialog"] button:has-text("Next")').last();
  await nextBtn.click();
  await page.waitForTimeout(3000);

  console.log('2. Filling Business Details...');
  // Inputs in Business details: 1) Business name, 2) Alternative business name
  const textInputs = page.locator('[role="dialog"] input[type="text"]');
  await textInputs.nth(0).fill('Brenden Odhiambo Ouma');
  await textInputs.nth(1).fill('salesmanpro');
  await page.waitForTimeout(1000);

  console.log('Clicking Next...');
  nextBtn = page.locator('div[role="dialog"] div[role="button"][aria-label="Next"], div[role="dialog"] button:has-text("Next")').last();
  await nextBtn.click();
  await page.waitForTimeout(3000);

  console.log('3. Address Step Text:\n', await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog'));

  // Fill Address inputs:
  // Let's inspect fields in address
  const addrInputs = await page.$$eval('[role="dialog"] input', els => els.map(e => ({
    type: e.type,
    ariaLabel: e.getAttribute('aria-label'),
    placeholder: e.placeholder
  })));
  console.log('Address Inputs:', addrInputs);

  // Street address
  const streetInput = page.locator('[role="dialog"] input[aria-label="Street address"], [role="dialog"] input[placeholder="Street address"]').first();
  if (await streetInput.count() > 0) {
    await streetInput.fill('Nairobi');
  } else {
    await page.locator('[role="dialog"] input').nth(0).fill('Nairobi');
  }

  // City / Town
  const allDialogInputs = page.locator('[role="dialog"] input[type="text"]');
  const count = await allDialogInputs.count();
  console.log('Text inputs count in address:', count);
  // Fill city (usually 2nd or 3rd)
  // Let's inspect labels and inputs together
  process.exit(0);
}

main().catch(console.error);
