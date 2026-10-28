const { chromium } = require('playwright-core');
const fs = require('fs');

async function inspectReviewAndPublish() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const results = {};

  // 1. App Review
  console.log('1. Navigating to App Review...');
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[role="listitem"]'));
    const target = items.find(el => el.innerText && el.innerText.trim() === 'App Review');
    if (target) target.click();
  });
  await page.waitForTimeout(5000);
  results.appReviewUrl = page.url();
  results.appReviewText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 3000) : '');

  // 2. Verification
  console.log('2. Navigating to Verification...');
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[role="listitem"]'));
    const target = items.find(el => el.innerText && el.innerText.trim() === 'Verification');
    if (target) target.click();
  });
  await page.waitForTimeout(5000);
  results.verificationUrl = page.url();
  results.verificationText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 3000) : '');

  // 3. Publish / Go Live toggle
  console.log('3. Navigating to Publish...');
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[role="listitem"], [role="status"], [role="button"], span, div'));
    const target = items.find(el => el.innerText && (el.innerText.trim() === 'Publish' || el.innerText.trim() === 'Unpublished'));
    if (target) target.click();
  });
  await page.waitForTimeout(4000);
  results.publishUrl = page.url();
  results.publishText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 3000) : '');

  fs.writeFileSync('scratch/review_and_publish_results.json', JSON.stringify(results, null, 2));
  console.log('Finished. App Review URL:', results.appReviewUrl);
  console.log('Verification URL:', results.verificationUrl);
  console.log('Publish URL:', results.publishUrl);
}

inspectReviewAndPublish().catch(console.error);
