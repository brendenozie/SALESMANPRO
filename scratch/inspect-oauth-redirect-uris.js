const { chromium } = require('playwright-core');
const fs = require('fs');

async function inspectOAuthRedirectUris() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const url = 'https://developers.facebook.com/apps/2655372574841094/business-login/settings/?business_id=2136306163848491';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const data = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, textarea')).map(i => ({
      id: i.id,
      name: i.name,
      type: i.type,
      value: i.value,
      placeholder: i.placeholder
    }));

    // Find any list of URIs or spans
    const text = document.body ? document.body.innerText : '';
    return { inputs, textSnippet: text.slice(0, 3000) };
  });

  console.log('Inputs found:');
  console.log(data.inputs);
  console.log('Snippet:');
  console.log(data.textSnippet.slice(0, 1500));
}

inspectOAuthRedirectUris().catch(console.error);
