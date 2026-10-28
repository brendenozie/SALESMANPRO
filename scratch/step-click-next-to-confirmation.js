const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('Clicking Next on documents page...');
  const nextBtn = page.locator('div[role="dialog"] div[role="button"][aria-label="Next"], div[role="dialog"] button:has-text("Next")').last();
  await nextBtn.click();
  await page.waitForTimeout(4000);

  const stepText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('=== Step Text After Documents ===\n', stepText);

  // Check interactive elements in new step
  const elements = await page.$$eval('[role="dialog"] input, [role="dialog"] [role="radio"], [role="dialog"] [role="button"], [role="dialog"] button', els => els.map(e => ({
    tag: e.tagName,
    type: e.type,
    text: e.innerText ? e.innerText.trim() : '',
    ariaLabel: e.getAttribute('aria-label')
  })));
  console.log('Interactive elements in new step:\n', JSON.stringify(elements, null, 2));

  process.exit(0);
}

main().catch(console.error);
