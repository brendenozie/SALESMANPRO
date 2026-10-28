const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const devPage = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const buttons = await devPage.$$eval('button, [role="button"], a', els => els.map(e => ({
    tag: e.tagName,
    text: e.innerText ? e.innerText.trim() : '',
    role: e.getAttribute('role'),
    href: e.href || null
  })).filter(e => e.text && (e.text.includes('Next') || e.text.includes('Submit') || e.text.includes('Continue') || e.text.includes('Add'))));

  console.log('Relevant buttons/links:\n', buttons);

  process.exit(0);
}

main().catch(console.error);
