const { chromium } = require('playwright-core');
const fs = require('fs');

async function addPageAndInstagramUseCases() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Selecting "Manage messaging & content on Instagram"...');
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const igTitle = all.find(el => el.innerText && el.innerText.trim() === 'Manage messaging & content on Instagram');
    if (igTitle) {
      // Find card or checkbox/button
      const card = igTitle.closest('div[role="button"]') || igTitle.closest('div[role="checkbox"]') || igTitle.closest('label') || igTitle.parentElement?.parentElement || igTitle.parentElement;
      const checkbox = card ? card.querySelector('[role="checkbox"], input[type="checkbox"], [role="button"]') : null;
      if (checkbox) checkbox.click();
      else if (card) card.click();
      console.log('Clicked Instagram card');
    }
  });

  await page.waitForTimeout(1500);

  console.log('Selecting "Manage everything on your Page"...');
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const pageTitle = all.find(el => el.innerText && el.innerText.trim() === 'Manage everything on your Page');
    if (pageTitle) {
      const card = pageTitle.closest('div[role="button"]') || pageTitle.closest('div[role="checkbox"]') || pageTitle.closest('label') || pageTitle.parentElement?.parentElement || pageTitle.parentElement;
      const checkbox = card ? card.querySelector('[role="checkbox"], input[type="checkbox"], [role="button"]') : null;
      if (checkbox) checkbox.click();
      else if (card) card.click();
      console.log('Clicked Pages card');
    }
  });

  await page.waitForTimeout(1500);

  // Take screenshot of selected cards
  await page.screenshot({ path: 'scratch/selected_use_cases.png', timeout: 5000 }).catch(() => {});

  // Click Save
  console.log('Clicking Save...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, [role="button"]'));
    const saveBtn = btns.find(b => b.innerText && b.innerText.trim() === 'Save');
    if (saveBtn) saveBtn.click();
  });

  await page.waitForTimeout(5000);

  console.log('Current URL after save:', page.url());
  const text = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 3000) : '');
  console.log('Page text after adding use cases:');
  console.log(text.slice(0, 1500));
}

addPageAndInstagramUseCases().catch(console.error);
