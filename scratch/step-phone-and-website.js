const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  console.log('Inspecting inputs in Contact Information...');
  const textInputs = page.locator('[role="dialog"] input[type="text"]');
  const inputCount = await textInputs.count();
  console.log('Text inputs count:', inputCount);

  // Fill Phone Number: 706448146 (or +254706448146)
  // Usually the country prefix is KE +254, so the input expects the local number without +254 or with
  // Let's check existing placeholder or value
  const phoneVal = '706448146';
  console.log('Filling phone number:', phoneVal);
  await textInputs.nth(0).fill(phoneVal);

  // Fill Website
  const websiteVal = 'https://salesmanpro.store';
  console.log('Filling website:', websiteVal);
  await textInputs.nth(1).fill(websiteVal);

  await page.waitForTimeout(1000);

  console.log('Clicking Next...');
  const nextBtn = page.locator('div[role="dialog"] div[role="button"][aria-label="Next"], div[role="dialog"] button:has-text("Next")').last();
  await nextBtn.click();
  await page.waitForTimeout(4000);

  const stepText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
  console.log('=== Step Text After Contact Info ===\n', stepText);

  // Check inputs or file upload elements
  const allInputs = await page.$$eval('[role="dialog"] input', els => els.map(e => ({
    type: e.type,
    name: e.name,
    id: e.id,
    accept: e.accept
  })));
  console.log('Inputs in new step:\n', allInputs);

  process.exit(0);
}

main().catch(console.error);
