const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  const inputs = await page.$$eval('[role="dialog"] input', els => els.map(e => ({
    type: e.type,
    value: e.value,
    placeholder: e.placeholder,
    ariaLabel: e.getAttribute('aria-label')
  })));
  console.log('Inputs on Confirm phone number:\n', inputs);

  // Check buttons
  const btns = await page.$$eval('[role="dialog"] [role="button"], [role="dialog"] button', els => els.map(e => e.innerText.trim()).filter(Boolean));
  console.log('Buttons on Confirm phone number:', btns);

  process.exit(0);
}

main().catch(console.error);
