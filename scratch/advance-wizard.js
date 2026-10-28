const { chromium } = require('playwright-core');
const fs = require('fs');

async function advanceWizard() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  async function clickNext(stepName) {
    console.log(`\n--- Clicking Next for ${stepName} ---`);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, [role="button"]'));
      const nextBtn = btns.find(b => b.innerText && b.innerText.trim() === 'Next');
      if (nextBtn) nextBtn.click();
    });
    await page.waitForTimeout(4000);
    const text = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 3000) : '');
    console.log(`Text after ${stepName}:`);
    console.log(text.slice(0, 1000));
    await page.screenshot({ path: `scratch/wizard_${stepName}.png`, timeout: 5000 }).catch(() => {});
    return text;
  }

  // Step 2 -> Step 3
  await clickNext('step2_login_variation');

  // Step 3 -> Step 4
  await clickNext('step3_access_token');

  // Dump Step 4 Assets options
  const assetsInfo = await page.evaluate(() => {
    return {
      text: document.body ? document.body.innerText.slice(0, 3000) : '',
      checkboxes: Array.from(document.querySelectorAll('[role="checkbox"], input[type="checkbox"]')).map(c => ({
        id: c.id,
        label: c.getAttribute('aria-label') || c.parentElement?.innerText?.trim(),
        checked: c.getAttribute('aria-checked') === 'true' || c.checked
      }))
    };
  });

  fs.writeFileSync('scratch/step4_assets.json', JSON.stringify(assetsInfo, null, 2));
  console.log('Step 4 Assets checkboxes:', assetsInfo.checkboxes);
}

advanceWizard().catch(console.error);
