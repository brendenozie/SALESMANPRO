/**
 * tests/storefront-mobile-audit.ts
 *
 * Universal Mobile Performance, Blank-Screen, and Layout Stability Test Suite
 * Validates storefronts across Pixel 5 (390x844 DPR 2.75) and Galaxy A52 (360x800 DPR 2.0)
 */

import { chromium, Browser, Page, BrowserContext } from "playwright-core";
import * as fs from "fs";
import * as path from "path";

export interface StoreAuditMetrics {
  device: string;
  initialLoadMs: number;
  domNodes: number;
  imagesCount: number;
  frameCount: number;
  longTasks: number;
  longTaskDuration: number;
  jankFrames: number;
  severeHitchFrames: number;
  p50FrameGap: number;
  p95FrameGap: number;
  p99FrameGap: number;
  maxFrameGap: number;
  cls: number;
  blankScreens: number;
  passed: boolean;
}

export interface StoreAuditReport {
  storeId: string;
  storeName: string;
  targetUrl: string;
  timestamp: string;
  devices: {
    pixel5: StoreAuditMetrics;
    galaxyA52: StoreAuditMetrics;
  };
  overallPassed: boolean;
}

const IN_PAGE_DETECTOR = `
(function() {
  window.__auditDetector = {
    longTasks: [],
    frameGaps: [],
    cumulativeLayoutShift: 0,
    lastFrameTime: performance.now(),
    blankScreens: 0,
    active: false,
    _loopStarted: false,
    reset: function() {
      this.longTasks = [];
      this.frameGaps = [];
      this.cumulativeLayoutShift = 0;
      this.lastFrameTime = 0;
      this.blankScreens = 0;
      this.active = true;
      if (!this._loopStarted) {
        this._loopStarted = true;
        var self = this;
        function loop() {
          if (!self.active) return;
          var now = performance.now();
          if (self.lastFrameTime > 0) {
            var delta = now - self.lastFrameTime;
            if (delta > 2 && delta < 2000) {
              self.frameGaps.push(delta);
            }
          }
          self.lastFrameTime = now;
          requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
      }
    },
    stop: function() {
      this.active = false;
      this._loopStarted = false;
    }
  };

  // Scroll listener for real-time blank screen detection
  window.addEventListener('scroll', function() {
    if (!window.__auditDetector.active) return;
    var cx = window.innerWidth / 2;
    var cy = window.innerHeight / 2;
    var el = document.elementFromPoint(cx, cy);
    if (!el || el.tagName.toLowerCase() === 'html') {
      window.__auditDetector.blankScreens++;
    }
  }, { passive: true });

  // Long task observer
  try {
    var lt = new PerformanceObserver(function(list) {
      list.getEntries().forEach(function(e) {
        if (window.__auditDetector.active) {
          window.__auditDetector.longTasks.push({ duration: e.duration, startTime: e.startTime });
        }
      });
    });
    lt.observe({ type: 'longtask', buffered: true });
  } catch(e) {}

  // Layout Shift Observer
  try {
    var cls = new PerformanceObserver(function(list) {
      list.getEntries().forEach(function(e) {
        if (window.__auditDetector.active && !e.hadRecentInput) {
          window.__auditDetector.cumulativeLayoutShift += e.value;
        }
      });
    });
    cls.observe({ type: 'layout-shift', buffered: true });
  } catch(e) {}
})();
`;

async function auditDevice(browser: Browser, url: string, deviceConfig: { name: string; width: number; height: number; dpr: number; userAgent: string }): Promise<StoreAuditMetrics> {
  console.log(`  [DEVICE TEST START] ${deviceConfig.name}`);
  const context = await browser.newContext({
    viewport: { width: deviceConfig.width, height: deviceConfig.height },
    deviceScaleFactor: deviceConfig.dpr,
    userAgent: deviceConfig.userAgent,
    isMobile: true,
    hasTouch: true,
  });
  await context.addInitScript(IN_PAGE_DETECTOR);
  const page = await context.newPage();

  console.log(`  [NAV] Navigating to ${url}...`);
  const t0 = Date.now();
  await page.goto(url, { waitUntil: "commit", timeout: 120000 });
  await page.waitForLoadState("domcontentloaded", { timeout: 60000 }).catch(() => {});
  // Dismiss cookies / modals if any
  await page.click('button:has-text("Accept All"), button:has-text("Accept")', { timeout: 300 }).catch(() => {});
  // Allow initial client hydration to settle
  await page.waitForTimeout(2000);
  const initialLoadMs = Date.now() - t0;
  console.log(`  [LOADED] in ${initialLoadMs}ms`);

  let blankScreens = 0;

  const cx = Math.round(deviceConfig.width / 2);
  const cy = Math.round(deviceConfig.height / 2);

  // Reset scroll-phase metrics so navigation/compile stalls do not pollute scroll frame measurements
  await page.evaluate(() => {
    if ((window as any).__auditDetector) {
      (window as any).__auditDetector.reset();
    }
  });

  console.log(`  [SCROLL] Running normal scroll...`);
  // 1. Normal scroll
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(50);
  }

  console.log(`  [SCROLL] Running rapid fling scroll...`);
  // 2. Rapid fling scroll
  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(40);
  }

  console.log(`  [SCROLL] Running direction reversal...`);
  // 3. Direction reversal
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => window.scrollBy(0, -600));
    await page.waitForTimeout(40);
  }

  // Settle & sample viewport visibility
  await page.waitForTimeout(400);

  // Extract recorded metrics
  const stats = await page.evaluate((coords: { cx: number; cy: number }) => {
    const detector = (window as any).__auditDetector || { frameGaps: [], longTasks: [], cumulativeLayoutShift: 0, blankScreens: 0 };
    const gaps: number[] = (detector.frameGaps || []).sort((a: number, b: number) => a - b);
    const frameCount = gaps.length;
    const p50 = frameCount ? gaps[Math.floor(frameCount * 0.50)] : 16.7;
    const p95 = frameCount ? gaps[Math.floor(frameCount * 0.95)] : 16.7;
    const p99 = frameCount ? gaps[Math.floor(frameCount * 0.99)] : 16.7;
    const maxGap = frameCount ? gaps[frameCount - 1] : 16.7;
    const jank = gaps.filter(g => g > 50).length;
    const severeHitch = gaps.filter(g => g > 100).length;

    const longTasks = detector.longTasks || [];
    const longTaskDuration = longTasks.reduce((acc: number, t: any) => acc + t.duration, 0);

    let blanks = detector.blankScreens || 0;
    const el = document.elementFromPoint(coords.cx, coords.cy);
    if (!el || el.tagName.toLowerCase() === 'html') {
      blanks++;
    }

    return {
      domNodes: document.querySelectorAll('*').length,
      imagesCount: document.querySelectorAll('img').length,
      frameCount,
      longTasks: longTasks.length,
      longTaskDuration: Math.round(longTaskDuration),
      jankFrames: jank,
      severeHitchFrames: severeHitch,
      p50FrameGap: Math.round(p50 * 10) / 10,
      p95FrameGap: Math.round(p95 * 10) / 10,
      p99FrameGap: Math.round(p99 * 10) / 10,
      maxFrameGap: Math.round(maxGap * 10) / 10,
      cls: Math.round(detector.cumulativeLayoutShift * 10000) / 10000,
      blankScreens: blanks,
    };
  }, { cx, cy });

  await context.close();

  const passed = stats.blankScreens === 0 && stats.p95FrameGap <= 33.4 && stats.cls <= 0.25;
  console.log(`  [METRICS] ${deviceConfig.name}: p50=${stats.p50FrameGap}ms, p95=${stats.p95FrameGap}ms, p99=${stats.p99FrameGap}ms, maxGap=${stats.maxFrameGap}ms, jank=${stats.jankFrames}, severeHitch=${stats.severeHitchFrames}, frames=${stats.frameCount}, CLS=${stats.cls}, blankScreens=${stats.blankScreens}, passed=${passed}`);

  return {
    device: deviceConfig.name,
    initialLoadMs,
    domNodes: stats.domNodes,
    imagesCount: stats.imagesCount,
    frameCount: stats.frameCount,
    longTasks: stats.longTasks,
    longTaskDuration: stats.longTaskDuration,
    jankFrames: stats.jankFrames,
    severeHitchFrames: stats.severeHitchFrames,
    p50FrameGap: stats.p50FrameGap,
    p95FrameGap: stats.p95FrameGap,
    p99FrameGap: stats.p99FrameGap,
    maxFrameGap: stats.maxFrameGap,
    cls: stats.cls,
    blankScreens,
    passed,
  };
}

export async function runStoreAudit(storeId: string, storeName: string, targetUrl: string): Promise<StoreAuditReport> {
  const launchArgs = { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] };
  let browser: Browser | null = null;
  for (const channel of ["chrome", "msedge", undefined] as const) {
    try {
      browser = await chromium.launch(channel ? { ...launchArgs, channel } : launchArgs);
      console.log(`[BROWSER] Successfully launched: ${channel || "bundled chromium"}`);
      break;
    } catch {}
  }
  if (!browser) throw new Error("Could not launch Chromium");

  try {
    const pixel5 = await auditDevice(browser, targetUrl, {
      name: "Pixel 5 (390x844 DPR 2.75)",
      width: 390,
      height: 844,
      dpr: 2.75,
      userAgent: "Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
    });

    const galaxyA52 = await auditDevice(browser, targetUrl, {
      name: "Galaxy A52 (360x800 DPR 2.0)",
      width: 360,
      height: 800,
      dpr: 2.0,
      userAgent: "Mozilla/5.0 (Linux; Android 11; SM-A525F) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
    });

    const overallPassed = pixel5.passed && galaxyA52.passed;

    return {
      storeId,
      storeName,
      targetUrl,
      timestamp: new Date().toISOString(),
      devices: { pixel5, galaxyA52 },
      overallPassed,
    };
  } finally {
    await browser.close();
  }
}

// Main CLI Execution
const targetUrl = process.argv[2] || "http://127.0.0.1:3000/site/ghuba";
const storeId = process.argv[3] || "STORE-001";
const storeName = process.argv[4] || "Ghuba";

console.log(`[AUDIT START] Auditing ${storeId} (${storeName}) at ${targetUrl}`);

runStoreAudit(storeId, storeName, targetUrl)
  .then(report => {
    console.log(`[AUDIT COMPLETE] ${storeId} (${storeName}) Result:`);
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.overallPassed ? 0 : 1);
  })
  .catch(err => {
    console.error(`[AUDIT ERROR]`, err);
    process.exit(1);
  });
