# Chrome Launch and Connection Reference

This guide documents the verified, reproducible procedure for launching Google Chrome with remote debugging (CDP) enabled and connecting agent automation scripts to an existing authenticated profile on Windows.

---

## 1. Environment Architecture & Prerequisites

- **Host Operating System**: Windows 11 / Windows 10
- **Chrome Executable Path**: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- **Fallback Paths**:
  - `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
  - `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe`
- **Default Profile Directory**: `Profile 3` (`brenden work` / `brendenodhiambo@gmail.com`)
  - Full path: `C:\Users\Brenden\AppData\Local\Google\Chrome\User Data\Profile 3`
- **Remote Debugging Port**: `9222`
- **Automation Protocol**: Chrome DevTools Protocol (CDP) via `playwright-core`

---

## 2. Pre-Launch Verification

Before launching a new instance, check if Chrome is already running or if the debugging port is already open.

### Step 2.1: Check if Debugging Port 9222 is Listening
```powershell
netstat -ano | findstr 9222
```
or test HTTP connectivity:
```powershell
curl.exe -s http://127.0.0.1:9222/json/version
```

- **If port 9222 responds with JSON**: Chrome is already running with remote debugging enabled. **Do NOT restart Chrome.** Proceed directly to Step 4 (Agent Connection).
- **If port 9222 is closed**: Proceed to Step 2.2.

### Step 2.2: Check Existing Chrome Processes
```powershell
Get-Process -Name chrome -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, MainWindowTitle
```

> **CRITICAL RULE**: If Chrome is already running *without* `--remote-debugging-port`, launching a second `chrome.exe` command will simply delegate the request to the existing process and exit immediately. The port will **not** open.
> To open the debugging port on the user's profile, existing Chrome processes must be gracefully closed or the user must launch the provided helper script.

---

## 3. Verified Launch Procedure

### Method A: Using the Dedicated Desktop Launcher (Recommended)
A dedicated launcher script is located in the repository root:
[`Open-Chrome-Meta.bat`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/Open-Chrome-Meta.bat)

```cmd
@echo off
echo Cleaning up any background Chrome instances...
taskkill /F /IM chrome.exe >nul 2>&1
ping -n 2 127.0.0.1 >nul
echo Starting Google Chrome for Brenden Work profile with DevTools port 9222...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --profile-directory="Profile 3" "https://developers.facebook.com/apps/"
exit /b 0
```

> **WINDOWS SESSION NOTE**: On Windows, child processes spawned by background terminal agents may run with detached GUI window stations. If launching Chrome from the agent terminal does not render a visible browser window, **double-click `Open-Chrome-Meta.bat` directly from Windows Explorer or the Desktop**. This guarantees Chrome launches inside the user's primary interactive desktop session (Session 1) with port 9222 actively listening on `127.0.0.1`.

### Method B: Direct Command Line (PowerShell / CMD)
```powershell
cmd.exe /c start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --profile-directory="Profile 3" "https://developers.facebook.com/apps/"
```

### Key Parameters Explained:
| Parameter | Purpose |
| :--- | :--- |
| `cmd.exe /c start ""` | Detaches Chrome so the PowerShell process does not block or terminate Chrome when the terminal exits. |
| `--remote-debugging-port=9222` | Opens the Chrome DevTools Protocol (CDP) WebSocket listener on localhost port 9222. |
| `--profile-directory="Profile 3"` | Attaches directly to the authenticated developer profile containing logged-in sessions for Meta, Google, GitHub, etc. |
| `"https://..."` | Optional starting URL to navigate to immediately on launch. |

---

## 4. Connecting the Agent (Playwright-Core over CDP)

Use `playwright-core` to attach to the live browser instance without launching a separate headless browser.

### Minimal Connection Pattern:
```javascript
const { chromium } = require('playwright-core');

async function connectToBrowser(port = 9222) {
  // Connect to the existing Chrome instance via CDP
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  
  // Retrieve the existing default context (preserving cookies and logins)
  const context = browser.contexts()[0];
  
  // Find an existing target tab or use the first available page
  const pages = context.pages();
  const page = pages.find(p => p.url().includes('developers.facebook.com')) || pages[0];
  
  return { browser, context, page };
}
```

---

## 5. Safe Interaction Best Practices

When interacting with authenticated web applications (e.g. Meta Developer Console, AWS, Google Cloud Console):

1. **Navigation**: Use `{ waitUntil: 'domcontentloaded' }` instead of `'networkidle'`. Many developer dashboards maintain persistent websockets and background analytics loops, causing `'networkidle'` to hit 30-second timeouts.
   ```javascript
   await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
   await page.waitForTimeout(2000);
   ```

2. **React / Dynamic Input Fields**: Do not assign `.value = '...'` in DOM directly, as React synthetic event listeners will not detect the change. Use Playwright's `locator.fill()`:
   ```javascript
   await page.locator('input[type="text"]').first().fill('DesiredValue');
   ```

3. **Click Interception in Modals**: Dialog elements or floating notification toasts frequently intercept pointer events. Use `{ force: true }` or scroll into view:
   ```javascript
   await page.locator('button:has-text("Submit")').click({ force: true });
   ```

4. **Detaching Without Closing Chrome**: When an automation script finishes, call `await browser.close()`. In `playwright-core`, closing a CDP-connected browser instance **only disconnects the WebSocket**; it does **not** kill the user's Chrome browser window.
