import { chromium } from 'playwright-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu-shader-disk-cache']
  });

  // Mobile Context
  const mobileContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const mobilePage = await mobileContext.newPage();
  console.log('Navigating mobile page...');
  await mobilePage.goto(`${BASE_URL}/site/ghuba`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await mobilePage.waitForTimeout(3000);
  
  await mobilePage.screenshot({ path: 'scripts/stage2_mobile.png', fullPage: false, timeout: 15000 });
  console.log('Mobile screenshot saved to scripts/stage2_mobile.png');

  // Desktop Context
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const desktopPage = await desktopContext.newPage();
  console.log('Navigating desktop page...');
  await desktopPage.goto(`${BASE_URL}/site/ghuba`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await desktopPage.waitForTimeout(3000);
  
  await desktopPage.screenshot({ path: 'scripts/stage2_desktop.png', fullPage: false, timeout: 15000 });
  console.log('Desktop screenshot saved to scripts/stage2_desktop.png');

  await browser.close();
}

main().catch(err => {
  console.error('Error running verify script:', err);
  process.exit(1);
});
