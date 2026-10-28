const { chromium } = require('playwright-core');

async function check() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  console.log(`Open pages: ${pages.length}`);
  for (let i = 0; i < pages.length; i++) {
    console.log(`Page [${i}]: ${await pages[i].title()} -> ${pages[i].url()}`);
  }

  // Get cookies for facebook.com / meta
  const cookies = await context.cookies(['https://www.facebook.com', 'https://developers.facebook.com', 'https://meta.com']);
  console.log('Total Facebook/Meta cookies found:', cookies.length);
  cookies.forEach(c => {
    console.log(`Cookie: ${c.name} on ${c.domain}`);
  });

  // Let's check current user by navigating to facebook.com/me or inspecting
  const page = pages[0] || await context.newPage();
  console.log('Navigating page to https://www.facebook.com/ ...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log('Facebook home title:', await page.title(), 'URL:', page.url());

  const currentLoggedInName = await page.evaluate(() => {
    const el = document.querySelector('span[dir="auto"], h1, [aria-label*="Account"], [aria-label*="Your profile"]');
    return el ? el.innerText : null;
  });
  console.log('Visible account indicator:', currentLoggedInName);

  await browser.close();
}

check().catch(console.error);
