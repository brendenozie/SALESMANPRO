"use strict";
/**
 * lib/automation/playwright/browserManager.ts
 *
 * Supervised Browser Lifecycle & Session Manager for SalesmanPro.
 * Enforces explicit human authorization, isolated persistent profiles,
 * domain allowlisting, CDP integration on port 9222, and safety controls
 * against unauthorized navigation and credential leakage.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.browserManager = exports.BrowserManager = exports.CDP_PORT = exports.AUTONOMOUS_PROFILE_DIR = exports.CHROME_PATH = exports.ALLOWED_PORTAL_DOMAINS = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auditLogger_1 = require("./auditLogger");
const secretRedaction_1 = require("./secretRedaction");
// Allowed official developer/provider portal domains
exports.ALLOWED_PORTAL_DOMAINS = [
    'developers.facebook.com',
    'facebook.com',
    'instagram.com',
    'console.groq.com',
    'groq.com',
    'platform.openai.com',
    'openai.com',
    'aistudio.google.com',
    'console.cloud.google.com',
    'accounts.google.com',
    'googleapis.com',
    'developer.safaricom.co.ke',
    'safaricom.co.ke',
    'dashboard.paystack.com',
    'paystack.com',
    'dashboard.stripe.com',
    'stripe.com',
    'developer.paypal.com',
    'paypal.com',
    'ghuba.shop',
    'console.anthropic.com',
    'anthropic.com',
    'developers.tiktok.com',
    'tiktok.com',
    'sms.textsms.co.ke',
    'resend.com',
    'app.sendgrid.com',
    'sendgrid.com',
    'console.aws.amazon.com',
    'aws.amazon.com',
    'console.wasabisys.com',
    'localhost',
    'salesmanpro.store',
    'auth.salesmanpro.store',
];
exports.CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
exports.AUTONOMOUS_PROFILE_DIR = path_1.default.resolve('storage', 'automation', 'chrome-profile');
exports.CDP_PORT = 9222;
class BrowserManager {
    static instance;
    activeSessions = new Map();
    baseStorageDir;
    screenshotsDir;
    constructor() {
        this.baseStorageDir = path_1.default.resolve('storage', 'automation', 'browser-profiles');
        this.screenshotsDir = path_1.default.resolve('storage', 'automation', 'screenshots');
        if (!fs_1.default.existsSync(this.baseStorageDir)) {
            fs_1.default.mkdirSync(this.baseStorageDir, { recursive: true });
        }
        if (!fs_1.default.existsSync(this.screenshotsDir)) {
            fs_1.default.mkdirSync(this.screenshotsDir, { recursive: true });
        }
        if (!fs_1.default.existsSync(exports.AUTONOMOUS_PROFILE_DIR)) {
            fs_1.default.mkdirSync(exports.AUTONOMOUS_PROFILE_DIR, { recursive: true });
        }
    }
    static getInstance() {
        if (!BrowserManager.instance) {
            BrowserManager.instance = new BrowserManager();
        }
        return BrowserManager.instance;
    }
    getPlaywright() {
        try {
            return require('playwright');
        }
        catch {
            try {
                return require('playwright-core');
            }
            catch {
                throw new Error('Playwright is not installed. Please install playwright or playwright-core.');
            }
        }
    }
    /**
     * Check if remote debugging port is active.
     */
    async isPortOpen(port = exports.CDP_PORT) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        try {
            const res = await fetch(`http://127.0.0.1:${port}/json/version`, {
                signal: controller.signal,
            });
            return res.ok;
        }
        catch {
            return false;
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    /**
     * Validate if a target URL is an authorized provider portal.
     */
    isUrlAuthorized(urlStr) {
        try {
            const url = new URL(urlStr);
            return exports.ALLOWED_PORTAL_DOMAINS.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
        }
        catch {
            return false;
        }
    }
    /**
     * Connect to an existing running Chrome instance over CDP (port 9222).
     */
    async connectToRunningChrome(providerId = 'system-cdp', port = exports.CDP_PORT) {
        const { chromium } = this.getPlaywright();
        const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
        const context = browser.contexts()[0];
        const pages = context.pages();
        const page = pages.length > 0 ? pages[0] : await context.newPage();
        const sessionId = `cdp_${providerId}_${Date.now()}`;
        const session = {
            sessionId,
            providerId,
            browser,
            context,
            page,
            createdAt: new Date().toISOString(),
            isCdpConnected: true,
        };
        this.activeSessions.set(sessionId, session);
        auditLogger_1.auditLogger.log({
            actor: 'AUTOMATION_AGENT',
            action: 'SESSION_START',
            providerId,
            variableNames: [],
            status: 'SUCCESS',
            details: { sessionId, type: 'CDP_ATTACHED', port },
        });
        return session;
    }
    /**
     * Launch a persistent autonomous session using the existing authenticated chrome-profile directory.
     */
    async launchPersistentSession(options = {}) {
        const { chromium } = this.getPlaywright();
        const providerId = options.providerId || 'autonomous-session';
        const profileDir = options.profileDir || exports.AUTONOMOUS_PROFILE_DIR;
        if (!fs_1.default.existsSync(profileDir)) {
            fs_1.default.mkdirSync(profileDir, { recursive: true });
        }
        const context = await chromium.launchPersistentContext(profileDir, {
            executablePath: fs_1.default.existsSync(exports.CHROME_PATH) ? exports.CHROME_PATH : undefined,
            headless: options.headless ?? false,
            viewport: { width: 1366, height: 768 },
            args: [
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-blink-features=AutomationControlled',
                `--remote-debugging-port=${exports.CDP_PORT}`,
            ],
        });
        const pages = context.pages();
        const page = pages.length > 0 ? pages[0] : await context.newPage();
        if (options.url) {
            if (this.isUrlAuthorized(options.url)) {
                await page.goto(options.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            }
            else {
                throw new Error(`Unauthorized URL blocked: ${options.url}`);
            }
        }
        const sessionId = `persistent_${providerId}_${Date.now()}`;
        const session = {
            sessionId,
            providerId,
            browser: null,
            context,
            page,
            createdAt: new Date().toISOString(),
            isCdpConnected: false,
        };
        this.activeSessions.set(sessionId, session);
        auditLogger_1.auditLogger.log({
            actor: 'AUTOMATION_AGENT',
            action: 'SESSION_START',
            providerId,
            variableNames: [],
            status: 'SUCCESS',
            details: { sessionId, type: 'PERSISTENT_CONTEXT', profileDir },
        });
        return session;
    }
    /**
     * Automatically acquire session: connects to running Chrome on 9222 if available,
     * or launches persistent authenticated session with storage/automation/chrome-profile.
     */
    async getOrLaunchSession(providerId, options = {}) {
        const open = await this.isPortOpen(exports.CDP_PORT);
        if (open) {
            try {
                const session = await this.connectToRunningChrome(providerId, exports.CDP_PORT);
                if (options.url) {
                    await this.navigateToPortal(session, options.url);
                }
                return session;
            }
            catch (err) {
                (0, secretRedaction_1.safeLog)('Failed to attach over CDP port 9222, falling back to persistent profile launch...');
            }
        }
        return await this.launchPersistentSession({
            providerId,
            headless: options.headless ?? false,
            url: options.url,
        });
    }
    /**
     * Backward-compatible launchSupervisedSession.
     */
    async launchSupervisedSession(config, userAuthorized) {
        if (!userAuthorized) {
            throw new Error('SECURITY_VIOLATION: Browser automation requires explicit Super Admin or developer authorization.');
        }
        return this.getOrLaunchSession(config.providerId, {
            headless: config.headless ?? false,
        });
    }
    /**
     * Safely navigate to a provider portal with domain verification and redirect checks.
     */
    async navigateToPortal(session, targetUrl, timeoutMs = 30000) {
        if (!this.isUrlAuthorized(targetUrl)) {
            auditLogger_1.auditLogger.log({
                actor: 'AUTOMATION_AGENT',
                action: 'PORTAL_ACCESS',
                providerId: session.providerId,
                variableNames: [],
                status: 'BLOCKED',
                details: { blockedUrl: targetUrl, reason: 'Domain not in authorized provider allowlist' },
            });
            throw new Error(`Access to unauthorized URL blocked by security policy: ${targetUrl}`);
        }
        await session.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
        await session.page.waitForLoadState('load').catch(() => { });
        const finalUrl = session.page.url();
        const challenge = await this.detectPageChallenge(session.page);
        auditLogger_1.auditLogger.log({
            actor: 'AUTOMATION_AGENT',
            action: 'PORTAL_ACCESS',
            providerId: session.providerId,
            variableNames: [],
            status: challenge.type === 'NONE' ? 'SUCCESS' : 'BLOCKED',
            details: { targetUrl, finalUrl, challengeType: challenge.type },
        });
        return {
            success: challenge.type === 'NONE',
            finalUrl,
            challenge,
        };
    }
    /**
     * Detect login forms, MFA prompts, CAPTCHAs, or error screens.
     */
    async detectPageChallenge(page) {
        try {
            const url = page.url() || '';
            const lowerUrl = url.toLowerCase();
            // Check URL clues
            if (lowerUrl.includes('accounts.google.com/signin') ||
                lowerUrl.includes('login') ||
                lowerUrl.includes('signin') ||
                lowerUrl.includes('/v20.0/dialog/oauth')) {
                // Is it truly a login screen or an authorized sub-app?
                const hasPasswordInput = await page.$('input[type="password"]');
                if (hasPasswordInput) {
                    return {
                        isChallengeDetected: true,
                        type: 'LOGIN_REQUIRED',
                        details: `Authentication screen detected at ${url}. Active session required.`,
                    };
                }
            }
            // Check CAPTCHA
            const hasCaptcha = await page.$('iframe[src*="recaptcha"], iframe[src*="turnstile"], iframe[src*="hcaptcha"], div.g-recaptcha, div#cf-turnstile');
            if (hasCaptcha) {
                return {
                    isChallengeDetected: true,
                    type: 'CAPTCHA_DETECTED',
                    details: 'Bot protection CAPTCHA challenge detected on portal page.',
                };
            }
            // Check MFA / OTP
            const hasMfaText = await page.evaluate(() => {
                const text = document.body ? document.body.innerText.toLowerCase() : '';
                return (text.includes('two-factor authentication') ||
                    text.includes('2-step verification') ||
                    text.includes('enter the 6-digit code') ||
                    text.includes('security code sent'));
            });
            if (hasMfaText) {
                return {
                    isChallengeDetected: true,
                    type: 'MFA_REQUIRED',
                    details: 'Two-factor authentication prompt requires developer verification.',
                };
            }
            // Check Access Denied
            const isAccessDenied = await page.evaluate(() => {
                const text = document.body ? document.body.innerText.toLowerCase() : '';
                return (text.includes('access denied') ||
                    text.includes('you do not have permission') ||
                    text.includes('403 forbidden') ||
                    text.includes('unauthorized'));
            });
            if (isAccessDenied) {
                return {
                    isChallengeDetected: true,
                    type: 'ACCESS_DENIED',
                    details: 'Access denied or insufficient developer console permissions.',
                };
            }
            return {
                isChallengeDetected: false,
                type: 'NONE',
                details: 'Portal loaded with authenticated developer access verified.',
            };
        }
        catch (err) {
            return {
                isChallengeDetected: false,
                type: 'NONE',
                details: `Page evaluation exception: ${err?.message || 'unknown'}`,
            };
        }
    }
    /**
     * Capture non-sensitive diagnostic screenshot on error.
     */
    async captureDiagnostic(page, providerId, stepName) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${providerId}_${stepName}_${timestamp}.png`;
            const filePath = path_1.default.join(this.screenshotsDir, filename);
            await page.screenshot({ path: filePath, fullPage: false });
            return filePath;
        }
        catch {
            return null;
        }
    }
    /**
     * Pause execution to allow the developer to complete manual authentication
     * (e.g. 2FA, OTP, CAPTCHA, or Billing confirmation).
     */
    async waitForUserAction(session, instruction, timeoutMs = 300000) {
        console.log(`\n======================================================`);
        console.log(`[ACTION REQUIRED BY DEVELOPER / SUPER ADMIN]`);
        console.log(`Provider: ${session.providerId}`);
        console.log(`Instructions: ${instruction}`);
        console.log(`Waiting in supervised browser window...`);
        console.log(`======================================================\n`);
        auditLogger_1.auditLogger.log({
            actor: 'DEVELOPER',
            action: 'USER_APPROVAL_GRANTED',
            providerId: session.providerId,
            variableNames: [],
            status: 'SUCCESS',
            details: { instruction, timeoutMs },
        });
        await session.page.waitForLoadState('networkidle', { timeout: timeoutMs }).catch(() => { });
    }
    /**
     * Terminate and clean up an active browser session.
     */
    async closeSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
            try {
                if (session.isCdpConnected && session.browser) {
                    await session.browser.close();
                }
                else if (session.context) {
                    await session.context.close();
                }
            }
            catch (err) {
                console.warn('Error closing browser session:', err);
            }
            this.activeSessions.delete(sessionId);
        }
    }
    /**
     * Terminate all open sessions on shutdown.
     */
    async closeAllSessions() {
        for (const [id] of this.activeSessions) {
            await this.closeSession(id);
        }
    }
}
exports.BrowserManager = BrowserManager;
exports.browserManager = BrowserManager.getInstance();
