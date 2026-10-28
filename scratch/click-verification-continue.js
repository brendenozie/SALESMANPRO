const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('security_center')) || context.pages()[0];

  console.log('Finding Continue button for business verification...');
  await page.evaluate(() => {
    // Find "Pending submission" or "Verification for SALESMANPRO"
    const allEls = Array.from(document.querySelectorAll('*'));
    const pending = allEls.find(el => el.innerText && el.innerText.trim() === 'Pending submission');
    if (pending) {
      let parent = pending.parentElement;
      while (parent && !parent.querySelector('[role="button"], button') && parent.tagName !== 'BODY') {
        parent = parent.parentElement;
      }
      if (parent) {
        const btn = Array.from(parent.querySelectorAll('[role="button"], button, div')).find(el => el.innerText && el.innerText.trim() === 'Continue');
        if (btn) {
          btn.click();
          return;
        }
      }
    }
    // Fallback: any button with text "Continue"
    const anyContinue = allEls.find(el => (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' || el.tagName === 'DIV') && el.innerText && el.innerText.trim() === 'Continue');
    if (anyContinue) anyContinue.click();
  });

  await page.waitForTimeout(4000);
  console.log('Current URL after continue:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('=== Verification Screen Text ===');
  console.log(bodyText.slice(0, 3000));

  process.exit(0);
}

main().catch(console.error);
