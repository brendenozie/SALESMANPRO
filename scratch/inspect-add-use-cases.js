const { chromium } = require('playwright-core');
const fs = require('fs');

async function inspectAddUseCases() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Navigating to dashboard...');
  await page.goto('https://developers.facebook.com/apps/2655372574841094/dashboard/?business_id=2136306163848491', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click "Add use cases"
  console.log('Clicking "Add use cases"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, [role="button"], a'));
    const btn = btns.find(b => b.innerText && b.innerText.trim() === 'Add use cases');
    if (btn) btn.click();
  });

  await page.waitForTimeout(4000);
  console.log('Current URL after Add use cases:', page.url());

  const data = await page.evaluate(() => {
    const text = document.body ? document.body.innerText : '';
    const cards = Array.from(document.querySelectorAll('h2, h3, h4, [role="heading"], button, a')).map(el => el.innerText?.trim()).filter(Boolean);
    return { text, cards };
  });

  fs.writeFileSync('scratch/add_use_cases_view.json', JSON.stringify(data, null, 2));
  console.log('Text snippet of available use cases:');
  console.log(data.text.slice(0, 2000));

  await page.screenshot({ path: 'scratch/available_use_cases.png', timeout: 5000 }).catch(() => {});
}

inspectAddUseCases().catch(console.error);
