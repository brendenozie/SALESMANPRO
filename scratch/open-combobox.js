const { chromium } = require('playwright-core');
const fs = require('fs');

async function openPermissionsCombobox() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Clicking the combobox...');
  await page.evaluate(() => {
    const cb = document.querySelector('[role="combobox"]');
    if (cb) cb.click();
  });

  await page.waitForTimeout(3000);

  // Inspect what elements appeared
  const items = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const options = all.filter(el => {
      const role = el.getAttribute('role');
      return role === 'option' || role === 'menuitem' || role === 'checkbox' || el.tagName === 'LI';
    }).map(el => ({
      text: el.innerText?.trim(),
      role: el.getAttribute('role'),
      tag: el.tagName
    })).filter(x => x.text && x.text.length < 100);

    const fullBodyText = document.body ? document.body.innerText : '';
    return { options, fullBodyText: fullBodyText.slice(0, 4000) };
  });

  console.log('Items found:', items.options);
  fs.writeFileSync('scratch/combobox_options.json', JSON.stringify(items, null, 2));
  await page.screenshot({ path: 'scratch/combobox_open.png', timeout: 5000 }).catch(() => {});
}

openPermissionsCombobox().catch(console.error);
