const { chromium } = require('playwright-core');
const { encode } = require('next-auth/jwt');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envConfig = dotenv.parse(fs.readFileSync('.env'));
const secret = envConfig.NEXTAUTH_SECRET;

const pagesToTest = [
  { name: '01-store-pos', url: 'http://localhost:3000/admin/duka-yangu/storepos' },
  { name: '02-inventory-dashboard', url: 'http://localhost:3000/admin/duka-yangu/inventory-dashboard' },
  { name: '03-products-catalog', url: 'http://localhost:3000/admin/duka-yangu/products' },
  { name: '04-customer-orders', url: 'http://localhost:3000/admin/duka-yangu/customerorders' },
  { name: '05-invoices', url: 'http://localhost:3000/admin/duka-yangu/invoices' },
  { name: '06-analytics', url: 'http://localhost:3000/admin/duka-yangu/analytics' },
  { name: '07-storefront-site', url: 'http://localhost:3000/site/duka-yangu' }
];

async function captureAll() {
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
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
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

  for (const item of pagesToTest) {
    try {
      console.log(`Navigating to ${item.name} (${item.url})...`);
      await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      const outPath = `c:\\Users\\Brenden\\Desktop\\SalesForce\\SalesmanPro-Marketing\\04-Screenshots\\${item.name}.png`;
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`Saved screenshot: ${outPath}`);
    } catch (err) {
      console.error(`Error capturing ${item.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('All feature discovery captures complete!');
}

captureAll().catch(console.error);

