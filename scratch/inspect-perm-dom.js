const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const details = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const match = all.find(el => el.children.length === 0 && el.innerText && el.innerText.trim() === 'instagram_basic');
    if (!match) return { found: false };

    // find ancestor row
    let curr = match;
    for (let i = 0; i < 8; i++) {
      if (curr.parentElement) curr = curr.parentElement;
    }
    return {
      found: true,
      html: curr.outerHTML.slice(0, 1500),
      buttons: Array.from(curr.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Add to App Review').map(el => ({
        tag: el.tagName,
        classes: el.className,
        role: el.getAttribute('role'),
        ariaLabel: el.getAttribute('aria-label')
      }))
    };
  });

  console.log('DOM details for instagram_basic:');
  console.log(JSON.stringify(details, null, 2));

  process.exit(0);
}

main().catch(console.error);
