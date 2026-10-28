const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const devPage = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  await devPage.waitForTimeout(4000);

  const mainContent = await devPage.evaluate(() => {
    const main = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
    return main.innerText;
  });

  console.log('=== Main Content ===\n', mainContent);

  process.exit(0);
}

main().catch(console.error);
