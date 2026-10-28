const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('Selecting Business registration or licence document for phone/second doc...');
  const option = page.locator('[role="option"]:has-text("Business registration or licence document")').last();
  await option.click();
  await page.waitForTimeout(1000);

  const fileInputs = page.locator('[role="dialog"] input[type="file"]');
  console.log('File inputs count:', await fileInputs.count());

  const file2 = 'C:\\Users\\Brenden\\Downloads\\IMG-20241001-WA0013.jpeg';
  if (await fileInputs.count() > 1) {
    console.log('Setting second file input to back of ID...');
    await fileInputs.nth(1).setInputFiles(file2);
  } else {
    console.log('Only 1 file input found, setting it...');
    await fileInputs.first().setInputFiles(file2);
  }

  await page.waitForTimeout(3000);

  const dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('=== Dialog Text After Setting Both Files ===\n', dialogText);

  // Check Next button state
  const nextBtn = page.locator('div[role="dialog"] div[role="button"][aria-label="Next"], div[role="dialog"] button:has-text("Next")').last();
  const disabled = await nextBtn.getAttribute('aria-disabled');
  console.log('Next button disabled:', disabled);

  process.exit(0);
}

main().catch(console.error);
