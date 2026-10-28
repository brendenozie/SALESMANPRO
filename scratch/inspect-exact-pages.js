const { chromium } = require('playwright-core');
const fs = require('fs');

async function inspectExactPages() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const pages = [
    {
      name: 'business_login',
      url: 'https://developers.facebook.com/apps/2655372574841094/business-login/?business_id=2136306163848491'
    },
    {
      name: 'verification',
      url: 'https://developers.facebook.com/apps/2655372574841094/verification/?business_id=2136306163848491'
    },
    {
      name: 'app_review_submissions',
      url: 'https://developers.facebook.com/apps/2655372574841094/app-review/submissions/?business_id=2136306163848491'
    },
    {
      name: 'go_live',
      url: 'https://developers.facebook.com/apps/2655372574841094/go_live/?business_id=2136306163848491'
    }
  ];

  const report = {};

  for (const item of pages) {
    console.log(`\nNavigating to ${item.name} (${item.url})...`);
    await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    const data = await page.evaluate(() => {
      const text = document.body ? document.body.innerText.slice(0, 3000) : '';
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], a')).map(b => ({
        text: b.innerText?.trim(),
        role: b.getAttribute('role'),
        href: b.getAttribute('href')
      })).filter(b => b.text && b.text.length < 50);

      return { text, buttons };
    });

    report[item.name] = {
      resolvedUrl: page.url(),
      snippet: data.text.slice(0, 1000).replace(/\n+/g, ' '),
      buttons: data.buttons.slice(0, 15)
    };

    await page.screenshot({ path: `scratch/step_${item.name}.png`, timeout: 5000 }).catch(() => {});
  }

  fs.writeFileSync('scratch/exact_pages_report.json', JSON.stringify(report, null, 2));
  console.log('\nReport completed and saved to scratch/exact_pages_report.json');
}

inspectExactPages().catch(console.error);
