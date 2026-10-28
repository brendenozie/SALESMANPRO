const { chromium } = require('playwright-core');
const fs = require('fs');

async function inspectDashboardRequirements() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Navigating to dashboard...');
  await page.goto('https://developers.facebook.com/apps/2655372574841094/dashboard/?business_id=2136306163848491', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Read all items in "App customization and requirements"
  const items = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('*')).filter(el => {
      const t = el.innerText?.trim();
      return t && (
        t === 'Review and complete testing requirements' ||
        t === 'Business verification' ||
        t === 'App Review' ||
        t === 'Check that all requirements are met, then publish your app.' ||
        t === 'Facebook Login for Business'
      );
    });
    return list.map(el => ({
      text: el.innerText.trim(),
      tag: el.tagName,
      role: el.getAttribute('role'),
      clickable: el.onclick !== null || el.closest('[role="button"]') !== null || el.closest('a') !== null
    }));
  });

  console.log('Dashboard requirement items found:', items);

  // Let's click "Business verification" first
  console.log('\n--- Clicking "Business verification" ---');
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const bv = all.find(el => el.innerText && el.innerText.trim() === 'Business verification');
    if (bv) {
      (bv.closest('div[role="button"]') || bv.parentElement || bv).click();
    }
  });
  await page.waitForTimeout(4000);
  console.log('URL after Business verification click:', page.url());
  const bvText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 3000) : '');
  console.log('Business verification view snippet:');
  console.log(bvText.slice(0, 1000));
  await page.screenshot({ path: 'scratch/business_verification_view.png', timeout: 5000 }).catch(() => {});

  // Go back to dashboard
  await page.goto('https://developers.facebook.com/apps/2655372574841094/dashboard/?business_id=2136306163848491', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Let's click "App Review"
  console.log('\n--- Clicking "App Review" ---');
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const ar = all.find(el => el.innerText && el.innerText.trim() === 'App Review');
    if (ar) {
      (ar.closest('div[role="button"]') || ar.parentElement || ar).click();
    }
  });
  await page.waitForTimeout(4000);
  console.log('URL after App Review click:', page.url());
  const arText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 3000) : '');
  console.log('App Review view snippet:');
  console.log(arText.slice(0, 1000));
  await page.screenshot({ path: 'scratch/app_review_view.png', timeout: 5000 }).catch(() => {});

  // Go back to dashboard
  await page.goto('https://developers.facebook.com/apps/2655372574841094/dashboard/?business_id=2136306163848491', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Let's click "Check that all requirements are met, then publish your app."
  console.log('\n--- Clicking "Check that all requirements are met, then publish your app." ---');
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const pub = all.find(el => el.innerText && el.innerText.trim() === 'Check that all requirements are met, then publish your app.');
    if (pub) {
      (pub.closest('div[role="button"]') || pub.parentElement || pub).click();
    }
  });
  await page.waitForTimeout(4000);
  console.log('URL after Publish click:', page.url());
  const pubText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 3000) : '');
  console.log('Publish view snippet:');
  console.log(pubText.slice(0, 1000));
  await page.screenshot({ path: 'scratch/publish_view.png', timeout: 5000 }).catch(() => {});
}

inspectDashboardRequirements().catch(console.error);
