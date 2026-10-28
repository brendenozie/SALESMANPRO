const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const url = 'https://developers.facebook.com/apps/2655372574841094/app-review/submissions/?submission_id=2655410581503960&business_id=2136306163848491';
  console.log('Navigating to submission:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click Go to reviewer instructions
  const btn = page.locator('div[role="button"]:has-text("Go to reviewer instructions")');
  if (await btn.count() > 0) {
    await btn.click();
    await page.waitForTimeout(3000);
  }

  const text = await page.evaluate(() => document.body.innerText);
  console.log('=== Reviewer Instructions Now ===\n', text.slice(0, 3000));

  process.exit(0);
}

main().catch(console.error);
