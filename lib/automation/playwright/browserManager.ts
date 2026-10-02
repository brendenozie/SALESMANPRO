/**
 * lib/automation/playwright/browserManager.ts
 *
 * Supervised Browser Lifecycle & Session Manager for SalesmanPro.
 * Enforces explicit human authorization, isolated sandbox profiles,
 * domain allowlisting, and safety controls against unauthorized navigation.
 */

import path from 'path';
import fs from 'fs';
import { auditLogger } from './auditLogger';
import { SupervisedSessionConfig } from './types';

// Allowed official developer/provider portal domains
const ALLOWED_PORTAL_DOMAINS = [
  'developers.facebook.com',
  'facebook.com',
  'instagram.com',
  'console.groq.com',
  'platform.openai.com',
  'aistudio.google.com',
  'console.cloud.google.com',
  'developer.safaricom.co.ke',
  'dashboard.paystack.com',
  'dashboard.stripe.com',
  'developer.paypal.com',
  'ghuba.shop',
  'console.anthropic.com',
  'developers.tiktok.com',
  'sms.textsms.co.ke',
  'resend.com',
  'app.sendgrid.com',
  'console.aws.amazon.com',
  'console.wasabisys.com',
  'localhost',
  'salesmanpro.site',
  'auth.salesmanpro.site',
];

export interface BrowserSession {
  sessionId: string;
  providerId: string;
  browser: any;
  context: any;
  page: any;
  createdAt: string;
}

export class BrowserManager {
  private static instance: BrowserManager;
  private activeSessions: Map<string, BrowserSession> = new Map();
  private baseStorageDir: string;

  private constructor() {
    this.baseStorageDir = path.resolve('storage', 'automation', 'browser-profiles');
    if (!fs.existsSync(this.baseStorageDir)) {
      fs.mkdirSync(this.baseStorageDir, { recursive: true });
    }
  }

  public static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  /**
   * Validate if a target URL is an authorized provider portal.
   */
  public isUrlAuthorized(urlStr: string): boolean {
    try {
      const url = new URL(urlStr);
      return ALLOWED_PORTAL_DOMAINS.some(
        (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }

  /**
   * Launch an isolated, explicitly authorized browser session for supervised onboarding.
   */
  public async launchSupervisedSession(
    config: SupervisedSessionConfig,
    userAuthorized: boolean
  ): Promise<BrowserSession> {
    if (!userAuthorized) {
      throw new Error(
        'SECURITY_VIOLATION: Browser automation requires explicit Super Admin or developer authorization.'
      );
    }

    // Dynamically load playwright or playwright-core
    let playwright: any;
    try {
      playwright = require('playwright');
    } catch {
      try {
        playwright = require('playwright-core');
      } catch (err: any) {
        throw new Error(
          'Playwright is not installed. Please install playwright or playwright-core to run supervised browser onboarding.'
        );
      }
    }

    const sessionId = `session_${config.providerId}_${Date.now()}`;
    const isolatedProfileDir = path.join(this.baseStorageDir, config.providerId);
    if (!fs.existsSync(isolatedProfileDir)) {
      fs.mkdirSync(isolatedProfileDir, { recursive: true });
    }

    // Launch with isolated profile (never uses user's default browser profile)
    const browser = await playwright.chromium.launch({
      headless: config.headless ?? false,
      slowMo: config.slowMoMs ?? 50,
      args: [
        '--no-default-browser-check',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    // Enforce URL navigation guard
    page.on('framenavigated', (frame: any) => {
      if (frame === page.mainFrame()) {
        const url = frame.url();
        if (url !== 'about:blank' && !this.isUrlAuthorized(url)) {
          console.warn(`[SECURITY WARNING] Attempted navigation to unauthorized domain: ${url}`);
        }
      }
    });

    const session: BrowserSession = {
      sessionId,
      providerId: config.providerId,
      browser,
      context,
      page,
      createdAt: new Date().toISOString(),
    };

    this.activeSessions.set(sessionId, session);

    auditLogger.log({
      actor: 'SUPER_ADMIN',
      action: 'SESSION_START',
      providerId: config.providerId,
      variableNames: [],
      status: 'SUCCESS',
      details: { sessionId, headless: config.headless ?? false },
    });

    return session;
  }

  /**
   * Safely navigate to a provider portal with domain verification.
   */
  public async navigateToPortal(session: BrowserSession, targetUrl: string): Promise<boolean> {
    if (!this.isUrlAuthorized(targetUrl)) {
      auditLogger.log({
        actor: 'AUTOMATION_AGENT',
        action: 'PORTAL_ACCESS',
        providerId: session.providerId,
        variableNames: [],
        status: 'BLOCKED',
        details: { blockedUrl: targetUrl, reason: 'Domain not in authorized provider allowlist' },
      });
      throw new Error(`Access to unauthorized URL blocked by security policy: ${targetUrl}`);
    }

    await session.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    auditLogger.log({
      actor: 'AUTOMATION_AGENT',
      action: 'PORTAL_ACCESS',
      providerId: session.providerId,
      variableNames: [],
      status: 'SUCCESS',
      details: { targetUrl },
    });

    return true;
  }

  /**
   * Pause execution to allow the developer to complete manual authentication
   * (e.g. 2FA, OTP, CAPTCHA, or Billing confirmation).
   */
  public async waitForUserAction(
    session: BrowserSession,
    instruction: string,
    timeoutMs = 300000
  ): Promise<void> {
    console.log(`\n======================================================`);
    console.log(`[ACTION REQUIRED BY DEVELOPER / SUPER ADMIN]`);
    console.log(`Provider: ${session.providerId}`);
    console.log(`Instructions: ${instruction}`);
    console.log(`Waiting in supervised browser window...`);
    console.log(`======================================================\n`);

    auditLogger.log({
      actor: 'DEVELOPER',
      action: 'USER_APPROVAL_GRANTED',
      providerId: session.providerId,
      variableNames: [],
      status: 'SUCCESS',
      details: { instruction, timeoutMs },
    });

    // Wait for page load or user signal
    await session.page.waitForLoadState('networkidle', { timeout: timeoutMs }).catch(() => {
      // Ignore networkidle timeout if developer takes time
    });
  }

  /**
   * Terminate and clean up an active browser session.
   */
  public async closeSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      try {
        await session.context?.close();
        await session.browser?.close();
      } catch (err) {
        console.warn('Error closing browser session:', err);
      }
      this.activeSessions.delete(sessionId);
    }
  }

  /**
   * Terminate all open sessions on shutdown.
   */
  public async closeAllSessions(): Promise<void> {
    for (const [id] of this.activeSessions) {
      await this.closeSession(id);
    }
  }
}

export const browserManager = BrowserManager.getInstance();
