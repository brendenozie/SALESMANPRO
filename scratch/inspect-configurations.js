const { chromium } = require('playwright-core');
const fs = require('fs');

async function inspectConfigurations() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const url = 'https://developers.facebook.com/apps/2655372574841094/business-login/configurations/?business_id=2136306163848491';
  console.log('Navigating to Configurations:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const text = await page.evaluate(() => document.body ? document.body.innerText : '');
  console.log('Configurations Snippet:');
  console.log(text.slice(0, 1500));

  await page.screenshot({ path: 'scratch/configurations_view.png', timeout: 5000 }).catch(() => {});
}

inspectConfigurations().catch(console.error);
