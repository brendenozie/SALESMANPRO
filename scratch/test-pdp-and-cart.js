const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = path.resolve('scratch/test-artifacts');

async function testPDPAndCart() {
  console.log('=== TESTING PDP & SAFE CART FLOW ON MARKETPLACE ===');
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });

  console.log('Navigating to marketplace product list: https://ghuba.shop/ghuba/productlist ...');
  await page.goto('https://ghuba.shop/ghuba/productlist', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Find product links on the marketplace
  const links = await page.$$eval('a', as => as.map(a => ({ href: a.href, text: a.innerText.trim() })).filter(a => a.href.includes('/product') || a.href.includes('/site/')));
  console.log('Found product/store links on marketplace:', links.slice(0, 5));

  // Find product cards
  const productCards = await page.$$('div[class*="product"], div[class*="card"], div[class*="listing"]');
  console.log(`Found ${productCards.length} potential card containers.`);

  // Let's click on the first link that leads to a product
  const targetLink = links.find(l => l.href.includes('/products/') || l.href.includes('/product/'));
  if (targetLink) {
    console.log(`Navigating to product details: ${targetLink.href}`);
    await page.goto(targetLink.href, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(3000);
    const pdpTitle = await page.title();
    console.log(`PDP Page Title: ${pdpTitle}`);
    const pdpScreenshot = path.join(ARTIFACTS_DIR, '06_pdp_direct.png');
    await page.screenshot({ path: pdpScreenshot, fullPage: false });
    console.log(`Saved screenshot: ${pdpScreenshot}`);

    // Check for Add to Cart or Order buttons
    const buttons = await page.$$eval('button', btns => btns.map(b => b.innerText.trim()).filter(t => t.length > 0));
    console.log('Available buttons on PDP:', buttons);

    const addBtn = await page.$('button:has-text("Add"), button:has-text("Order"), button:has-text("Buy"), button:has-text("Cart")');
    if (addBtn) {
      console.log('Clicking button to test cart interaction...');
      await addBtn.click();
      await page.waitForTimeout(2500);
      const cartScreenshot = path.join(ARTIFACTS_DIR, '07_cart_direct.png');
      await page.screenshot({ path: cartScreenshot, fullPage: false });
      console.log(`Saved cart screenshot: ${cartScreenshot}`);
    }
  } else {
    console.log('No direct product href link found, testing direct product details route...');
    // Test direct product route for McVitie's biscuits
    const testUrl = 'https://ghuba.shop/site/duka-yangu/products/68dbc69966f8979af33efc6d';
    console.log(`Navigating to: ${testUrl}`);
    await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);
    const pdpScreenshot = path.join(ARTIFACTS_DIR, '06_pdp_direct.png');
    await page.screenshot({ path: pdpScreenshot, fullPage: false });
    console.log(`Saved screenshot: ${pdpScreenshot}`);
  }

  await browser.close();
  console.log('Test complete!');
}

testPDPAndCart().catch(console.error);
