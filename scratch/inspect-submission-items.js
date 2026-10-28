const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('submission_id=2655410581503960'));

  const items = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const goTos = all.filter(el => el.innerText && el.innerText.trim().startsWith('Go to'));
    return goTos.map(el => ({
      text: el.innerText.trim(),
      tag: el.tagName,
      role: el.getAttribute('role'),
      classes: el.className
    }));
  });

  console.log('Go to items:', items);

  // Let's also check each section header and status badge
  const sections = await page.evaluate(() => {
    const headings = ['Verification', 'App settings', 'Allowed usage', 'Data handling', 'Reviewer instructions'];
    const res = {};
    for (const h of headings) {
      const match = Array.from(document.querySelectorAll('*')).find(el => el.children.length === 0 && el.innerText && el.innerText.trim() === h);
      if (match) {
        let parent = match.parentElement;
        while (parent && parent.innerText && parent.innerText.length < 400 && parent.tagName !== 'BODY') {
          parent = parent.parentElement;
        }
        res[h] = parent ? parent.innerText : 'not found';
      }
    }
    return res;
  });

  console.log('Sections status:\n', JSON.stringify(sections, null, 2));

  process.exit(0);
}

main().catch(console.error);
