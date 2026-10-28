const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const apps = [
    { appId: '1771621140731336', url: 'https://developers.facebook.com/apps/1771621140731336/dashboard/' },
    { appId: '2655372574841094', url: 'https://developers.facebook.com/apps/2655372574841094/dashboard/?business_id=2136306163848491' }
  ];

  const results = [];

  for (const app of apps) {
    console.log(`\n========================================`);
    console.log(`Inspecting App ID: ${app.appId}`);
    await page.goto(app.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    const title = await page.title();
    console.log(`Dashboard Title: ${title}`);
    await page.screenshot({ path: `scratch/app_${app.appId}_dashboard.png` });

    // Extract App Name from header/DOM
    const appInfo = await page.evaluate(() => {
      const h1 = document.querySelector('h1, [data-testid="app-header-name"], [class*="AppName"]');
      const text = document.body ? document.body.innerText.slice(0, 1500) : '';
      return {
        headerText: h1 ? h1.innerText : '',
        bodySnippet: text
      };
    });

    // Navigate to Settings -> Basic
    const basicUrl = `https://developers.facebook.com/apps/${app.appId}/settings/basic/`;
    console.log(`Navigating to Settings -> Basic: ${basicUrl}`);
    await page.goto(basicUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `scratch/app_${app.appId}_basic_settings.png` });

    const settingsData = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      let appId = null;
      let displayAppName = null;
      let appSecretMasked = null;

      inputs.forEach(input => {
        const val = input.value || '';
        const name = (input.name || '') + ' ' + (input.id || '') + ' ' + (input.getAttribute('aria-label') || '');
        if (/app.?id/i.test(name) || /^\d{15,16}$/.test(val)) appId = val;
        if (/display.?name|app.?name/i.test(name)) displayAppName = val;
        if (/secret/i.test(name) || input.type === 'password') appSecretMasked = val;
      });

      return { appId, displayAppName, hasSecretInput: !!appSecretMasked };
    });

    console.log('Basic Settings:', settingsData);

    // Click Show button for App Secret
    let secret = null;
    const showBtn = await page.$('button:has-text("Show"), div[role="button"]:has-text("Show")');
    if (showBtn) {
      console.log('Clicking "Show" button for App Secret...');
      await showBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `scratch/app_${app.appId}_secret_dialog.png` });

      // Check if password prompt appeared or if secret was revealed directly
      secret = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        for (const input of inputs) {
          if (input.type === 'text' && /^[a-f0-9]{32}$/i.test(input.value)) {
            return input.value;
          }
        }
        return null;
      });
      console.log('Secret revealed directly:', secret ? 'YES (length: ' + secret.length + ')' : 'NO (password confirmation may be needed)');
    }

    // Inspect Use Cases / Products
    const useCasesUrl = `https://developers.facebook.com/apps/${app.appId}/use-cases/`;
    console.log(`Checking use cases / products: ${useCasesUrl}`);
    await page.goto(useCasesUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `scratch/app_${app.appId}_use_cases.png` });

    const useCases = await page.evaluate(() => {
      const cards = [];
      document.querySelectorAll('[role="listitem"], [class*="card"], tr').forEach(el => {
        const text = el.innerText.trim();
        if (text && text.length > 5 && text.length < 300 && !cards.includes(text)) {
          cards.push(text.replace(/\n+/g, ' | '));
        }
      });
      return cards.slice(0, 15);
    });

    results.push({
      appId: app.appId,
      title,
      settingsData,
      secretObtained: !!secret,
      secret,
      useCases
    });
  }

  fs.writeFileSync('scratch/meta_apps_inspection_result.json', JSON.stringify(results, null, 2));
  console.log('\n========================================');
  console.log('INSPECTION RESULTS COMPLETE: Saved to scratch/meta_apps_inspection_result.json');
  await browser.close();
}

run().catch(console.error);
