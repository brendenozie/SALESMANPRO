import { chromium } from 'playwright-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu-shader-disk-cache']
  });

  // Desktop Context (Full Page)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const desktopPage = await desktopContext.newPage();
  console.log('Navigating desktop page...');
  await desktopPage.goto(`${BASE_URL}/site/ghuba`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await desktopPage.waitForTimeout(4000);
  
  await desktopPage.screenshot({ path: 'scripts/full_desktop.png', fullPage: true, timeout: 20000 });
  console.log('Desktop full page screenshot saved to scripts/full_desktop.png');

  // Mobile Context (Full Page)
  const mobileContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const mobilePage = await mobileContext.newPage();
  console.log('Navigating mobile page...');
  await mobilePage.goto(`${BASE_URL}/site/ghuba`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await mobilePage.waitForTimeout(4000);
  
  await mobilePage.screenshot({ path: 'scripts/full_mobile.png', fullPage: true, timeout: 20000 });
  console.log('Mobile full page screenshot saved to scripts/full_mobile.png');

  await browser.close();
}

main().catch(err => {
  console.error('Error running full screenshot script:', err);
  process.exit(1);
});
