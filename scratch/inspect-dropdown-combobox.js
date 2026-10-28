const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  // Find combobox / select in dialog
  const trigger = page.locator('[role="dialog"] [role="combobox"], [role="dialog"] [aria-haspopup="listbox"], [role="dialog"] [aria-haspopup="menu"]');
  console.log('Combobox count:', await trigger.count());

  if (await trigger.count() > 0) {
    await trigger.first().click({ force: true });
    await page.waitForTimeout(1500);

    const options = await page.$$eval('[role="option"], [role="menuitem"]', els => els.map(e => e.innerText.trim()));
    console.log('Options after clicking combobox:', options);
  } else {
    // Try clicking text "Select a document type" with force: true
    const txt = page.locator('[role="dialog"]').getByText('Select a document type');
    await txt.first().click({ force: true });
    await page.waitForTimeout(1500);

    const options = await page.$$eval('[role="option"], [role="menuitem"]', els => els.map(e => e.innerText.trim()));
    console.log('Options after clicking text:', options);
  }

  process.exit(0);
}

main().catch(console.error);
