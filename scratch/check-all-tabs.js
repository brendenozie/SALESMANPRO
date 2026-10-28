const { chromium } = require('playwright-core');

async function check() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  console.log(`Tabs count: ${pages.length}`);
  for (let i = 0; i < pages.length; i++) {
    const title = await pages[i].title();
    const url = pages[i].url();
    console.log(`Tab [${i}]: "${title}" -> ${url}`);
  }

  // Check all cookies across context
  const cookies = await context.cookies();
  console.log(`Total cookies in context: ${cookies.length}`);
  const fb = cookies.filter(c => c.name === 'c_user' || c.name === 'xs');
  console.log('Session cookies (c_user/xs):', fb.map(c => ({ name: c.name, domain: c.domain })));

  await browser.close();
}

check().catch(console.error);
