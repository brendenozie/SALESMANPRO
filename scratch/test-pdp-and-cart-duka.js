const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = path.resolve('scratch/test-artifacts');

async function testStorePDPAndCart() {
  console.log('=== TESTING DUKA YANGU PDP & CART INTERACTION ===');
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });

  console.log('Navigating to Duka Yangu products...');
  await page.goto('https://ghuba.shop/site/duka-yangu/products', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Extract all product cards or items
  const cardData = await page.$$eval('div', divs => {
    return divs
      .filter(d => d.innerText && (d.innerText.includes('KSh') || d.innerText.includes('KES') || d.innerText.includes('Add to Cart')))
      .map(d => d.innerText.slice(0, 100))
      .slice(0, 5);
  });
  console.log('Sample card text snippets found:', cardData);

  // Look for clickable Add to Cart buttons directly on grid
  const gridAddButtons = await page.$$('button');
  console.log(`Total button elements found on products page: ${gridAddButtons.length}`);
  for (let i = 0; i < Math.min(gridAddButtons.length, 10); i++) {
    const text = await gridAddButtons[i].innerText();
    console.log(`Button ${i}: "${text.trim()}"`);
  }

  // Find product link
  const productLinks = await page.$$eval('a', as => as.map(a => a.href).filter(h => h.includes('/products/')));
  console.log('Product links found:', productLinks);

  if (productLinks.length > 0) {
    const pdpTarget = productLinks[0];
    console.log(`Navigating to PDP: ${pdpTarget}`);
    await page.goto(pdpTarget, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    const pdpTitle = await page.title();
    console.log(`PDP title: ${pdpTitle}`);
    const pdpScreenshot = path.join(ARTIFACTS_DIR, '06_pdp_details.png');
    await page.screenshot({ path: pdpScreenshot, fullPage: false });
    console.log(`Saved screenshot: ${pdpScreenshot}`);

    // Look for add to cart on PDP
    const pdpButtons = await page.$$('button');
    let clicked = false;
    for (const btn of pdpButtons) {
      const text = (await btn.innerText()).toLowerCase();
      if (text.includes('cart') || text.includes('order') || text.includes('buy') || text.includes('add')) {
        console.log(`Clicking button: "${text.trim()}"`);
        await btn.click();
        clicked = true;
        break;
      }
    }

    if (clicked) {
      await page.waitForTimeout(3000);
      const cartScreenshot = path.join(ARTIFACTS_DIR, '07_cart_preview.png');
      await page.screenshot({ path: cartScreenshot, fullPage: false });
      console.log(`Saved cart screenshot: ${cartScreenshot}`);
    }
  } else {
    // If no /products/ link, try clicking the first product card or image
    console.log('Attempting to click first card element...');
    const firstImg = await page.$('img');
    if (firstImg) {
      await firstImg.click();
      await page.waitForTimeout(3000);
      const pdpScreenshot = path.join(ARTIFACTS_DIR, '06_pdp_details.png');
      await page.screenshot({ path: pdpScreenshot, fullPage: false });
    }
  }

  await browser.close();
  console.log('PDP & Cart test completed!');
}

testStorePDPAndCart().catch(console.error);
