const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.innerText.trim(),
      href: a.href
    })).filter(a => a.href && !a.href.includes('javascript:'));
  });

  console.log('All Links on Page:');
  links.forEach(l => console.log(`${l.text} -> ${l.href}`));

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
