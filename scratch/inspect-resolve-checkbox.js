const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  // Inspect checkboxes in dialog
  const checkboxes = await page.$$eval('[role="dialog"] input[type="checkbox"], [role="dialog"] [role="checkbox"]', els => els.map(e => ({
    tag: e.tagName,
    role: e.getAttribute('role'),
    checked: e.checked || e.getAttribute('aria-checked'),
    ariaLabel: e.getAttribute('aria-label'),
    className: e.className
  })));
  console.log('Checkboxes in dialog:\n', checkboxes);

  // If there is an unchecked checkbox or role="checkbox", let's click it
  const cb = page.locator('[role="dialog"] input[type="checkbox"], [role="dialog"] [role="checkbox"]').first();
  console.log('Clicking checkbox...');
  await cb.click({ force: true });
  await page.waitForTimeout(1000);

  // Now check if Submit button became enabled
  const submitBtn = page.locator('div[role="dialog"] div[role="button"][aria-label="Submit"], div[role="dialog"] button:has-text("Submit")').last();
  const disabled = await submitBtn.getAttribute('aria-disabled');
  console.log('Submit button aria-disabled:', disabled);

  if (disabled !== 'true') {
    console.log('Submit button is enabled! Clicking Submit...');
    await submitBtn.click();
    await page.waitForTimeout(5000);

    const dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
    console.log('=== Step Text After Submit ===\n', dialogText);
  }

  process.exit(0);
}

main().catch(console.error);
