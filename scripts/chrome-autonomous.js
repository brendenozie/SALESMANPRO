/**
 * scripts/chrome-autonomous.js
 *
 * Dedicated Autonomous Chrome Controller for SalesmanPro.
 * Supports launching Chrome with remote debugging on port 9222,
 * attaching via CDP (Playwright Core), managing persistent profiles,
 * and navigating/interacting autonomously with full session persistence.
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CHROME_USER_DATA_DEFAULT = 'C:\\Users\\Brenden\\AppData\\Local\\Google\\Chrome\\User Data';
const AUTONOMOUS_PROFILE_DIR = path.resolve(__dirname, '..', 'storage', 'automation', 'chrome-profile');
const CDP_PORT = 9222;

function getPlaywright() {
  try {
    return require('playwright-core');
  } catch {
    try {
      return require('playwright');
    } catch {
      throw new Error('Neither playwright-core nor playwright is installed.');
    }
  }
}

async function isPortOpen(port = CDP_PORT) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

async function getOpenTabs(port = CDP_PORT) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/list`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Launch Chrome with remote debugging.
 * @param {Object} options
 * @param {string} [options.profileDir] - Custom user data directory (defaults to persistent autonomous profile)
 * @param {string} [options.profileName] - Profile directory name inside user data (e.g., "Default", "Profile 3")
 * @param {string[]} [options.urls] - URLs to open
 * @param {boolean} [options.detach] - Run in background detached
 */
/**
 * Launch an autonomous browser session with persistent profile storage.
 * @param {Object} options
 * @param {boolean} [options.headless=false]
 * @param {string} [options.profileDir]
 * @param {string} [options.url]
 */
async function launchPersistentSession(options = {}) {
  const { chromium } = getPlaywright();
  const profileDir = options.profileDir || AUTONOMOUS_PROFILE_DIR;
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  const context = await chromium.launchPersistentContext(profileDir, {
    executablePath: CHROME_PATH,
    headless: options.headless ?? false,
    viewport: { width: 1366, height: 768 },
    args: [
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-blink-features=AutomationControlled',
      `--remote-debugging-port=${CDP_PORT}`
    ]
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
  if (options.url) {
    await page.goto(options.url, { waitUntil: 'domcontentloaded' });
  }

  return { context, page };
}

/**
 * Connect to running Chrome over CDP.
 */
async function connectToChrome() {
  const { chromium } = getPlaywright();
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${CDP_PORT}`);
  const context = browser.contexts()[0];
  return { browser, context };
}

/**
 * Execute an autonomous task function with automatic lifecycle handling.
 */
async function runAutonomousTask(taskFn, options = {}) {
  const { context, page } = await launchPersistentSession(options);
  try {
    return await taskFn({ context, page });
  } finally {
    if (options.autoClose !== false) {
      await context.close();
    }
  }
}

// CLI handler
async function main() {
  const command = process.argv[2] || 'status';

  if (command === 'status') {
    const listening = await isPortOpen(CDP_PORT);
    console.log(`=== CHROME AUTONOMOUS STATUS ===`);
    console.log(`Remote Debugging Port (${CDP_PORT}): ${listening ? 'ACTIVE (Listening)' : 'INACTIVE'}`);
    console.log(`Chrome Binary: ${fs.existsSync(CHROME_PATH) ? 'FOUND at ' + CHROME_PATH : 'NOT FOUND'}`);
    console.log(`Autonomous Profile Dir: ${AUTONOMOUS_PROFILE_DIR}`);

    if (listening) {
      const tabs = await getOpenTabs(CDP_PORT);
      console.log(`Open Tabs (${tabs.length}):`);
      tabs.forEach((t, i) => {
        console.log(`  [${i + 1}] ${t.title || 'Untitled'} - ${t.url}`);
      });
    }
  } else if (command === 'open') {
    const targetUrl = process.argv[3] || 'https://salesmanpro.store';
    console.log(`Opening persistent autonomous Chrome to ${targetUrl}...`);
    const { page } = await launchPersistentSession({ url: targetUrl, headless: false });
    console.log(`Successfully navigated to: ${await page.title()} (${page.url()})`);
  } else if (command === 'connect') {
    const { browser, context } = await connectToChrome();
    const pages = context.pages();
    console.log(`Connected! Open pages count: ${pages.length}`);
    for (const p of pages) {
      console.log(`- ${await p.title()} (${p.url()})`);
    }
    await browser.close();
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('[Chrome Autonomous Error]:', err.message);
    process.exit(1);
  });
}

module.exports = {
  CHROME_PATH,
  CHROME_USER_DATA_DEFAULT,
  AUTONOMOUS_PROFILE_DIR,
  CDP_PORT,
  isPortOpen,
  getOpenTabs,
  launchPersistentSession,
  runAutonomousTask,
  connectToChrome
};
