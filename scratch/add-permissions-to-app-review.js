const { chromium } = require('playwright-core');

async function checkAndAddPermissions(page, useCaseUrl, targetPerms) {
  console.log(`Navigating to ${useCaseUrl}...`);
  await page.goto(useCaseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const results = [];
  for (const perm of targetPerms) {
    const row = page.locator(`div:has-text("${perm}")`).last();
    const count = await row.count();
    console.log(`Searching for permission ${perm}: found ${count}`);

    // Try finding the specific container for this permission
    const permContainer = page.locator(`div:has-text("${perm}")`).filter({ hasText: 'Add to App Review' }).first();
    const canAdd = await permContainer.count();
    console.log(`  Can add ${perm} to App Review? ${canAdd > 0}`);

    if (canAdd > 0) {
      const addBtn = permContainer.locator('button:has-text("Add to App Review"), [role="button"]:has-text("Add to App Review")').first();
      if (await addBtn.count() > 0) {
        console.log(`  Clicking "Add to App Review" for ${perm}...`);
        await addBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    results.push({ perm, found: count > 0, canAdd: canAdd > 0 });
  }
  return results;
}

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const devPage = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const pageUrl = 'https://developers.facebook.com/apps/2655372574841094/use_cases/customize/?use_case_enum=PAGES_API&business_id=2136306163848491';
  const pagePerms = ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'];
  const resPages = await checkAndAddPermissions(devPage, pageUrl, pagePerms);
  console.log('Pages permissions results:\n', resPages);

  const instaUrl = 'https://developers.facebook.com/apps/2655372574841094/use_cases/customize/?use_case_enum=INSTAGRAM_BUSINESS&business_id=2136306163848491';
  const instaPerms = ['instagram_basic', 'instagram_content_publish'];
  const resInsta = await checkAndAddPermissions(devPage, instaUrl, instaPerms);
  console.log('Instagram permissions results:\n', resInsta);

  process.exit(0);
}

main().catch(console.error);
