const { chromium } = require('playwright-core');
const fs = require('fs');

async function inspectPermissionsPicker() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const details = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], [role="combobox"]')).map(b => ({
      text: b.innerText?.trim(),
      role: b.getAttribute('role'),
      ariaLabel: b.getAttribute('aria-label')
    }));

    const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
      placeholder: i.placeholder,
      type: i.type,
      id: i.id
    }));

    return { buttons, inputs };
  });

  console.log('Buttons/Comboboxes:', details.buttons);
  console.log('Inputs:', details.inputs);

  // Look for any dropdown or button to "Select permissions"
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('button, [role="button"], [role="combobox"], div, span'));
    const target = all.find(el => el.innerText && el.innerText.trim() === 'Select permissions');
    if (target) {
      console.log('Found Select permissions element! Clicking it...');
      target.click();
    }
  });

  await page.waitForTimeout(3000);

  // After click, what options or listbox appeared?
  const listboxOptions = await page.evaluate(() => {
    const options = Array.from(document.querySelectorAll('[role="option"], [role="menuitem"], [role="checkbox"], li')).map(el => ({
      text: el.innerText?.trim(),
      role: el.getAttribute('role')
    })).filter(x => x.text && x.text.length < 100);

    return { options, count: options.length };
  });

  fs.writeFileSync('scratch/permissions_options.json', JSON.stringify(listboxOptions, null, 2));
  console.log('Options found:', listboxOptions.options.slice(0, 20));
  await page.screenshot({ path: 'scratch/permissions_picker.png', timeout: 5000 }).catch(() => {});
}

inspectPermissionsPicker().catch(console.error);
