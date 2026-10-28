const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('settings/basic')) || context.pages()[0];

  console.log('Filling site_url with https://salesmanpro.store ...');
  const siteUrlInput = page.locator('input[name="site_url"]');
  await siteUrlInput.scrollIntoViewIfNeeded();
  await siteUrlInput.fill('https://salesmanpro.store');

  // Also add salesmanpro.store to app domains if not already there
  console.log('Checking app domains...');
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[name="basic_domains[]"]'));
    const empty = inputs.find(i => !i.value);
    if (empty) {
      empty.value = 'salesmanpro.store';
      empty.dispatchEvent(new Event('input', { bubbles: true }));
      empty.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  await page.waitForTimeout(1000);

  // Click Save Changes button
  console.log('Clicking Save Changes...');
  const saveBtn = page.locator('div[role="button"]:has-text("Save Changes"), button:has-text("Save Changes")');
  await saveBtn.scrollIntoViewIfNeeded();
  await saveBtn.click();

  await page.waitForTimeout(5000);

  const text = await page.evaluate(() => document.body.innerText);
  console.log('Saved successfully! Check text snippet:');
  console.log(text.slice(0, 1000));

  process.exit(0);
}

main().catch(console.error);
