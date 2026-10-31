const { chromium } = require('playwright-core');
const { encode } = require('next-auth/jwt');
const dotenv = require('dotenv');
const fs = require('fs');

const envConfig = dotenv.parse(fs.readFileSync('.env'));
const secret = envConfig.NEXTAUTH_SECRET;

async function verifyPOSWorkflow() {
  const token = await encode({
    token: {
      id: '68f1e945dcb9542a6b0a08eb',
      sub: '68f1e945dcb9542a6b0a08eb',
      name: 'Brenden Odhiambo',
      email: 'brendenozie@gmail.com',
      role: 'ADMIN',
      emailVerified: true,
      isActive: true,
      companyId: '6825c2c7969ab9f16f620f67',
      hasTenantAccess: true,
    },
    secret,
    maxAge: 30 * 24 * 60 * 60,
  });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });

  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    }
  ]);

  const page = await context.newPage();
  console.log('Navigating to POS...');
  await page.goto('http://localhost:3000/admin/duka-yangu/storepos', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Look for product cards
  const productCards = await page.$$('.cursor-pointer, [role="button"]');
  console.log('Clickable elements found on POS:', productCards.length);

  // Find product text or images
  const productTitles = await page.$$eval('h3, h4, p.font-semibold, div.font-medium', els => 
    els.map(e => e.innerText.trim()).filter(t => t.length > 3 && !t.includes('\n')).slice(0, 10)
  );
  console.log('Product titles on POS screen:', productTitles);

  // Let's take a screenshot of POS with products visible
  await page.screenshot({ path: 'c:\\Users\\Brenden\\Desktop\\SalesForce\\SalesmanPro-Marketing\\04-Screenshots\\pos-active-grid.png' });
  console.log('Saved pos-active-grid.png');

  await browser.close();
}

verifyPOSWorkflow().catch(console.error);

