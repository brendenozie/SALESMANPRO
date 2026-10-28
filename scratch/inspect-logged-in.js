const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Connecting to Chrome over CDP on port 9222...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  console.log(`Connected! Total pages: ${pages.length}`);

  let page = pages.find(p => p.url().includes('developers.facebook.com')) || pages[0];
  console.log('Current page URL:', page.url());

  // Reload the page to pick up fresh login state
  console.log('Reloading https://developers.facebook.com/apps/ ...');
  await page.goto('https://developers.facebook.com/apps/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  const title = await page.title();
  const url = page.url();
  console.log(`Page reloaded: "${title}" - URL: ${url}`);

  // Take screenshot
  await page.screenshot({ path: path.resolve(__dirname, 'meta_apps_dashboard_live.png'), fullPage: false });

  // Extract all text and links
  const apps = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('a[href*="/apps/"]').forEach(a => {
      const text = a.innerText.trim();
      const href = a.getAttribute('href');
      const match = href.match(/\/apps\/(\d+)/);
      if (match && !list.some(x => x.appId === match[1])) {
        list.push({ appId: match[1], name: text.replace(/\n+/g, ' '), href });
      }
    });
    return list;
  });

  console.log('DETECTED_APPS:', JSON.stringify(apps, null, 2));

  // If apps found, inspect the first/matching one
  if (apps.length > 0) {
    const app = apps.find(a => /salesman|salesforce|ghuba/i.test(a.name)) || apps[0];
    console.log(`Inspecting app: ${app.name} (${app.appId})`);
    
    // Go to Basic Settings
    const settingsUrl = `https://developers.facebook.com/apps/${app.appId}/settings/basic/`;
    console.log(`Navigating to Settings: ${settingsUrl}`);
    await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.resolve(__dirname, 'meta_settings_page.png') });

    // Look for App ID and Secret
    const details = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      let appId = null;
      let appSecret = null;
      inputs.forEach(i => {
        const val = i.value;
        const meta = (i.name || '') + ' ' + (i.id || '') + ' ' + (i.getAttribute('aria-label') || '');
        if (/app.?id/i.test(meta) || /^\d{15,16}$/.test(val)) appId = val;
        if (/secret/i.test(meta) || i.type === 'password') appSecret = val;
      });
      return { appId, hasSecret: !!appSecret, secretLength: appSecret ? appSecret.length : 0 };
    });

    console.log('APP_BASIC_SETTINGS:', JSON.stringify(details, null, 2));

    // Check if Show button exists
    const showBtn = await page.$('button:has-text("Show"), div[role="button"]:has-text("Show")');
    if (showBtn) {
      console.log('Clicking "Show" button for App Secret...');
      await showBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.resolve(__dirname, 'meta_after_show_click.png') });
      
      // Re-read inputs after show click
      const updatedSecret = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        for (const i of inputs) {
          const meta = (i.name || '') + ' ' + (i.id || '');
          if ((/secret/i.test(meta) || i.type === 'text') && /^[a-f0-9]{32}$/i.test(i.value)) {
            return i.value;
          }
        }
        return null;
      });

      if (updatedSecret) {
        console.log('App Secret retrieved successfully! (Length: ' + updatedSecret.length + ')');
        fs.writeFileSync(path.resolve(__dirname, 'secret_store.tmp'), JSON.stringify({ appId: details.appId || app.appId, secret: updatedSecret }));
      }
    }
  } else {
    // Check page text to see what is displayed
    const bodyText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 1500) : '');
    console.log('Page Text:\n', bodyText);
  }

  await browser.close();
  console.log('DONE');
}

main().catch(err => {
  console.error('Error in inspection:', err);
  process.exit(1);
});
