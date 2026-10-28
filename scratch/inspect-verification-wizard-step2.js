const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('Clicking "Next" in the country selection dialog...');
  const nextBtn = page.locator('div[role="dialog"] div[role="button"][aria-label="Next"]').last();
  await nextBtn.click();

  await page.waitForTimeout(3000);

  const dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('=== Dialog Text After Country Next ===\n', dialogText);

  const inputs = await page.$$eval('[role="dialog"] input, [role="dialog"] select, [role="dialog"] textarea', els => els.map(el => ({
    tag: el.tagName,
    type: el.type,
    name: el.name,
    value: el.value,
    placeholder: el.placeholder,
    ariaLabel: el.getAttribute('aria-label')
  })));
  console.log('=== Inputs in Dialog ===\n', JSON.stringify(inputs, null, 2));

  process.exit(0);
}

main().catch(console.error);
