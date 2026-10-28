const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('security_center')) || context.pages()[0];

  console.log('Page URL:', page.url());
  console.log('Page Title:', await page.title());

  await page.waitForTimeout(3000);
  const text = await page.evaluate(() => document.body.innerText);
  console.log('=== Security Center Text ===');
  console.log(text.slice(0, 3000));

  // Find buttons/actions
  const actions = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a[role="button"], [role="button"], a')).map(el => ({
      tag: el.tagName,
      text: el.innerText ? el.innerText.trim() : '',
      href: el.href || null
    })).filter(el => el.text && el.text.length < 50);
  });
  console.log('=== Actions ===');
  console.log(actions);

  process.exit(0);
}

main().catch(console.error);
