const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('security_center')) || context.pages()[0];

  const info = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const matches = all.filter(el => el.children.length === 0 && el.innerText && el.innerText.trim() === 'Continue');
    return matches.map(el => {
      let p = el;
      const chain = [];
      for (let i = 0; i < 5; i++) {
        if (p) {
          chain.push({ tag: p.tagName, role: p.getAttribute('role'), href: p.href || null, classes: p.className });
          p = p.parentElement;
        }
      }
      return { text: el.innerText, chain };
    });
  });

  console.log('Continue button details:', JSON.stringify(info, null, 2));
  process.exit(0);
}

main().catch(console.error);
