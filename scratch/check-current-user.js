const { chromium } = require('playwright-core');

async function check() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  console.log(`Tabs count: ${pages.length}`);
  for (let i = 0; i < pages.length; i++) {
    console.log(`Tab ${i}: "${await pages[i].title()}" - ${pages[i].url()}`);
  }

  const cookies = await context.cookies(['https://www.facebook.com', 'https://developers.facebook.com']);
  console.log('FB Cookies count:', cookies.length);
  const cUser = cookies.find(c => c.name === 'c_user');
  console.log('c_user found:', cUser ? 'YES, UID: ' + cUser.value : 'NO');

  await browser.close();
}

check().catch(console.error);
