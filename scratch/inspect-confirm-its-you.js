const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  const details = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return 'No dialog';
    return {
      html: dialog.innerHTML.slice(0, 3000),
      iframes: Array.from(dialog.querySelectorAll('iframe')).map(f => f.src),
      text: dialog.innerText
    };
  });

  console.log('Dialog details:\n', JSON.stringify(details, null, 2));
  process.exit(0);
}

main().catch(console.error);
