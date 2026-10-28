const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('security_center')) || context.pages()[0];

  const docLink = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('a, button, [role="button"], span'));
    const link = all.find(el => el.innerText && el.innerText.includes('accepted documents'));
    return link ? { text: link.innerText, href: link.href || null, tag: link.tagName } : null;
  });

  console.log('Accepted documents link:', docLink);
  process.exit(0);
}

main().catch(console.error);
