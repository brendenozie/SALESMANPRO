const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const devPage = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const targetUrl = 'https://developers.facebook.com/apps/2655372574841094/app-review/submissions/?submission_id=2655410581503960&business_id=2136306163848491';
  console.log('Navigating to submission wizard:', targetUrl);
  await devPage.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await devPage.waitForTimeout(5000);

  const mainText = await devPage.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText;
  });

  console.log('=== Submission Wizard Content ===\n', mainText);

  process.exit(0);
}

main().catch(console.error);
