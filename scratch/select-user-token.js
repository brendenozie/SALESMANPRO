const { chromium } = require('playwright-core');
const fs = require('fs');

async function selectUserTokenAndNext() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Selecting "User access token"...');
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const opt = all.find(el => el.innerText && el.innerText.trim() === 'User access token');
    if (opt) {
      (opt.closest('[role="radio"]') || opt.closest('label') || opt.parentElement || opt).click();
    }
  });

  await page.waitForTimeout(1000);

  // Click Next
  console.log('Clicking Next...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, [role="button"]'));
    const nextBtn = btns.find(b => b.innerText && b.innerText.trim() === 'Next');
    if (nextBtn) nextBtn.click();
  });

  await page.waitForTimeout(4000);

  const text = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 3000) : '');
  console.log('Page text after Step 3:');
  console.log(text.slice(0, 1500));

  await page.screenshot({ path: 'scratch/step4_view.png', timeout: 5000 }).catch(() => {});
}

selectUserTokenAndNext().catch(console.error);
