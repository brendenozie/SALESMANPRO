const { chromium } = require('playwright-core');
const fs = require('fs');

async function inspectAppReview() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Navigating to App Review -> Permissions and Features...');
  const url = 'https://developers.facebook.com/apps/2655372574841094/app-review/permissions/';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'scratch/app_review_permissions.png', timeout: 5000 }).catch(() => {});

  const info = await page.evaluate(() => {
    return {
      url: window.location.href,
      title: document.title,
      text: document.body ? document.body.innerText.slice(0, 4000) : '',
      buttons: Array.from(document.querySelectorAll('button, [role="button"]')).map(b => b.innerText?.trim()).filter(Boolean),
      inputs: Array.from(document.querySelectorAll('input')).map(i => ({ placeholder: i.placeholder, value: i.value }))
    };
  });

  fs.writeFileSync('scratch/app_review_info.json', JSON.stringify(info, null, 2));
  console.log('App Review Text Snippet:');
  console.log(info.text.slice(0, 2000));
}

inspectAppReview().catch(console.error);
