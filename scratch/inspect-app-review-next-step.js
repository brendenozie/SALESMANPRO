const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const devPage = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Clicking Next on App Review submissions page...');
  const nextBtn = devPage.locator('button:has-text("Next"), [role="button"]:has-text("Next")').last();
  await nextBtn.click({ force: true });
  await devPage.waitForTimeout(4000);

  const mainText = await devPage.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText;
  });

  console.log('=== App Review Wizard Screen ===\n', mainText);

  process.exit(0);
}

main().catch(console.error);
