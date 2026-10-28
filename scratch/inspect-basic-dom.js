const { chromium } = require('playwright-core');
const fs = require('fs');

async function dumpBasicSettings() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const appIds = ['2655372574841094', '1771621140731336'];

  for (const id of appIds) {
    console.log(`\n================ Inspecting App ${id} Basic Settings ================`);
    await page.goto(`https://developers.facebook.com/apps/${id}/settings/basic/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    const data = await page.evaluate(() => {
      // Find all labels, text, inputs, and buttons
      const info = [];
      document.querySelectorAll('label, [role="button"], button, input, div[class*="field"], div[class*="secret"], div[class*="appId"]').forEach(el => {
        const text = el.innerText ? el.innerText.trim() : '';
        const tag = el.tagName.toLowerCase();
        const type = el.getAttribute('type') || '';
        const val = el.value || '';
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (text || val) {
          info.push({ tag, type, text: text.replace(/\n+/g, ' | '), val, ariaLabel });
        }
      });
      return {
        bodyText: document.body ? document.body.innerText.slice(0, 3000) : '',
        elements: info.slice(0, 50)
      };
    });

    console.log(`Page Text for App ${id}:\n`, data.bodyText);
    fs.writeFileSync(`scratch/app_${id}_basic_dump.json`, JSON.stringify(data, null, 2));
  }

  await browser.close();
}

dumpBasicSettings().catch(console.error);
