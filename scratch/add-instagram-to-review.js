const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  console.log('Current page URL:', page.url());

  const result = await page.evaluate(async () => {
    const targetPerms = ['instagram_basic', 'instagram_content_publish'];
    const added = [];

    const allEls = Array.from(document.querySelectorAll('*'));
    for (const name of targetPerms) {
      const match = allEls.find(el => el.children.length === 0 && el.innerText && el.innerText.trim() === name);
      if (match) {
        let parent = match.parentElement;
        while (parent && parent.innerText && parent.innerText.length < 500 && parent.tagName !== 'BODY') {
          if (parent.querySelector('button, [role="button"]')) break;
          parent = parent.parentElement;
        }
        if (parent) {
          const btn = Array.from(parent.querySelectorAll('button, [role="button"], div')).find(b => b.innerText && b.innerText.trim() === 'Add to App Review');
          if (btn) {
            btn.click();
            added.push({ name, clicked: true });
          } else {
            added.push({ name, btnNotFound: true, buttons: Array.from(parent.querySelectorAll('button, [role="button"]')).map(b => b.innerText.trim()) });
          }
        }
      }
    }
    return added;
  });

  console.log('Result of clicking Add to App Review:', result);
  await page.waitForTimeout(3000);

  // Check new status
  const newStatus = await page.evaluate(() => {
    const targetPerms = ['instagram_basic', 'instagram_content_publish'];
    const allEls = Array.from(document.querySelectorAll('*'));
    const res = [];
    for (const name of targetPerms) {
      const match = allEls.find(el => el.children.length === 0 && el.innerText && el.innerText.trim() === name);
      if (match) {
        let parent = match.parentElement;
        while (parent && parent.innerText && parent.innerText.length < 500 && parent.tagName !== 'BODY') {
          if (parent.querySelector('button, [role="button"]')) break;
          parent = parent.parentElement;
        }
        res.push({
          name,
          buttons: parent ? Array.from(parent.querySelectorAll('button, [role="button"]')).map(b => b.innerText.trim()) : []
        });
      }
    }
    return res;
  });

  console.log('New status after click:', newStatus);
  process.exit(0);
}

main().catch(console.error);
