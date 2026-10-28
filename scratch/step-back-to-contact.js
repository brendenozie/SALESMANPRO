const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('Clicking "Back"...');
  const backBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Back")').first();
  await backBtn.click();
  await page.waitForTimeout(2000);

  let text = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('Screen 1 back:\n', text);

  // If on Confirm phone number screen, click Back again to go to Upload documents
  if (text.includes('Confirm phone number')) {
    console.log('Clicking Back again from Confirm phone number...');
    const backBtn2 = page.locator('div[role="dialog"] div[role="button"]:has-text("Back")').first();
    await backBtn2.click();
    await page.waitForTimeout(2000);
    text = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
    console.log('Screen 2 back:\n', text);
  }

  // If on Upload documents screen, click Back again to go to Contact information
  if (text.includes('Upload documents')) {
    console.log('Clicking Back again from Upload documents...');
    const backBtn3 = page.locator('div[role="dialog"] div[role="button"]:has-text("Back")').first();
    await backBtn3.click();
    await page.waitForTimeout(2000);
    text = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
    console.log('Screen 3 back (Contact information?):\n', text);
  }

  process.exit(0);
}

main().catch(console.error);
