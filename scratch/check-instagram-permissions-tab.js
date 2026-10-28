const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const url = 'https://developers.facebook.com/apps/2655372574841094/use_cases/customize/?use_case_enum=INSTAGRAM_BUSINESS&business_id=2136306163848491&selected_tab=permissions';
  console.log('Navigating to Instagram Permissions Tab:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const targetPerms = ['instagram_basic', 'instagram_content_publish'];
  const permissions = await page.evaluate((targetPerms) => {
    const allEls = Array.from(document.querySelectorAll('*'));
    const results = [];
    for (const name of targetPerms) {
      const match = allEls.find(el => el.children.length === 0 && el.innerText && el.innerText.trim() === name);
      if (match) {
        let parent = match.parentElement;
        while (parent && parent.innerText && parent.innerText.length < 500 && parent.tagName !== 'BODY') {
          if (parent.querySelector('button, [role="button"]')) break;
          parent = parent.parentElement;
        }
        results.push({
          name,
          rowText: parent ? parent.innerText : 'not found',
          buttons: parent ? Array.from(parent.querySelectorAll('button, [role="button"], a')).map(b => b.innerText.trim()).filter(Boolean) : []
        });
      } else {
        results.push({ name, notFound: true });
      }
    }
    return results;
  }, targetPerms);

  console.log('=== Instagram API Permissions Status ===');
  console.log(JSON.stringify(permissions, null, 2));

  process.exit(0);
}

main().catch(console.error);
