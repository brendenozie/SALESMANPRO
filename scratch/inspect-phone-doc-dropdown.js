const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('Selecting "No" for Did your document include your business phone number?...');
  const noOption = page.locator('[role="dialog"]').getByText('No', { exact: true }).first();
  await noOption.click();
  await page.waitForTimeout(1000);

  // Check the second combobox (for phone verification)
  const comboboxes = page.locator('[role="dialog"] [role="combobox"]');
  console.log('Comboboxes count:', await comboboxes.count());

  if (await comboboxes.count() > 1) {
    await comboboxes.nth(1).click({ force: true });
    await page.waitForTimeout(1500);

    const options = await page.$$eval('[role="option"], [role="menuitem"]', els => els.map(e => e.innerText.trim()));
    console.log('Phone document options:', options);
  }

  process.exit(0);
}

main().catch(console.error);
