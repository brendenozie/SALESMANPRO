const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('1. Confirming current modal if present...');
  const addModalBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Add"), div[role="dialog"] button:has-text("Add")');
  if (await addModalBtn.count() > 0) {
    console.log('Clicking Add in modal...');
    await addModalBtn.first().click();
    await page.waitForTimeout(3000);
  }

  // Helper to click Add to App Review and confirm any modal
  async function addPermission(permName) {
    console.log(`\n--- Adding ${permName} ---`);
    const btn = page.locator(`tr:has-text("${permName}") div[role="button"]:has-text("Add to App Review"), div[role="row"]:has-text("${permName}") div[role="button"]:has-text("Add to App Review")`);
    
    // If not found by row, search all
    let targetBtn = btn;
    if (await targetBtn.count() === 0) {
      console.log(`Finding ${permName} via evaluate...`);
      await page.evaluate((name) => {
        const all = Array.from(document.querySelectorAll('*'));
        const match = all.find(el => el.children.length === 0 && el.innerText && el.innerText.trim() === name);
        if (match) {
          let parent = match.parentElement;
          while (parent && parent.innerText && parent.innerText.length < 500 && parent.tagName !== 'BODY') {
            if (parent.querySelector('div[role="button"], button')) break;
            parent = parent.parentElement;
          }
          if (parent) {
            const b = Array.from(parent.querySelectorAll('div[role="button"], button')).find(x => x.innerText && x.innerText.trim() === 'Add to App Review');
            if (b) b.click();
          }
        }
      }, permName);
    } else {
      await targetBtn.first().click();
    }

    await page.waitForTimeout(2000);

    // Check if confirmation modal appeared
    const modalAdd = page.locator('div[role="dialog"] div[role="button"]:has-text("Add"), div[role="dialog"] button:has-text("Add")');
    if (await modalAdd.count() > 0) {
      console.log(`Confirming modal for ${permName}...`);
      await modalAdd.first().click();
      await page.waitForTimeout(2000);
    }
  }

  // We are currently on Pages API
  await addPermission('pages_manage_posts');
  await page.waitForTimeout(2000);

  // Now go to Instagram API Permissions Tab
  console.log('\nNavigating to Instagram Permissions Tab...');
  await page.goto('https://developers.facebook.com/apps/2655372574841094/use_cases/customize/?use_case_enum=INSTAGRAM_BUSINESS&business_id=2136306163848491&selected_tab=permissions', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  await addPermission('instagram_basic');
  await page.waitForTimeout(2000);

  await addPermission('instagram_content_publish');
  await page.waitForTimeout(2000);

  // Now check App Review Submissions page!
  console.log('\nNavigating to App Review Submissions...');
  await page.goto('https://developers.facebook.com/apps/2655372574841094/app-review/submissions/?business_id=2136306163848491', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Close any modal on App Review
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('div[role="button"], button')).find(b => b.innerText && b.innerText.trim() === 'Continue to App Review');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);

  const reviewPageText = await page.evaluate(() => document.body.innerText);
  console.log('=== App Review Submissions List ===\n', reviewPageText);

  process.exit(0);
}

main().catch(console.error);
