/**
 * .agents/skills/chrome-browser-access/scripts/browser-health-check.js
 *
 * Node.js & Playwright programmatic browser health check.
 * Verifies:
 * - CDP port 9222 responsiveness via /json/version
 * - Playwright connectOverCDP connection
 * - Non-destructive DOM inspection (reads document.title)
 * - Safe error handling with timeout protection (no hang)
 */

const http = require('http');

async function checkCdpHttp(port = 9222, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/json/version`, { timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ ok: true, version: parsed });
        } catch (e) {
          resolve({ ok: false, error: 'Invalid JSON response from CDP endpoint' });
        }
      });
    });

    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'Connection to CDP endpoint timed out' });
    });
  });
}

async function checkPlaywrightInteraction(port = 9222) {
  let chromium;
  try {
    chromium = require('playwright-core').chromium;
  } catch (err) {
    return { ok: false, error: 'playwright-core module not installed' };
  }

  let browser;
  try {
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, { timeout: 5000 });
    const contexts = browser.contexts();
    if (!contexts.length) {
      return { ok: false, error: 'No browser contexts available over CDP' };
    }

    const pages = contexts[0].pages();
    const activePage = pages[0] || await contexts[0].newPage();

    // Harmless, non-destructive interaction: read page title and URL
    const title = await activePage.title();
    const url = activePage.url();

    await browser.close(); // Detaches CDP client cleanly without closing Chrome

    return {
      ok: true,
      tabCount: pages.length,
      sampleTitle: title,
      sampleUrl: url,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function run() {
  console.log('================================================================');
  console.log('   NODE.JS & PLAYWRIGHT CHROME HEALTH CHECK                     ');
  console.log('================================================================');

  const port = parseInt(process.env.CHROME_CDP_PORT || '9222', 10);
  console.log(`Auditing CDP endpoint: http://127.0.0.1:${port}\n`);

  // 1. HTTP Endpoint Check
  process.stdout.write('[-] Step 1: Querying CDP /json/version endpoint... ');
  const httpRes = await checkCdpHttp(port);

  if (!httpRes.ok) {
    console.log('[FAIL]');
    console.log(`    Detail: ${httpRes.error}`);
    console.log('\n❌ RESULT: FAIL (Chrome is not listening on port ' + port + ')');
    process.exit(1);
  }

  console.log('[PASS]');
  console.log(`    Browser:  ${httpRes.version.Browser}`);
  console.log(`    Protocol: ${httpRes.version['Protocol-Version']}`);

  // 2. Playwright CDP Handshake & Harmless Inspection
  process.stdout.write('[-] Step 2: Testing Playwright CDP connection & page inspection... ');
  const pwRes = await checkPlaywrightInteraction(port);

  if (!pwRes.ok) {
    console.log('[FAIL]');
    console.log(`    Detail: ${pwRes.error}`);
    console.log('\n❌ RESULT: FAIL (Playwright connection rejected)');
    process.exit(1);
  }

  console.log('[PASS]');
  console.log(`    Active tabs inspected: ${pwRes.tabCount}`);
  console.log(`    Sample title:          "${pwRes.sampleTitle.slice(0, 45)}"`);
  console.log(`    Sample URL:            ${pwRes.sampleUrl.slice(0, 55)}`);

  console.log('\n================================================================');
  console.log('🎉 RESULT: PASS - BROWSER CDP INTERACTION 100% OPERATIONAL');
  console.log('================================================================');
  process.exit(0);
}

run().catch((err) => {
  console.error('\nFatal diagnostic error:', err.message);
  process.exit(1);
});
