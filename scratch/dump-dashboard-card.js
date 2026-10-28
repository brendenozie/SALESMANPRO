const { chromium } = require('playwright-core');
const fs = require('fs');

async function dumpDashboardCard() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const cardHtml = await page.evaluate(() => {
    // Find heading "App customization and requirements"
    const all = Array.from(document.querySelectorAll('*'));
    const h = all.find(el => el.innerText && el.innerText.trim() === 'App customization and requirements');
    if (!h) return 'Not found';
    const container = h.closest('.x78zum5') || h.parentElement?.parentElement || h.parentElement;
    return container ? container.outerHTML : 'Container not found';
  });

  fs.writeFileSync('scratch/dashboard_card.html', cardHtml);
  console.log('Saved card HTML length:', cardHtml.length);
}

dumpDashboardCard().catch(console.error);
