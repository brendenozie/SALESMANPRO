const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  await page.goto('https://developers.facebook.com/apps/2655372574841094/verification/?business_id=2136306163848491', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Find the "Complete verification" link / button
  const completeBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('a, button, [role="button"]'));
    const btn = btns.find(b => b.innerText && b.innerText.trim() === 'Complete verification');
    if (!btn) return null;
    return {
      tag: btn.tagName,
      href: btn.href || null,
      text: btn.innerText.trim()
    };
  });

  console.log('Complete verification button info:', completeBtn);

  if (completeBtn && completeBtn.href) {
    console.log('Navigating to verification link:', completeBtn.href);
    await page.goto(completeBtn.href, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    console.log('New URL:', page.url());
    const text = await page.evaluate(() => document.body.innerText);
    console.log('Verification Flow Text:\n', text.slice(0, 2500));
  } else {
    // try clicking it
    console.log('Clicking Complete verification button...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('a, button, [role="button"]'));
      const btn = btns.find(b => b.innerText && b.innerText.trim() === 'Complete verification');
      if (btn) btn.click();
    });
    await page.waitForTimeout(4000);
    console.log('New URL after click:', page.url());
    const text = await page.evaluate(() => document.body.innerText);
    console.log('Verification Flow Text:\n', text.slice(0, 2500));
  }

  process.exit(0);
}

main().catch(console.error);
