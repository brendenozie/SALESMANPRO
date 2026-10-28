const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const url = 'https://developers.facebook.com/apps/2655372574841094/use_cases/customize/?use_case_enum=PAGES_API&business_id=2136306163848491';
  console.log('Navigating to Pages API:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Close any modal if present
  await page.evaluate(() => {
    const continueBtn = Array.from(document.querySelectorAll('div[role="button"], button')).find(b => b.innerText && b.innerText.trim() === 'Continue to App Review');
    if (continueBtn) continueBtn.click();
  });
  await page.waitForTimeout(1000);

  const targetPerms = ['pages_read_engagement', 'pages_manage_posts'];
  for (const name of targetPerms) {
    console.log(`Looking for button for ${name}...`);
    const btnClicked = await page.evaluate((name) => {
      const all = Array.from(document.querySelectorAll('*'));
      const match = all.find(el => el.children.length === 0 && el.innerText && el.innerText.trim() === name);
      if (!match) return { error: 'perm not found' };

      let parent = match.parentElement;
      while (parent && parent.innerText && parent.innerText.length < 500 && parent.tagName !== 'BODY') {
        if (parent.querySelector('div[role="button"], button')) break;
        parent = parent.parentElement;
      }
      if (!parent) return { error: 'parent not found' };

      const btn = Array.from(parent.querySelectorAll('div[role="button"], button')).find(b => b.innerText && b.innerText.trim() === 'Add to App Review');
      if (btn) {
        btn.click();
        return { success: true };
      }
      return { error: 'button not found', text: parent.innerText };
    }, name);

    console.log(`Click result for ${name}:`, btnClicked);
    await page.waitForTimeout(2000);
  }

  // Check if any modal popped up
  const modals = await page.$$eval('[role="dialog"]', els => els.map(e => e.innerText));
  console.log('Modals after clicks:', modals);

  process.exit(0);
}

main().catch(console.error);
