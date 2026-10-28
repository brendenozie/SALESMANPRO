const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  // First dismiss modal if any
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button, [role="button"], div')).find(el => el.innerText && el.innerText.trim() === 'Continue to App Review');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);

  // Navigate to Verification
  console.log('--- Checking Business Verification ---');
  await page.goto('https://developers.facebook.com/apps/2655372574841094/verification/?business_id=2136306163848491', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const verifyText = await page.evaluate(() => document.body.innerText);
  console.log('Verification Page Text (first 2000 chars):\n', verifyText.slice(0, 2000));

  // Navigate to Go Live
  console.log('--- Checking Go Live Checklist ---');
  await page.goto('https://developers.facebook.com/apps/2655372574841094/go_live/?business_id=2136306163848491', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const goLiveText = await page.evaluate(() => document.body.innerText);
  console.log('Go Live Page Text (first 2500 chars):\n', goLiveText.slice(0, 2500));

  process.exit(0);
}

main().catch(console.error);
