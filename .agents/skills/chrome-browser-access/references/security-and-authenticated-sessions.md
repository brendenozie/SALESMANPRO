# Security and Authenticated Sessions Reference

This document defines the security requirements, session preservation rules, and network boundaries governing agent browser automation.

---

## 1. Remote Debugging Port Security (CDP Isolation)

The Chrome DevTools Protocol allows arbitrary code execution and DOM inspection inside the browser. It must be strictly isolated:

1. **Localhost Binding Only**:
   - The remote debugging port (`9222`) must **only** bind to `127.0.0.1` (or `localhost`).
   - **NEVER** pass `--remote-debugging-address=0.0.0.0` or expose port 9222 across local area networks, public IP interfaces, or firewalls.
   - Verify active binding using:
     ```powershell
     Get-NetTCPConnection -LocalPort 9222 | Select-Object LocalAddress, LocalPort, State
     ```
     The `LocalAddress` must always be `127.0.0.1` or `::1`.

2. **No External Port Forwarding**:
   - Do not open incoming firewall rules for port 9222.
   - Do not forward port 9222 through SSH tunnels unless explicitly required and authenticated.

---

## 2. Preserving Authenticated Sessions

The primary advantage of attaching to the user's existing Chrome profile (`Profile 3`) is leveraging pre-authenticated sessions (Meta Developer Console, GitHub, Google Cloud, AWS) without having to request passwords or store sensitive credentials.

To maintain session integrity:

- **Do Not Log Out**: Avoid clicking "Log Out", "Sign Out", or "Switch Account" in any active tab.
- **Do Not Wipe Cookies**: Never execute `context.clearCookies()` or delete cache/storage directories.
- **Do Not Re-Authenticate Unnecessarily**: If an account requires re-authentication (such as a 2FA prompt or password confirmation), pause and prompt the user rather than attempting to bypass or automate credentials.

---

## 3. Secret Redaction & Log Sanitization

1. **Zero Secret Storage in Documentation**:
   - No passwords, session cookies, Bearer tokens, App Secrets, or Private Keys should ever be written to skill files, scripts, or commit history.
   - Use environment variables (`.env`) for secrets, and reference them via standard configuration keys.

2. **Redaction in Diagnostics & Scripts**:
   - All diagnostic scripts (e.g. `browser-health-check.ps1` and `browser-health-check.js`) are designed to print metadata only (e.g., page title, domain, protocol version).
   - Scripts must never dump `document.cookie`, `localStorage`, or Authorization headers to standard output.

3. **Restricted Actions**:
   - Always request explicit confirmation before:
     - Deleting production data, cloud buckets, or business assets.
     - Modifying billing or subscription configurations.
     - Publishing live posts or making public configuration changes without prior alignment.
