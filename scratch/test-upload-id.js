const { chromium } = require('playwright-core');
const path = require('path');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('1. Selecting "Business registration or licence document"...');
  const option = page.locator('[role="option"]:has-text("Business registration or licence document")').first();
  await option.click();
  await page.waitForTimeout(1000);

  const fileInput = page.locator('[role="dialog"] input[type="file"]');
  console.log('File input count:', await fileInput.count());

  const file1 = 'C:\\Users\\Brenden\\Downloads\\IMG_20241001_111525.jpg';
  const file2 = 'C:\\Users\\Brenden\\Downloads\\IMG-20241001-WA0013.jpeg';

  console.log('Setting file input to front and back ID files...');
  // Check if multiple files allowed
  const isMultiple = await fileInput.evaluate(el => el.multiple);
  console.log('Is input multiple?', isMultiple);

  if (isMultiple) {
    await fileInput.setInputFiles([file1, file2]);
  } else {
    await fileInput.setInputFiles(file1);
  }

  await page.waitForTimeout(3000);

  const dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('=== Dialog Text After Setting File ===\n', dialogText);

  // Check if there is an Add another document or second file input
  process.exit(0);
}

main().catch(console.error);
