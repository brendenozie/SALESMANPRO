const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('Filling Address fields...');
  // Street address
  const streetInput = page.locator('[role="dialog"] input[type="search"]').first();
  await streetInput.fill('Nairobi');

  // Text inputs:
  // index 0: Street address 2 / locality
  // index 1: Town/City
  // index 2: County/Region
  // index 3: ZIP/Postcode
  const textInputs = page.locator('[role="dialog"] input[type="text"]');
  await textInputs.nth(1).fill('Nairobi'); // Town/City
  await textInputs.nth(2).fill('Nairobi'); // County/Region
  await textInputs.nth(3).fill('00100');   // ZIP/Postcode

  await page.waitForTimeout(1000);

  console.log('Clicking Next...');
  const nextBtn = page.locator('div[role="dialog"] div[role="button"][aria-label="Next"], div[role="dialog"] button:has-text("Next")').last();
  await nextBtn.click();
  await page.waitForTimeout(4000);

  const stepText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('=== Step Text After Address ===\n', stepText);

  const newInputs = await page.$$eval('[role="dialog"] input, [role="dialog"] select, [role="dialog"] textarea', els => els.map(e => ({
    tag: e.tagName,
    type: e.type,
    name: e.name,
    placeholder: e.placeholder,
    ariaLabel: e.getAttribute('aria-label')
  })));
  console.log('Inputs in step:\n', JSON.stringify(newInputs, null, 2));

  process.exit(0);
}

main().catch(console.error);
