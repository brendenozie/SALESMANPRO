const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('settings/basic')) || context.pages()[0];

  console.log('Finding Site URL input...');
  const siteUrlInput = page.locator('input[placeholder="URL of your site"], input[name="site_url"]');
  console.log('Site URL input count:', await siteUrlInput.count());

  await siteUrlInput.first().scrollIntoViewIfNeeded();
  await siteUrlInput.first().fill('https://salesmanpro.store');
  await page.waitForTimeout(1000);

  console.log('Clicking Save Changes button...');
  const saveBtn = page.locator('div[role="button"]:has-text("Save Changes"), button:has-text("Save Changes")');
  await saveBtn.scrollIntoViewIfNeeded();
  await saveBtn.click();

  await page.waitForTimeout(5000);

  // Check if save was successful
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Bottom text after save:\n', text.slice(-1000));

  process.exit(0);
}

main().catch(console.error);
