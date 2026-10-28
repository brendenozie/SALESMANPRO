# Troubleshooting and Recovery Decision Tree

This document outlines the ordered troubleshooting strategy when connecting to, controlling, or recovering an automated Chrome browser session.

---

## 1. Troubleshooting Decision Tree (Least Disruptive First)

Always attempt the least disruptive remedy before escalating to browser restarts or process termination:

```
[Start Browser Task]
        │
        ▼
Is port 9222 listening? (netstat -ano | findstr 9222)
   ├── YES ──► Reconnect agent via CDP (playwright-core connectOverCDP)
   │               │
   │               ├── Connection OK? ──► [Proceed with task]
   │               └── Connection Failed? ──► Verify CDP WebSocket URL (/json/version)
   │
   └── NO ──► Are Chrome processes running? (Get-Process chrome)
                  │
                  ├── YES (Running without debugging port)
                  │      │
                  │      └── ASK / NOTIFY USER before closing active windows.
                  │          Launch Open-Chrome-Meta.bat to bind debugging port.
                  │
                  └── NO (Chrome not running)
                         │
                         └── Launch Chrome with --remote-debugging-port=9222
```

---

## 2. Common Failure Conditions & Verified Remedies

### Issue 1: `connect ECONNREFUSED 127.0.0.1:9222`
- **Symptom**: Playwright throws `connect ECONNREFUSED 127.0.0.1:9222` when attempting `connectOverCDP`.
- **Cause**: Chrome is either not running, or it was started normally by the user without the `--remote-debugging-port=9222` flag.
- **Remedy**:
  1. Run diagnostic:
     ```powershell
     powershell -ExecutionPolicy Bypass -File .agents/skills/chrome-browser-access/scripts/browser-health-check.ps1
     ```
  2. If Chrome is running without the port: Notify user and execute `Open-Chrome-Meta.bat`, which gracefully restarts Chrome with the debugging listener active on `Profile 3`.
  3. If running from an agent terminal fails to display the GUI window due to Windows session isolation, double-click `Open-Chrome-Meta.bat` directly on the Windows Desktop.
  4. Verify port is listening with `curl.exe http://127.0.0.1:9222/json/version`.

---

### Issue 2: `ERROR: Input redirection is not supported` in Batch Files
- **Symptom**: Batch file fails immediately when calling `timeout /t 1 /nobreak >nul`.
- **Cause**: Windows command-line runners in automated environments reject `timeout` when stdin/stdout are redirected.
- **Remedy**:
  - Replace `timeout` with a cross-environment sleep using `ping`:
    ```cmd
    ping -n 2 127.0.0.1 >nul
    ```
  - Or use PowerShell: `powershell -Command "Start-Sleep -Seconds 1"`.

---

### Issue 3: `Timeout 30000ms exceeded waiting for "networkidle"`
- **Symptom**: `page.goto(url, { waitUntil: 'networkidle' })` hangs for 30 seconds and throws `TimeoutError`.
- **Cause**: Modern web applications (Facebook Developer Console, Meta Business Suite, AWS Console) run persistent background polling, telemetry, and WebSockets. The network never goes completely idle.
- **Remedy**:
  - Always use `waitUntil: 'domcontentloaded'` followed by an explicit short wait for the target selector:
    ```javascript
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"]', { timeout: 10000 });
    ```

---

### Issue 3: Element Click Intercepted in Modals or Dialogs
- **Symptom**:
  `... <div ...> intercepts pointer events. Retrying click action ... TimeoutError`
- **Cause**: Floating notification banners, sticky headers, or backdrop overlays sit on top of the target element in the z-order.
- **Remedy**:
  1. Scroll element into view before clicking:
     ```javascript
     await element.scrollIntoViewIfNeeded();
     ```
  2. Pass `{ force: true }` to the Playwright click locator:
     ```javascript
     await page.locator('button:has-text("Save")').click({ force: true });
     ```

---

### Issue 4: React Form Input Does Not Trigger "Next" or "Submit" Button
- **Symptom**: Assigning `input.value = "text"` via DOM evaluation succeeds, but the form's "Next" button remains disabled (`aria-disabled="true"`).
- **Cause**: React controls component state through synthetic events. Direct DOM property manipulation bypasses React's `onChange` listeners.
- **Remedy**:
  - Use Playwright's native `fill` action:
    ```javascript
    await page.locator('input[placeholder="Name"]').fill("Desired Value");
    ```

---

### Issue 5: PowerShell SSH Command Syntax Error with Quotes or Variables
- **Symptom**: Running commands via PowerShell SSH with inline bash strings fails with syntax errors or empty variable substitution.
- **Cause**: Windows PowerShell interpolates `$VARIABLES` and parses nested double quotes before passing them to SSH.
- **Remedy**:
  - Pipe the bash script into SSH via `stdin` using a local Node.js script:
    ```javascript
    const { execSync } = require('child_process');
    const script = `... your bash commands here ...`;
    execSync('ssh -p 2222 user@host "bash -s"', { input: script, encoding: 'utf-8' });
    ```

---

## 3. Strict Safety & Integrity Rules

1. **NEVER** delete the user's `User Data` folder or `Default`/`Profile 3` directory.
2. **NEVER** clear cookies or session storage as a blind troubleshooting step.
3. **NEVER** run `taskkill /F /IM chrome.exe` unless explicitly authorized by the user or when invoking the user's dedicated restart script.
4. Always check if the user is in the middle of active uncommitted work before restarting any application.
