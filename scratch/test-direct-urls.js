const { chromium } = require('playwright-core');
const fs = require('fs');

async function testDirectUrls() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const urlsToTest = [
    'https://developers.facebook.com/apps/2655372574841094/publish/',
    'https://developers.facebook.com/apps/2655372574841094/review/verification/',
    'https://developers.facebook.com/apps/2655372574841094/review/app-review/',
    'https://developers.facebook.com/apps/2655372574841094/app-review/permissions/',
    'https://developers.facebook.com/apps/2655372574841094/app-review/requests/'
  ];

  for (const u of urlsToTest) {
    console.log(`\nTesting URL: ${u}`);
    await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    console.log(`Resolved URL: ${page.url()}`);
    const heading = await page.evaluate(() => {
      const h = document.querySelector('h1, h2, h3, [role="heading"]');
      return h ? h.innerText : 'No heading';
    });
    console.log(`Main heading: ${heading}`);
    const snippet = await page.evaluate(() => {
      return document.body ? document.body.innerText.slice(0, 1000).replace(/\n+/g, ' ') : '';
    });
    console.log(`Snippet: ${snippet.slice(0, 200)}...`);
  }
}

testDirectUrls().catch(console.error);
