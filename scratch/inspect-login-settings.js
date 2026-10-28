const { chromium } = require('playwright-core');
const fs = require('fs');

async function inspectLoginSettings() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  // Let's check the use cases / Facebook Login for Business
  console.log('Navigating to Use Cases...');
  await page.goto('https://developers.facebook.com/apps/2655372574841094/use-cases/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'scratch/use_cases_page.png' });

  // Read all links and buttons on the use cases page
  const useCaseDetails = await page.evaluate(() => {
    return {
      text: document.body ? document.body.innerText : '',
      links: Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText?.trim(), href: a.href })),
      buttons: Array.from(document.querySelectorAll('button, [role="button"]')).map(b => ({ text: b.innerText?.trim() }))
    };
  });

  fs.writeFileSync('scratch/use_cases_details.json', JSON.stringify(useCaseDetails, null, 2));
  console.log('Use cases text snippet:');
  console.log(useCaseDetails.text.slice(0, 1500));
}

inspectLoginSettings().catch(console.error);
