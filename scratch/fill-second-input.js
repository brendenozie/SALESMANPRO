const { chromium } = require('playwright-core');

async function debugInputs() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, textarea')).map((el, idx) => ({
      idx,
      type: el.type,
      placeholder: el.placeholder,
      id: el.id,
      className: el.className,
      value: el.value,
      ariaLabel: el.getAttribute('aria-label')
    }));
  });

  console.log('Inputs:', JSON.stringify(inputs, null, 2));

  // Focus the second input (which is the name field!)
  if (inputs.length >= 2) {
    const allInputs = await page.$$('input');
    console.log('Focusing second input...');
    await allInputs[1].click();
    await allInputs[1].fill('SalesmanPro Social Manager');
    await page.waitForTimeout(1000);

    const nextBtn = await page.$('button:has-text("Next"), [role="button"]:has-text("Next")');
    if (nextBtn) {
      console.log('Clicking Next...');
      await nextBtn.click();
      await page.waitForTimeout(4000);
    }
  }

  const text = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 3000) : '');
  console.log('Text after next:');
  console.log(text.slice(0, 1500));
  await page.screenshot({ path: 'scratch/after_next_step2.png', timeout: 5000 }).catch(() => {});
}

debugInputs().catch(console.error);
