const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('settings/basic')) || context.pages()[0];

  console.log('Clicking Add platform button...');
  const addBtn = page.locator('div[role="button"]:has-text("Add platform")');
  await addBtn.click();
  await page.waitForTimeout(3000);

  const dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('=== Add Platform Dialog ===\n', dialogText);

  // If website option is available, click it
  const websiteOption = page.locator('[role="dialog"] div[role="button"]:has-text("Website"), [role="dialog"] [role="checkbox"]:has-text("Website"), [role="dialog"] div:has-text("Website")');
  if (await websiteOption.count() > 0) {
    console.log('Selecting Website platform...');
    await websiteOption.first().click();
    await page.waitForTimeout(1000);

    const nextOrSave = page.locator('[role="dialog"] div[role="button"]:has-text("Next"), [role="dialog"] button:has-text("Next"), [role="dialog"] div[role="button"]:has-text("Save")');
    if (await nextOrSave.count() > 0) {
      console.log('Clicking Next/Save in platform modal...');
      await nextOrSave.first().click();
      await page.waitForTimeout(3000);
    }
  }

  // Check inputs on page for Site URL
  const inputs = await page.$$eval('input', els => els.map(e => ({ name: e.name, id: e.id, placeholder: e.placeholder, ariaLabel: e.getAttribute('aria-label') })));
  console.log('Inputs now:', inputs.filter(i => i.placeholder || i.name || i.ariaLabel));

  process.exit(0);
}

main().catch(console.error);
