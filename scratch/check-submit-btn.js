const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('submission_id=2655410581503960'));

  const submitBtn = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const btn = all.find(el => (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') && el.innerText && el.innerText.trim() === 'Submit for review');
    if (!btn) return { found: false };
    return {
      found: true,
      tag: btn.tagName,
      role: btn.getAttribute('role'),
      disabled: btn.getAttribute('aria-disabled') || btn.disabled,
      classes: btn.className
    };
  });

  console.log('Submit button info:', submitBtn);
  process.exit(0);
}

main().catch(console.error);
