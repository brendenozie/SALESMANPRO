const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('settings/basic'));

  const bottomText = await page.evaluate(() => {
    // Scroll to bottom
    window.scrollTo(0, document.body.scrollHeight);
    return document.body.innerText.slice(-2500);
  });

  console.log('=== Bottom 2500 chars of Basic Settings ===\n', bottomText);
  process.exit(0);
}

main().catch(console.error);
