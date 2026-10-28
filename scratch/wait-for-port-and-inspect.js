const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function isPortOpen(port = 9222) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log('Listening for Chrome on port 9222 (waiting for user to double-click Open-Chrome-Meta.bat)...');
  
  const startTime = Date.now();
  const maxWaitMs = 180000; // 3 minutes
  let ready = false;

  while (Date.now() - startTime < maxWaitMs) {
    if (await isPortOpen(9222)) {
      ready = true;
      break;
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  if (!ready) {
    console.error('TIMED_OUT: Port 9222 did not open within 3 minutes.');
    process.exit(1);
  }

  console.log('SUCCESS: Chrome CDP detected on port 9222! Connecting...');
  await new Promise(r => setTimeout(r, 2000)); // Allow tabs to initialize

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  console.log(`Connected to session! Total pages: ${pages.length}`);

  let page = pages.find(p => p.url().includes('developers.facebook.com')) || pages[0];
  if (!page) page = await context.newPage();

  console.log('Navigating/confirming developers.facebook.com/apps/ ...');
  if (!page.url().includes('developers.facebook.com/apps/')) {
    await page.goto('https://developers.facebook.com/apps/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  }
  await page.waitForTimeout(4000);

  console.log('Active Page Title:', await page.title(), 'URL:', page.url());
  await page.screenshot({ path: path.resolve(__dirname, 'meta_dashboard_live.png') });

  // Extract visible apps
  const appData = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('a[href*="/apps/"]').forEach(a => {
      const href = a.getAttribute('href');
      const text = a.innerText.trim();
      const match = href.match(/\/apps\/(\d+)/);
      if (match && !items.some(i => i.appId === match[1])) {
        items.push({
          appId: match[1],
          name: text.replace(/\n+/g, ' '),
          href: href
        });
      }
    });
    return items;
  });

  console.log('EXTRACTED_APPS:', JSON.stringify(appData, null, 2));

  // If we have an app, inspect its Basic Settings
  if (appData.length > 0) {
    const targetApp = appData.find(a => /salesman|salesforce|ghuba/i.test(a.name)) || appData[0];
    console.log(`Selecting app: ${targetApp.name} (App ID: ${targetApp.appId})`);
    
    // Navigate to basic settings
    const settingsUrl = `https://developers.facebook.com/apps/${targetApp.appId}/settings/basic/`;
    console.log(`Navigating to Basic Settings: ${settingsUrl}`);
    await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    await page.screenshot({ path: path.resolve(__dirname, 'meta_settings_basic.png') });

    // Look for App ID and Secret fields
    const settingsInfo = await page.evaluate(async () => {
      const inputs = Array.from(document.querySelectorAll('input'));
      let appId = null;
      let appSecret = null;

      inputs.forEach(input => {
        const val = input.value || '';
        const name = (input.name || '') + ' ' + (input.id || '') + ' ' + (input.getAttribute('aria-label') || '');
        if (/app.?id/i.test(name) || /^\d{15,16}$/.test(val)) {
          appId = val;
        }
        if (/secret/i.test(name) || input.type === 'password') {
          appSecret = val;
        }
      });

      return { appId, hasSecretInput: !!appSecret };
    });

    console.log('SETTINGS_INFO:', JSON.stringify(settingsInfo, null, 2));

    // Try clicking "Show" button for App Secret if present
    const showButton = await page.$('button:has-text("Show"), button:has-text("show"), div[role="button"]:has-text("Show")');
    if (showButton) {
      console.log('Found "Show" secret button, clicking...');
      await showButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.resolve(__dirname, 'meta_secret_dialog.png') });
    }

    // Save report to file
    fs.writeFileSync(
      path.resolve(__dirname, 'meta_app_extracted.json'),
      JSON.stringify({ targetApp, settingsInfo, timestamp: new Date().toISOString() }, null, 2)
    );
  }

  await browser.close();
  console.log('INSPECTION_COMPLETE');
}

main().catch(err => {
  console.error('ERROR_IN_INSPECTOR:', err);
  process.exit(1);
});
