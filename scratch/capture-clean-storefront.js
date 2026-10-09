const { chromium } = require('playwright-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = path.resolve('scratch/test-artifacts');

async function main() {
  console.log("Capturing live cleaned storefront screenshot...");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 }
  });

  await page.goto('https://ghuba.shop', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  await page.goto('https://ghuba.shop/ghuba/productlist', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const screenshotPath = path.join(ARTIFACTS_DIR, '08_post_cleanup_productlist.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Saved clean productlist screenshot: ${screenshotPath}`);

  // Also check Duka Yangu products
  await page.goto('https://ghuba.shop/site/duka-yangu', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  const dukaPath = path.join(ARTIFACTS_DIR, '09_post_cleanup_duka_yangu.png');
  await page.screenshot({ path: dukaPath, fullPage: false });
  console.log(`Saved clean Duka Yangu storefront screenshot: ${dukaPath}`);

  await browser.close();
  console.log("Visual capture complete!");
}

main().catch(console.error);
