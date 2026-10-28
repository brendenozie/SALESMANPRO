const { chromium } = require('playwright-core');
const fs = require('fs');

async function stepThroughConfig() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Step 1: Typing configuration name...');
  // Find name input
  await page.evaluate(() => {
    const input = document.querySelector('input[type="text"]') || document.querySelector('input');
    if (input) {
      input.value = 'SalesmanPro Social Connect';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
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

  await page.waitForTimeout(3000);

  // Step 2 content
  console.log('Step 2 (Login variation):');
  const text2 = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 3000) : '');
  console.log(text2.slice(0, 1500));

  await page.screenshot({ path: 'scratch/config_step2.png', timeout: 5000 }).catch(() => {});
}

stepThroughConfig().catch(console.error);
