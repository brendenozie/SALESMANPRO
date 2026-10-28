const { chromium } = require('playwright-core');
const fs = require('fs');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const permissions = await page.evaluate(() => {
    // Each row or permission item
    const rows = Array.from(document.querySelectorAll('table tr, [role="row"], div[data-testid]'));
    
    // Let's find all text blocks containing permission names
    const targetPerms = ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'];
    const results = [];

    // Let's scan all elements that have text matching our target perms
    const allEls = Array.from(document.querySelectorAll('*'));
    for (const name of targetPerms) {
      const match = allEls.find(el => el.children.length === 0 && el.innerText && el.innerText.trim() === name);
      if (match) {
        // find enclosing container/row
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
  });

  console.log('=== Pages API Permissions Status ===');
  console.log(JSON.stringify(permissions, null, 2));

  process.exit(0);
}

main().catch(console.error);
