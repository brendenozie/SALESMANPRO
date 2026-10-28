const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const devPage = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  // Expand all sections
  const expandButtons = devPage.locator('button[aria-expanded="false"], div[role="button"][aria-expanded="false"]');
  const count = await expandButtons.count();
  console.log('Expand buttons count:', count);
  for (let i = 0; i < count; i++) {
    try {
      await expandButtons.nth(i).click({ force: true });
      await devPage.waitForTimeout(500);
    } catch (e) {}
  }

  await devPage.waitForTimeout(2000);

  const mainText = await devPage.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText;
  });

  console.log('=== All Expanded Sections Content ===\n', mainText);

  process.exit(0);
}

main().catch(console.error);
