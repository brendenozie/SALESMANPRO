const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('security_center'));

  // Check what links or buttons exist
  const links = await page.$$eval('[role="dialog"] a, [role="dialog"] [role="button"], [role="dialog"] button', els => els.map(e => ({
    text: e.innerText.trim(),
    tag: e.tagName,
    role: e.getAttribute('role'),
    href: e.href || null
  })));

  console.log('Available links/buttons in code screen:\n', links);

  // Check what happens if we click "Didn't get a code? Troubleshoot phone issues."
  const troubleshoot = page.locator('[role="dialog"]').getByText("Didn't get a code? Troubleshoot phone issues.", { exact: false }).first();
  if (await troubleshoot.count() > 0) {
    console.log('Clicking Troubleshoot link...');
    await troubleshoot.click();
    await page.waitForTimeout(2000);
    const dialogText = await page.$eval('[role="dialog"]', el => el.innerText).catch(() => 'No dialog');
    console.log('Dialog after troubleshoot click:\n', dialogText);
  }

  process.exit(0);
}

main().catch(console.error);
