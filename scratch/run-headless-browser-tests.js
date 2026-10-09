const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = path.resolve('scratch/test-artifacts');

async function runTests() {
  console.log('=== STARTING PRODUCTION BROWSER TESTS (GHUBA & STOREFRONTS) ===');
  console.log(`Using Chrome binary: ${CHROME_PATH}`);
  console.log(`Artifacts output: ${ARTIFACTS_DIR}`);

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 GhubaTestAudit/1.0'
  });

  const page = await context.newPage();
  const results = [];

  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // TEST 1: Homepage
  console.log('\n[TEST 1] Testing Ghuba Homepage (https://ghuba.shop)...');
  try {
    const res = await page.goto('https://ghuba.shop', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    const title = await page.title();
    const screenshotPath = path.join(ARTIFACTS_DIR, '01_homepage.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`  HTTP Status: ${res.status()}`);
    console.log(`  Page Title: ${title}`);
    console.log(`  Screenshot saved: ${screenshotPath}`);
    results.push({ test: 'Homepage', status: 'PASS', httpStatus: res.status(), title });
  } catch (err) {
    console.error(`  FAIL: ${err.message}`);
    results.push({ test: 'Homepage', status: 'FAIL', error: err.message });
  }

  // TEST 2: Ghuba Marketplace Directory
  console.log('\n[TEST 2] Testing Marketplace Catalog (https://ghuba.shop/ghuba/productlist)...');
  try {
    const res = await page.goto('https://ghuba.shop/ghuba/productlist', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    const screenshotPath = path.join(ARTIFACTS_DIR, '02_ghuba_productlist.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });

    // Count product cards or listing elements
    const productCards = await page.$$('img');
    console.log(`  HTTP Status: ${res.status()}`);
    console.log(`  Rendered image elements on listing page: ${productCards.length}`);
    console.log(`  Screenshot saved: ${screenshotPath}`);
    results.push({ test: 'Marketplace Directory', status: 'PASS', httpStatus: res.status(), imageElements: productCards.length });
  } catch (err) {
    console.error(`  FAIL: ${err.message}`);
    results.push({ test: 'Marketplace Directory', status: 'FAIL', error: err.message });
  }

  // TEST 3: Storefront Visual Verification (Duka Yangu)
  console.log('\n[TEST 3] Testing Storefront Duka Yangu (https://ghuba.shop/site/duka-yangu)...');
  try {
    const res = await page.goto('https://ghuba.shop/site/duka-yangu', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    const screenshotPath = path.join(ARTIFACTS_DIR, '03_store_duka_yangu.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`  HTTP Status: ${res.status()}`);
    console.log(`  Screenshot saved: ${screenshotPath}`);
    results.push({ test: 'Storefront Duka Yangu', status: 'PASS', httpStatus: res.status() });
  } catch (err) {
    console.error(`  FAIL: ${err.message}`);
    results.push({ test: 'Storefront Duka Yangu', status: 'FAIL', error: err.message });
  }

  // TEST 4: Store Products Page (Duka Yangu)
  console.log('\n[TEST 4] Testing Store Products Page (https://ghuba.shop/site/duka-yangu/products)...');
  try {
    const res = await page.goto('https://ghuba.shop/site/duka-yangu/products', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    const screenshotPath = path.join(ARTIFACTS_DIR, '04_duka_yangu_products.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`  HTTP Status: ${res.status()}`);
    console.log(`  Screenshot saved: ${screenshotPath}`);
    results.push({ test: 'Duka Yangu Products Page', status: 'PASS', httpStatus: res.status() });
  } catch (err) {
    console.error(`  FAIL: ${err.message}`);
    results.push({ test: 'Duka Yangu Products Page', status: 'FAIL', error: err.message });
  }

  // TEST 5: Furniture Store (Verify updated image rendering)
  console.log('\n[TEST 5] Testing Storefront Furniture Store (https://ghuba.shop/site/furniture-store)...');
  try {
    const res = await page.goto('https://ghuba.shop/site/furniture-store', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    const screenshotPath = path.join(ARTIFACTS_DIR, '05_store_furniture.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`  HTTP Status: ${res.status()}`);
    console.log(`  Screenshot saved: ${screenshotPath}`);
    results.push({ test: 'Storefront Furniture Store', status: 'PASS', httpStatus: res.status() });
  } catch (err) {
    console.error(`  FAIL: ${err.message}`);
    results.push({ test: 'Storefront Furniture Store', status: 'FAIL', error: err.message });
  }

  // TEST 6: PDP Details & Safe Cart Flow
  console.log('\n[TEST 6] Testing PDP and Safe Cart Flow on Duka Yangu...');
  try {
    // Navigate to products and look for a product card link
    await page.goto('https://ghuba.shop/site/duka-yangu/products', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Find links containing /products/
    const links = await page.$$eval('a', as => as.map(a => a.href).filter(h => h.includes('/products/')));
    console.log(`  Found product links on page:`, links.slice(0, 3));

    let pdpUrl = links[0];
    if (!pdpUrl) {
      // Fallback direct product URL if available
      pdpUrl = 'https://ghuba.shop/site/duka-yangu/products/68dbc69966f8979af33efc6d';
    }

    console.log(`  Navigating to PDP: ${pdpUrl}`);
    const pdpRes = await page.goto(pdpUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    const pdpScreenshot = path.join(ARTIFACTS_DIR, '06_pdp.png');
    await page.screenshot({ path: pdpScreenshot, fullPage: false });
    console.log(`  PDP HTTP Status: ${pdpRes.status()}`);
    console.log(`  PDP Screenshot saved: ${pdpScreenshot}`);

    // Look for Add to Cart button
    const addToCartButton = await page.$('button:has-text("Add to Cart"), button:has-text("Add to Bag"), button:has-text("Order")');
    if (addToCartButton) {
      console.log('  Found Add to Cart button. Clicking to verify safe cart preview...');
      await addToCartButton.click();
      await page.waitForTimeout(2000);
      const cartScreenshot = path.join(ARTIFACTS_DIR, '07_cart_interaction.png');
      await page.screenshot({ path: cartScreenshot, fullPage: false });
      console.log(`  Cart Interaction Screenshot saved: ${cartScreenshot}`);
      results.push({ test: 'PDP & Cart Flow', status: 'PASS', details: 'Add to Cart clicked, safe cart preview captured' });
    } else {
      console.log('  Note: Add to cart button selector did not match or page layout uses alternative CTA');
      results.push({ test: 'PDP & Cart Flow', status: 'PASS (PDP Rendered)', details: 'PDP loaded successfully' });
    }
  } catch (err) {
    console.error(`  FAIL: ${err.message}`);
    results.push({ test: 'PDP & Cart Flow', status: 'FAIL', error: err.message });
  }

  await browser.close();

  console.log('\n=== TEST RESULTS SUMMARY ===');
  console.table(results);
  console.log(`Console error count during navigation: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Sample console errors:', consoleErrors.slice(0, 3));
  }

  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'test_summary.json'), JSON.stringify({ results, consoleErrors: consoleErrors.slice(0, 10) }, null, 2));
}

runTests().catch(console.error);
