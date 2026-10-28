const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('Clicking "Select a document type"...');
  const dropdown = page.locator('[role="dialog"]').getByText('Select a document type', { exact: false }).first();
  await dropdown.click();
  await page.waitForTimeout(1500);

  // List all menu items / options
  const options = await page.$$eval('[role="menu"] *, [role="listbox"] *, div[role="option"]', els => els.map(e => e.innerText.trim()).filter(Boolean));
  console.log('Menu/Listbox options:', options);

  if (options.length === 0) {
    // Check all visible items that appeared
    const all = await page.$$eval('*', els => els.map(e => ({ text: e.innerText ? e.innerText.trim() : '', role: e.getAttribute('role') })).filter(e => e.role === 'menuitem' || e.role === 'option'));
    console.log('Options found via role:', all);
  }

  process.exit(0);
}

main().catch(console.error);
