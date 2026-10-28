const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const url = 'https://developers.facebook.com/apps/2655372574841094/use_cases/customize/?use_case_enum=PAGES_API&business_id=2136306163848491';
  console.log('Navigating to Pages API Use Case:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('=== Pages API Use Case Page Text ===');
  console.log(bodyText.slice(0, 3000));

  const buttonsAndLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a, input[type="checkbox"], [role="button"]')).map(el => ({
      tag: el.tagName,
      text: el.innerText ? el.innerText.trim() : '',
      ariaLabel: el.getAttribute('aria-label'),
      href: el.href || null
    })).filter(el => el.text || el.ariaLabel || el.href);
  });

  console.log('=== Actionable Elements ===');
  console.log(JSON.stringify(buttonsAndLinks.slice(0, 40), null, 2));

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
