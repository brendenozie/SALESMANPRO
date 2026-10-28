const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('1. Selecting "WhatsApp message"...');
  const whatsappOption = page.locator('[role="dialog"]').getByText('WhatsApp message', { exact: false }).first();
  await whatsappOption.click();
  await page.waitForTimeout(1000);

  console.log('Clicking Next...');
  let nextBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Next"), div[role="dialog"] button:has-text("Next")').last();
  await nextBtn.click();
  await page.waitForTimeout(3000);

  let dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('=== Step after WhatsApp selection ===\n', dialogText);

  // If on Upload documents screen:
  if (dialogText.includes('Upload documents')) {
    console.log('2. Configuring documents...');

    // Document 1: Legal Name
    const combobox1 = page.locator('[role="dialog"] [role="combobox"]').first();
    await combobox1.click({ force: true });
    await page.waitForTimeout(1000);
    const opt1 = page.locator('[role="option"]:has-text("Business registration or licence document")').first();
    if (await opt1.count() > 0) {
      await opt1.click();
    }
    await page.waitForTimeout(1000);

    const file1 = 'C:\\Users\\Brenden\\Downloads\\IMG_20241001_111525.jpg';
    const fileInput1 = page.locator('[role="dialog"] input[type="file"]').first();
    console.log('Attaching front ID to document 1...');
    await fileInput1.setInputFiles(file1);
    await page.waitForTimeout(2000);

    // "Did your document include your business phone number?" -> No
    const noBtn = page.locator('[role="dialog"]').getByText('No', { exact: true }).first();
    if (await noBtn.count() > 0) {
      console.log('Clicking No for phone in document...');
      await noBtn.click();
      await page.waitForTimeout(1000);
    }

    // Document 2: Phone Number / Entity verification
    const comboboxes = page.locator('[role="dialog"] [role="combobox"]');
    if (await comboboxes.count() > 1) {
      console.log('Selecting document type for document 2...');
      await comboboxes.nth(1).click({ force: true });
      await page.waitForTimeout(1000);
      const opt2 = page.locator('[role="option"]:has-text("Business registration or licence document")').last();
      if (await opt2.count() > 0) {
        await opt2.click();
      }
      await page.waitForTimeout(1000);
    }

    const file2 = 'C:\\Users\\Brenden\\Downloads\\IMG-20241001-WA0013.jpeg';
    const fileInputs = page.locator('[role="dialog"] input[type="file"]');
    if (await fileInputs.count() > 1) {
      console.log('Attaching back ID to document 2...');
      await fileInputs.nth(1).setInputFiles(file2);
      await page.waitForTimeout(2000);
    }

    // Click Next
    console.log('Clicking Next on documents page...');
    nextBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Next"), div[role="dialog"] button:has-text("Next")').last();
    await nextBtn.click();
    await page.waitForTimeout(4000);

    dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
    console.log('=== Step after Document Upload ===\n', dialogText);
  }

  process.exit(0);
}

main().catch(console.error);
