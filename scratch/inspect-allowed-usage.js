const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('submission_id=2655410581503960'));

  console.log('Clicking Go to allowed usage...');
  const btn = page.locator('div[role="button"]:has-text("Go to allowed usage")');
  await btn.click();
  await page.waitForTimeout(4000);

  console.log('URL after click:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('=== Allowed Usage Text (first 2500 chars) ===\n', bodyText.slice(0, 2500));

  process.exit(0);
}

main().catch(console.error);
