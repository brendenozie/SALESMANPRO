const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('developers.facebook.com'));
  console.log('Current URL:', page.url());

  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, div[role="button"], a[role="button"], a')).map(b => ({
      tag: b.tagName,
      text: b.innerText ? b.innerText.trim() : '',
      ariaLabel: b.getAttribute('aria-label'),
      role: b.getAttribute('role')
    })).filter(b => b.text.length > 0);
  });

  console.log('Buttons:', buttons);
  process.exit(0);
}

main().catch(console.error);
