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
  longTasks: number;
  longTaskDuration: number;
  jankFrames: number;
  p95FrameGap: number;
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
  };

  // Frame gap recorder
  (function tick(now) {
    if (now && window.__auditDetector.lastFrameTime) {
      window.__auditDetector.frameGaps.push(now - window.__auditDetector.lastFrameTime);
    }
    window.__auditDetector.lastFrameTime = now;
    requestAnimationFrame(tick);
  })();

  // Long task observer
  try {
    var lt = new PerformanceObserver(function(list) {
      list.getEntries().forEach(function(e) {
        window.__auditDetector.longTasks.push({ duration: e.duration, startTime: e.startTime });
      });
    });
    lt.observe({ type: 'longtask', buffered: true });
  } catch(e) {}

  // Layout Shift Observer
  try {
    var cls = new PerformanceObserver(function(list) {
      list.getEntries().forEach(function(e) {
        if (!e.hadRecentInput) {
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

  const page = await context.newPage();

  console.log(`  [NAV] Navigating to ${url}...`);
  const t0 = Date.now();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.evaluate(IN_PAGE_DETECTOR);
  // Dismiss cookies / modals if any
  await page.click('button:has-text("Accept All"), button:has-text("Accept")').catch(() => {});
  // Allow initial client hydration to settle
  await page.waitForTimeout(2000);
  const initialLoadMs = Date.now() - t0;
  console.log(`  [LOADED] in ${initialLoadMs}ms`);

  let blankScreens = 0;

  const cx = Math.round(deviceConfig.width / 2);
  const cy = Math.round(deviceConfig.height / 2);
  await page.mouse.move(cx, cy);

  console.log(`  [SCROLL] Running normal scroll...`);
  // 1. Normal scroll
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(50);
  }
  console.log(`  [SCROLL] Running rapid fling scroll...`);
  // 2. Rapid fling scroll
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(40);
  }
  console.log(`  [SCROLL] Running direction reversal...`);
  // 3. Direction reversal
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, -600);
    await page.waitForTimeout(40);
  }

  // Settle & sample viewport visibility
  await page.waitForTimeout(500);

  const isBlank = await page.evaluate((coords: { cx: number; cy: number }) => {
    const centerEl = document.elementFromPoint(coords.cx, coords.cy);
    if (!centerEl) return true;
    const text = (document.body.textContent || '').trim();
    return text.length === 0;
  }, { cx, cy });
  if (isBlank) blankScreens++;

  // Extract recorded metrics
  const stats = await page.evaluate(() => {
    const detector = (window as any).__auditDetector || { frameGaps: [], longTasks: [], cumulativeLayoutShift: 0 };
    const gaps: number[] = (detector.frameGaps || []).sort((a: number, b: number) => a - b);
    const p95 = gaps.length ? gaps[Math.floor(gaps.length * 0.95)] : 16.7;
    const maxGap = gaps.length ? gaps[gaps.length - 1] : 16.7;
    const jank = gaps.filter(g => g > 50).length;

    const longTasks = detector.longTasks || [];
    const longTaskDuration = longTasks.reduce((acc: number, t: any) => acc + t.duration, 0);

    return {
      domNodes: document.querySelectorAll('*').length,
      imagesCount: document.querySelectorAll('img').length,
      longTasks: longTasks.length,
      longTaskDuration: Math.round(longTaskDuration),
      jankFrames: jank,
      p95FrameGap: Math.round(p95 * 10) / 10,
      maxFrameGap: Math.round(maxGap * 10) / 10,
      cls: Math.round(detector.cumulativeLayoutShift * 10000) / 10000,
    };
  });

  await context.close();

  const passed = blankScreens === 0 && stats.p95FrameGap <= 33.4 && stats.cls <= 0.25;
  console.log(`  [METRICS] ${deviceConfig.name}: p95=${stats.p95FrameGap}ms, maxGap=${stats.maxFrameGap}ms, jank=${stats.jankFrames}, CLS=${stats.cls}, blankScreens=${blankScreens}, passed=${passed}`);

  return {
    device: deviceConfig.name,
    initialLoadMs,
    domNodes: stats.domNodes,
    imagesCount: stats.imagesCount,
    longTasks: stats.longTasks,
    longTaskDuration: stats.longTaskDuration,
    jankFrames: stats.jankFrames,
    p95FrameGap: stats.p95FrameGap,
    maxFrameGap: stats.maxFrameGap,
    cls: stats.cls,
    blankScreens,
    passed,
  };
}

export async function runStoreAudit(storeId: string, storeName: string, targetUrl: string): Promise<StoreAuditReport> {
  const launchArgs = { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] };
  let browser: Browser | null = null;
  for (const channel of [undefined, "msedge", "chrome"] as const) {
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
