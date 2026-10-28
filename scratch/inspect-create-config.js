const { chromium } = require('playwright-core');
const fs = require('fs');

async function inspectCreateConfiguration() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Clicking "Create configuration"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, [role="button"], a'));
    const btn = btns.find(b => b.innerText && b.innerText.trim() === 'Create configuration');
    if (btn) btn.click();
  });

  await page.waitForTimeout(4000);
  console.log('Current URL after create configuration:', page.url());

  const data = await page.evaluate(() => {
    const text = document.body ? document.body.innerText : '';
    const inputs = Array.from(document.querySelectorAll('input, [role="checkbox"]')).map(i => ({
      id: i.id,
      name: i.name,
      type: i.type,
      ariaLabel: i.getAttribute('aria-label')
    }));
    return { text, inputs };
  });

  fs.writeFileSync('scratch/create_configuration_view.json', JSON.stringify(data, null, 2));
  console.log('Text snippet:');
  console.log(data.text.slice(0, 1500));

  await page.screenshot({ path: 'scratch/create_config_dialog.png', timeout: 5000 }).catch(() => {});
}

inspectCreateConfiguration().catch(console.error);
