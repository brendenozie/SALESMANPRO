---
name: chrome-browser-access
description: >-
  Provides verified procedures, health checks, and recovery workflows for launching,
  connecting to, and controlling Google Chrome via the Chrome DevTools Protocol (CDP)
  using the user's authenticated profiles on Windows. Use this skill whenever a task
  requires inspecting or automating developer consoles (Meta/Facebook, Instagram, Google Cloud,
  TikTok, AI Studio, AWS), OAuth configuration, API credential setup, or web interactions.
---

# Chrome Browser Access & Automation Skill

This skill provides the permanent, verified standard operating procedure for discovering, launching, inspecting, and automating Google Chrome on Windows via the Chrome DevTools Protocol (CDP) using the user's existing authenticated developer profiles.

---

## 1. Quick Start: Standard Workflow

Whenever a task requires browser access or developer console configuration:

1. **Run the Health Check**:
   Verify if Chrome is already running with remote debugging port `9222` active.
   ```powershell
   powershell -ExecutionPolicy Bypass -File .agents/skills/chrome-browser-access/scripts/browser-health-check.ps1
   ```
   Or via Node.js:
   ```bash
   node .agents/skills/chrome-browser-access/scripts/browser-health-check.js
   ```

2. **Evaluate Health Check Result**:
   - **`PASS`**: Chrome is already listening on `127.0.0.1:9222`. Connect immediately via Playwright CDP (do **not** relaunch Chrome).
   - **`FAIL` / `NOT VERIFIED`**: Follow the [Launch Procedure](#2-verified-launch-procedure) below to start Chrome with remote debugging.

3. **Attach via Playwright CDP**:
   Execute your task automation script using `playwright-core` attached to `http://127.0.0.1:9222`.

---

## 2. Verified Launch Procedure

### Target Configuration:
- **Executable**: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- **Profile Directory**: `Profile 3` (`brenden work` / `brendenodhiambo@gmail.com`)
- **Remote Debugging Port**: `9222`

### Launch Command:
```powershell
cmd.exe /c start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --profile-directory="Profile 3" "https://developers.facebook.com/apps/"
```
*(Or invoke the repository helper: [`Open-Chrome-Meta.bat`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/Open-Chrome-Meta.bat))*

> **IMPORTANT**: If Chrome is already running without `--remote-debugging-port`, launching Chrome again will not open port 9222 because Windows routes the call to the existing instance. Close any background Chrome processes first, then launch with `--remote-debugging-port=9222`.

---

## 3. Automation Implementation Pattern (Playwright-Core)

Always use this pattern in Node.js automation scripts:

```javascript
const { chromium } = require('playwright-core');

async function runAutomation() {
  // 1. Connect over CDP
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  
  // 2. Select or create target page
  const pages = context.pages();
  const page = pages.find(p => p.url().includes('facebook.com')) || pages[0] || await context.newPage();

  // 3. Navigate with domcontentloaded (avoids 30s timeout on websocket-heavy apps)
  await page.goto('https://developers.facebook.com/apps/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 4. Perform non-destructive inspection or target actions
  console.log('Active Page Title:', await page.title());

  // 5. Cleanly detach CDP client (does NOT close the user's browser window)
  await browser.close();
}

runAutomation().catch(console.error);
```

---

## 4. Key References & Runbooks

- [**Launch & Connection Guide**](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/.agents/skills/chrome-browser-access/references/browser-launch-and-connection.md): Detailed parameter breakdown, profile mapping, and CDP socket architecture.
- [**Troubleshooting & Recovery Tree**](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/.agents/skills/chrome-browser-access/references/troubleshooting-and-recovery.md): Diagnostic flowchart, common errors (click interception, React form inputs, timeout resolution), and recovery hierarchy.
- [**Security & Session Preservation**](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/.agents/skills/chrome-browser-access/references/security-and-authenticated-sessions.md): Localhost binding rules, zero credential leakage in logs, and session protection.

---

## 5. Diagnostic Scripts

- PowerShell Diagnostic: [`scripts/browser-health-check.ps1`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/.agents/skills/chrome-browser-access/scripts/browser-health-check.ps1)
- Node.js Diagnostic: [`scripts/browser-health-check.js`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/.agents/skills/chrome-browser-access/scripts/browser-health-check.js)
