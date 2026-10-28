const { chromium } = require('playwright-core');

async function watchLogin() {
  console.log('Connecting to Chrome on port 9222 to monitor login state...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  
  const startTime = Date.now();
  const maxWaitMs = 120000; // 2 minutes

  while (Date.now() - startTime < maxWaitMs) {
    const cookies = await context.cookies(['https://www.facebook.com']);
    const hasCUser = cookies.some(c => c.name === 'c_user');
    
    if (hasCUser) {
      console.log('SUCCESS: Active Facebook session cookie (c_user) detected!');
      
      const page = context.pages().find(p => p.url().includes('facebook.com')) || context.pages()[0];
      console.log('Navigating to https://developers.facebook.com/apps/ ...');
      await page.goto('https://developers.facebook.com/apps/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);
      console.log('Destination reached:', await page.title(), page.url());
      await page.screenshot({ path: 'scratch/meta_apps_dashboard.png' });
      await browser.close();
      return;
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('TIMEOUT: Waiting for user login timed out after 2 minutes.');
  await browser.close();
}

watchLogin().catch(console.error);
