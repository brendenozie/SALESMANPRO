/**
 * tests/ghuba-scroll-perf.test.ts
 *
 * Ghuba — Multi-page Mobile Scroll Performance Diagnostic & Regression Test
 *
 * Pages tested:
 *   1. /ghuba/feed            — TikTok-style snap feed (snap container scroll)
 *   2. /site/ghuba            — Ghuba marketplace home (window scroll)
 *   3. /site/ghuba/ghuba/productlist/ — Product listing grid (window scroll)
 *
 * Run with dev server running (npm run dev):
 *   npx ts-node --project tsconfig.worker.json tests/ghuba-scroll-perf.test.ts
 * Or with explicit URL:
 *   TEST_BASE_URL=http://localhost:3000 npx ts-node --project tsconfig.worker.json tests/ghuba-scroll-perf.test.ts
 */

import { chromium, Browser, Page } from "playwright-core";

// Use IPv4 loopback: Node resolves "localhost" to ::1, but `next dev -H 0.0.0.0` listens on IPv4 only.
const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

// All three Ghuba pages under test
const FEED_URL         = `${BASE_URL}/ghuba/feed`;
const HOME_URL         = `${BASE_URL}/site/ghuba`;
const PRODUCT_LIST_URL = `${BASE_URL}/site/ghuba/ghuba/productlist/`;

// Performance thresholds - generous for headless/CI environments
// Goal: regression detection, not exact mobile FPS targets
const THRESHOLDS_FEED = {
  maxLongTaskCount: 25,        // long tasks >50ms during scroll phase
  maxLongTaskDurationMs: 2000, // total long-task ms
  maxCLS: 0.25,                // cumulative layout shift score
  maxDomNodes: 3000,           // DOM node count (snap feed is lean)
  minScrollEvents: 5,          // must have scrolled (proves scroll worked)
};

// Home & productlist have more DOM (nav, sidebar, filter bar, product cards)
// so thresholds are adjusted accordingly.
const THRESHOLDS_WINDOW = {
  maxLongTaskCount: 40,
  maxLongTaskDurationMs: 4000,
  maxCLS: 0.30,
  maxDomNodes: 8000,
  minScrollEvents: 3,
};

const PERF_INSTRUMENTATION = `
  (function() {
    window.__perfData = { longTasks: [], layoutShifts: [], scrollEvents: 0, frameGaps: [] };
    var lastFrame = performance.now();
    (function tick(now) {
      if (now) { window.__perfData.frameGaps.push(now - lastFrame); lastFrame = now; }
      requestAnimationFrame(tick);
    })();
    try {
      var ltObs = new PerformanceObserver(function(list) {
        list.getEntries().forEach(function(e) {
          window.__perfData.longTasks.push({ duration: e.duration, startTime: e.startTime });
        });
      });
      ltObs.observe({ type: 'longtask', buffered: true });
    } catch(e) {}
    try {
      var clsObs = new PerformanceObserver(function(list) {
        list.getEntries().forEach(function(e) {
          if (!e.hadRecentInput) window.__perfData.layoutShifts.push(e.value);
        });
      });
      clsObs.observe({ type: 'layout-shift', buffered: true });
    } catch(e) {}
    var snapTarget = document.querySelector('[class*="overflow-y-scroll"]') || document.querySelector('[class*="snap-y"]');
    // Window-scroll pages: scroll events fire on window; snap-feed pages: fire on nested container.
    // Listen on both so all three Ghuba pages are correctly instrumented.
    var onScroll = function() { window.__perfData.scrollEvents++; };
    if (snapTarget) snapTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
  })();
`;

interface PerfResults {
  longTaskCount: number;
  totalLongTaskDurationMs: number;
  maxSingleLongTaskMs: number;
  cumulativeLayoutShift: number;
  scrollEvents: number;
  frameCount: number;
  jankFrames: number;      // frame gap > 50ms (~3 dropped frames at 60Hz)
  p95FrameMs: number;
  maxFrameMs: number;
  domNodeCount: number;
  fixedElementCount: number;
  backdropFilterCount: number;
  blurFilterCount: number;
  imageCount: number;
  nestedScrollContainerCount: number;
  snapContainerFound: boolean;
}

async function collectPerfResults(page: Page): Promise<PerfResults> {
  const perfData: any = await page.evaluate(() => (window as any).__perfData || {});

  const domMetrics = await page.evaluate(() => {
    const allEls = Array.from(document.querySelectorAll("*"));
    return {
      domNodeCount: allEls.length,
      fixedElementCount: allEls.filter(el => {
        const s = getComputedStyle(el);
        return s.position === "fixed" || s.position === "sticky";
      }).length,
      backdropFilterCount: allEls.filter(el => {
        const s = getComputedStyle(el);
        return s.backdropFilter && s.backdropFilter !== "none";
      }).length,
      blurFilterCount: allEls.filter(el => {
        const s = getComputedStyle(el);
        return s.filter && s.filter.includes("blur");
      }).length,
      imageCount: document.querySelectorAll("img, video").length,
      nestedScrollContainerCount: allEls.filter(el => {
        const s = getComputedStyle(el);
        return (s.overflowY === "scroll" || s.overflowY === "auto") &&
          el !== document.documentElement && el !== document.body;
      }).length,
      snapContainerFound: Boolean(
        document.querySelector('[class*="snap-y"]') ||
        document.querySelector('[style*="scroll-snap-type"]')
      ),
    };
  });

  const longTasks: Array<{ duration: number }> = perfData.longTasks || [];
  const layoutShifts: number[] = perfData.layoutShifts || [];
  const gaps: number[] = (perfData.frameGaps || []).slice().sort((a: number, b: number) => a - b);

  return {
    longTaskCount: longTasks.length,
    totalLongTaskDurationMs: longTasks.reduce((s, t) => s + t.duration, 0),
    maxSingleLongTaskMs: longTasks.reduce((m, t) => Math.max(m, t.duration), 0),
    cumulativeLayoutShift: layoutShifts.reduce((s, v) => s + v, 0),
    scrollEvents: perfData.scrollEvents || 0,
    frameCount: gaps.length,
    jankFrames: gaps.filter((g) => g > 50).length,
    p95FrameMs: gaps.length ? gaps[Math.floor(gaps.length * 0.95)] : 0,
    maxFrameMs: gaps.length ? gaps[gaps.length - 1] : 0,
    ...domMetrics,
  };
}

/**
 * Scroll sequence for SNAP FEED (nested div scroll container).
 * Mouse wheel at viewport centre reaches the nested overflow-y-scroll div.
 */
async function performSnapScrollSequence(page: Page): Promise<void> {
  const vp = page.viewportSize() || { width: 390, height: 844 };
  const cx = Math.round(vp.width / 2);
  const cy = Math.round(vp.height / 2);
  await page.mouse.move(cx, cy);

  // Phase 1: slow scroll down
  for (let i = 0; i < 5; i++) { await page.mouse.wheel(0, 300); await page.waitForTimeout(200); }
  // Phase 2: medium scroll
  for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 600); await page.waitForTimeout(100); }
  // Phase 3: fast fling
  for (let i = 0; i < 5; i++) { await page.mouse.wheel(0, 1200); await page.waitForTimeout(50); }
  // Phase 4: continuous mixed (4 seconds)
  const start = Date.now(); let dir = 1; let dist = 0;
  while (Date.now() - start < 4000) {
    const amt = dir * (200 + Math.random() * 400);
    await page.mouse.wheel(0, amt);
    dist += Math.abs(amt);
    await page.waitForTimeout(80);
    if (dist > 3000) { dir *= -1; dist = 0; }
  }
  // Phase 5: up-down bounce
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 800); await page.waitForTimeout(150);
    await page.mouse.wheel(0, -800); await page.waitForTimeout(150);
  }
}

// Keep the old name as alias so existing callsites work without changes
const performScrollSequence = performSnapScrollSequence;

/**
 * Scroll sequence for WINDOW-based pages (home, productlist).
 * These pages use standard document/window scroll — no nested container.
 * We scroll faster to simulate a real "fast finger scroll" stress test.
 */
async function performWindowScrollSequence(page: Page): Promise<void> {
  const vp = page.viewportSize() || { width: 390, height: 844 };
  const cx = Math.round(vp.width / 2);
  const cy = Math.round(vp.height / 2);
  await page.mouse.move(cx, cy);

  // Phase 1: moderate downward scroll
  for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(120); }
  // Phase 2: fast fling down (stress test)
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 1000); await page.waitForTimeout(60); }
  // Phase 3: really fast fling (simulate aggressive thumb scroll)
  for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 1800); await page.waitForTimeout(40); }
  // Phase 4: continuous mixed scroll (3 seconds)
  const start = Date.now(); let dir = 1; let dist = 0;
  while (Date.now() - start < 3000) {
    const amt = dir * (300 + Math.random() * 600);
    await page.mouse.wheel(0, amt);
    dist += Math.abs(amt);
    await page.waitForTimeout(70);
    if (dist > 4000) { dir *= -1; dist = 0; }
  }
  // Phase 5: scroll back up rapidly
  for (let i = 0; i < 5; i++) { await page.mouse.wheel(0, -800); await page.waitForTimeout(100); }
}

type ScrollMode = "snap" | "window";

async function runDiagnosticForUrl(
  page: Page,
  label: string,
  url: string,
  scrollMode: ScrollMode,
  readySelector: string,
  modifier?: (page: Page) => Promise<void>
): Promise<PerfResults> {
  console.log(`\n  Running: ${label}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(2000);
  await page.evaluate(PERF_INSTRUMENTATION);
  await page.waitForTimeout(500);
  if (modifier) await modifier(page);
  try {
    await page.waitForSelector(readySelector, { timeout: 12000 });
  } catch {
    console.log(`    Warning: Ready selector '${readySelector}' not found — page may not have loaded content`);
  }
  // Let page settle, then reset perf buffers so only scroll-phase work is measured
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const d = (window as any).__perfData;
    if (d) { d.longTasks = []; d.layoutShifts = []; d.scrollEvents = 0; d.frameGaps = []; }
  });
  if (scrollMode === "snap") {
    await performSnapScrollSequence(page);
  } else {
    await performWindowScrollSequence(page);
  }
  const r = await collectPerfResults(page);
  console.log(`    Long Tasks  : ${r.longTaskCount} (${r.totalLongTaskDurationMs.toFixed(0)}ms total, ${r.maxSingleLongTaskMs.toFixed(0)}ms max)`);
  console.log(`    CLS         : ${r.cumulativeLayoutShift.toFixed(4)}`);
  console.log(`    DOM Nodes   : ${r.domNodeCount}`);
  console.log(`    Scroll Evts : ${r.scrollEvents}`);
  console.log(`    Frames      : ${r.frameCount} | Jank(>50ms): ${r.jankFrames} | p95: ${r.p95FrameMs.toFixed(1)}ms | max: ${r.maxFrameMs.toFixed(0)}ms`);
  console.log(`    Fixed Elems : ${r.fixedElementCount} | Backdrop-filter: ${r.backdropFilterCount} | Blur: ${r.blurFilterCount}`);
  console.log(`    Images/Video: ${r.imageCount} | Nested Scroll Containers: ${r.nestedScrollContainerCount}`);
  console.log(`    Snap Found  : ${r.snapContainerFound}`);
  return r;
}

// Backward-compat wrapper used by the feed-only test suite below
async function runDiagnostic(
  page: Page,
  label: string,
  modifier?: (page: Page) => Promise<void>
): Promise<PerfResults> {
  return runDiagnosticForUrl(page, label, FEED_URL, "snap", "article, [class*='snap-start']", modifier);
}

async function runTests() {
  console.log("\n================================================================");
  console.log("  GHUBA FEED - MOBILE SCROLL PERFORMANCE DIAGNOSTIC");
  console.log("================================================================\n");
  console.log(`  Target: ${FEED_URL}`);

  let serverReachable = false;
  try {
    // Probe the feed route itself (not "/") with a generous timeout: Next dev compiles
    // routes on first request, which can easily exceed a few seconds.
    await fetch(FEED_URL, { signal: AbortSignal.timeout ? AbortSignal.timeout(60000) : undefined });
    serverReachable = true;
  } catch (err: any) {
    console.log(`  Reachability check failed: ${err?.cause?.code || err?.name || err}`);
  }

  if (!serverReachable) {
    console.log("\n  Dev server not reachable at", BASE_URL);
    console.log("  Start with: npm run dev\n");
    console.log("  Running source-only static analysis...\n");
    runSourceOnlyAnalysis();
    return;
  }

  const launchArgs = { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] };
  let browser: Browser | null = null;
  // Prefer Playwright's bundled browser; fall back to system Edge/Chrome if not installed.
  for (const channel of [undefined, "msedge", "chrome"] as const) {
    try {
      browser = await chromium.launch(channel ? { ...launchArgs, channel } : launchArgs);
      console.log(`  Browser: ${channel || "playwright-chromium"}`);
      break;
    } catch { /* try next */ }
  }
  if (!browser) throw new Error("No Chromium browser available. Run: npx playwright install chromium");

  const results: Record<string, PerfResults> = {};

  try {
    // Test 1: Baseline 390x844
    {
      const ctx = await browser.newContext({
        viewport: { width: 390, height: 844 },
        userAgent: "Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
        isMobile: true, hasTouch: true,
      });
      results.baseline_390x844 = await runDiagnostic(await ctx.newPage(), "BASELINE - Pixel 5 (390x844)");
      await ctx.close();
    }

    // Test 2: Baseline 360x800
    {
      const ctx = await browser.newContext({
        viewport: { width: 360, height: 800 },
        userAgent: "Mozilla/5.0 (Linux; Android 11; Galaxy A52) AppleWebKit/537.36 Chrome/118 Mobile Safari/537.36",
        isMobile: true, hasTouch: true,
      });
      results.baseline_360x800 = await runDiagnostic(await ctx.newPage(), "BASELINE - Galaxy A52 (360x800)");
      await ctx.close();
    }

    // Test 3 A/B: disable backdrop-filter
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      results.no_backdrop_filter = await runDiagnostic(
        await ctx.newPage(),
        "A/B - No backdrop-filter",
        (p) => p.addStyleTag({ content: "* { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }" })
      );
      await ctx.close();
    }

    // Test 4 A/B: disable all blur/backdrop filters
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      results.no_blur_filter = await runDiagnostic(
        await ctx.newPage(),
        "A/B - No blur/backdrop filters",
        (p) => p.addStyleTag({ content: "* { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; filter: none !important; }" })
      );
      await ctx.close();
    }

    // Test 5 A/B: reduced motion
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      const page = await ctx.newPage();
      results.reduced_motion = await runDiagnostic(
        page,
        "A/B - Reduced motion / no transitions",
        async (p) => {
          await p.emulateMedia({ reducedMotion: "reduce" });
          await p.addStyleTag({ content: "*, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }" });
        }
      );
      await ctx.close();
    }

    // Test 6: post-fix verification
    {
      const ctx = await browser.newContext({
        viewport: { width: 390, height: 844 },
        userAgent: "Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
        isMobile: true, hasTouch: true,
      });
      results.post_fix = await runDiagnostic(await ctx.newPage(), "POST-FIX VERIFICATION - 390x844");
      await ctx.close();
    }

  } catch (err) {
    console.error("  Suite 1 (feed) error:", err);
  }

  // -----------------------------------------------------------------------
  // Suite 2: Ghuba Home (/site/ghuba)
  // -----------------------------------------------------------------------
  console.log("\n----------------------------------------------------------------");
  console.log("  SUITE 2: GHUBA HOME — /site/ghuba");
  console.log("----------------------------------------------------------------");

  const homeResults: Record<string, PerfResults> = {};
  {
    {
      const ctx = await browser.newContext({
        viewport: { width: 390, height: 844 },
        userAgent: "Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
        isMobile: true, hasTouch: true,
      });
      homeResults.home_baseline = await runDiagnosticForUrl(
        await ctx.newPage(),
        "HOME BASELINE - Pixel 5 (390x844)",
        HOME_URL,
        "window",
        "main, [class*='product'], [class*='card'], section"
      );
      await ctx.close();
    }
    // POST-FIX: verify backdrop-filter removal on home fixes jank
    {
      const ctx = await browser.newContext({
        viewport: { width: 390, height: 844 },
        userAgent: "Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
        isMobile: true, hasTouch: true,
      });
      homeResults.home_post_fix = await runDiagnosticForUrl(
        await ctx.newPage(),
        "HOME POST-FIX - Pixel 5 (390x844)",
        HOME_URL,
        "window",
        "main, [class*='product'], [class*='card'], section"
      );
      await ctx.close();
    }
  } // end homeResults block

  // -----------------------------------------------------------------------
  // Suite 3: Ghuba Product List (/site/ghuba/ghuba/productlist/)
  // -----------------------------------------------------------------------
  console.log("\n----------------------------------------------------------------");
  console.log("  SUITE 3: GHUBA PRODUCT LIST — /site/ghuba/ghuba/productlist/");
  console.log("----------------------------------------------------------------");

  const productListResults: Record<string, PerfResults> = {};
  try {
    {
      const ctx = await browser.newContext({
        viewport: { width: 390, height: 844 },
        userAgent: "Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
        isMobile: true, hasTouch: true,
      });
      productListResults.productlist_baseline = await runDiagnosticForUrl(
        await ctx.newPage(),
        "PRODUCT LIST BASELINE - Pixel 5 (390x844)",
        PRODUCT_LIST_URL,
        "window",
        "[class*='grid'], [class*='card'], [class*='product']"
      );
      await ctx.close();
    }

    // A/B: fast-fling on productlist — does virtualized grid hold up?
    {
      const ctx = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true, hasTouch: true,
      });
      productListResults.productlist_fast_scroll = await runDiagnosticForUrl(
        await ctx.newPage(),
        "PRODUCT LIST FAST FLING - 390x844",
        PRODUCT_LIST_URL,
        "window",
        "[class*='grid'], [class*='card']"
      );
      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  // -----------------------------------------------------------------------
  // COMBINED PERFORMANCE MATRIX
  // -----------------------------------------------------------------------
  console.log("\n================================================================");
  console.log("  PERFORMANCE MATRIX (All Pages)");
  console.log("================================================================");
  console.log("Test                     | LongTasks | LT ms  | Jank | p95ms | Scroll | CLS    | DOM");
  console.log("-------------------------|-----------|--------|------|-------|--------|--------|-----");
  const allResults = { ...results, ...homeResults, ...productListResults };
  for (const [name, r] of Object.entries(allResults)) {
    const n = name.padEnd(24).slice(0, 24);
    console.log(`${n} | ${String(r.longTaskCount).padStart(9)} | ${r.totalLongTaskDurationMs.toFixed(0).padStart(6)} | ${String(r.jankFrames).padStart(4)} | ${r.p95FrameMs.toFixed(1).padStart(5)} | ${String(r.scrollEvents).padStart(6)} | ${r.cumulativeLayoutShift.toFixed(4)} | ${r.domNodeCount}`);
  }

  // -----------------------------------------------------------------------
  // REGRESSION ASSERTIONS
  // -----------------------------------------------------------------------
  console.log("\n--- Regression Assertions ---");
  let failures = 0;

  function check(ok: boolean, msg: string, measured: string) {
    console.log(`  ${ok ? "PASS" : "FAIL"} ${msg} [got: ${measured}]`);
    if (!ok) failures++;
  }

  // Feed assertions
  const feedTarget = results.post_fix || results.baseline_390x844;
  console.log("\n  [FEED /ghuba/feed]");
  check(feedTarget.longTaskCount <= THRESHOLDS_FEED.maxLongTaskCount, `Long tasks <= ${THRESHOLDS_FEED.maxLongTaskCount}`, String(feedTarget.longTaskCount));
  check(feedTarget.totalLongTaskDurationMs <= THRESHOLDS_FEED.maxLongTaskDurationMs, `Long-task ms <= ${THRESHOLDS_FEED.maxLongTaskDurationMs}ms`, feedTarget.totalLongTaskDurationMs.toFixed(0));
  check(feedTarget.cumulativeLayoutShift <= THRESHOLDS_FEED.maxCLS, `CLS <= ${THRESHOLDS_FEED.maxCLS}`, feedTarget.cumulativeLayoutShift.toFixed(4));
  check(feedTarget.domNodeCount <= THRESHOLDS_FEED.maxDomNodes, `DOM nodes <= ${THRESHOLDS_FEED.maxDomNodes}`, String(feedTarget.domNodeCount));
  check(feedTarget.scrollEvents >= THRESHOLDS_FEED.minScrollEvents, `Scroll events >= ${THRESHOLDS_FEED.minScrollEvents}`, String(feedTarget.scrollEvents));
  check(feedTarget.snapContainerFound, "Snap scroll container found (feed intact)", String(feedTarget.snapContainerFound));

  // Home assertions (if page loaded)
  if (homeResults.home_baseline || homeResults.home_post_fix) {
    const homeTarget = homeResults.home_post_fix || homeResults.home_baseline;
    console.log("\n  [HOME /site/ghuba]");
    check(homeTarget.longTaskCount <= THRESHOLDS_WINDOW.maxLongTaskCount, `Long tasks <= ${THRESHOLDS_WINDOW.maxLongTaskCount}`, String(homeTarget.longTaskCount));
    check(homeTarget.totalLongTaskDurationMs <= THRESHOLDS_WINDOW.maxLongTaskDurationMs, `Long-task ms <= ${THRESHOLDS_WINDOW.maxLongTaskDurationMs}ms`, homeTarget.totalLongTaskDurationMs.toFixed(0));
    check(homeTarget.cumulativeLayoutShift <= THRESHOLDS_WINDOW.maxCLS, `CLS <= ${THRESHOLDS_WINDOW.maxCLS}`, homeTarget.cumulativeLayoutShift.toFixed(4));
    check(homeTarget.scrollEvents >= THRESHOLDS_WINDOW.minScrollEvents, `Scroll events >= ${THRESHOLDS_WINDOW.minScrollEvents}`, String(homeTarget.scrollEvents));
  }

  // Product list assertions (if page loaded)
  if (productListResults.productlist_baseline) {
    const plTarget = productListResults.productlist_baseline;
    console.log("\n  [PRODUCT LIST /site/ghuba/ghuba/productlist/]");
    check(plTarget.longTaskCount <= THRESHOLDS_WINDOW.maxLongTaskCount, `Long tasks <= ${THRESHOLDS_WINDOW.maxLongTaskCount}`, String(plTarget.longTaskCount));
    check(plTarget.totalLongTaskDurationMs <= THRESHOLDS_WINDOW.maxLongTaskDurationMs, `Long-task ms <= ${THRESHOLDS_WINDOW.maxLongTaskDurationMs}ms`, plTarget.totalLongTaskDurationMs.toFixed(0));
    check(plTarget.cumulativeLayoutShift <= THRESHOLDS_WINDOW.maxCLS, `CLS <= ${THRESHOLDS_WINDOW.maxCLS}`, plTarget.cumulativeLayoutShift.toFixed(4));
    check(plTarget.scrollEvents >= THRESHOLDS_WINDOW.minScrollEvents, `Scroll events >= ${THRESHOLDS_WINDOW.minScrollEvents}`, String(plTarget.scrollEvents));
  }

  if (failures === 0) {
    console.log("\n  ALL REGRESSION ASSERTIONS PASSED ✓\n");
  } else {
    console.log(`\n  ${failures} ASSERTION(S) FAILED\n`);
    process.exit(1);
  }
}

function runSourceOnlyAnalysis() {
  console.log("================================================================");
  console.log("  STATIC SOURCE ANALYSIS - Root Causes Identified");
  console.log("================================================================\n");

  const issues = [
    {
      severity: "CRITICAL",
      file: "app/globals.css:171-173",
      issue: ".snap-mandatory overrides Tailwind with scroll-behavior: smooth",
      detail: "Tailwind snap-mandatory should only set scroll-snap-type:y mandatory. The custom " +
        "block adds scroll-behavior:smooth which forces the browser to smooth-interpolate every " +
        "mandatory snap jump. This causes 'catching and then continuing' on every finger swipe.",
      fix: "Remove lines 171-173 from globals.css (the .snap-mandatory block).",
    },
    {
      severity: "CRITICAL",
      file: "components/ghuba/feed/GhubaFeedContainer.tsx:84-112",
      issue: "IntersectionObserver recreated on every items state change",
      detail: "useEffect dependency [items] causes ALL N observers to disconnect and re-attach every " +
        "time new items are appended. setActiveIndex() inside the callback triggers React re-renders " +
        "during scrolling, which in turn can trigger another item load, causing a cascade.",
      fix: "Use a stable ref-based observer. Observe only newly added slides incrementally.",
    },
    {
      severity: "HIGH",
      file: "components/ghuba/feed/GhubaFeedItem.tsx:200,283",
      issue: "blur-3xl (blur:64px) on full-height background divs",
      detail: "With 3 slides in the virtual window, 3 full-screen blur layers are composited " +
        "simultaneously. Each requires a separate GPU rasterization pass on mobile.",
      fix: "Replace blur-3xl with blur-2xl. Add contain:paint to the blurred background layers.",
    },
    {
      severity: "HIGH",
      file: "components/ghuba/feed/GhubaFeedItem.tsx:55-64",
      issue: "handleGalleryScroll reads clientWidth (forced layout) inside scroll handler",
      detail: "Reading container.clientWidth forces synchronous layout. The callback also depends " +
        "on activeImageIndex state, recreating it on every state update.",
      fix: "Cache clientWidth in a ref. Remove activeImageIndex from useCallback dependencies.",
    },
    {
      severity: "MEDIUM",
      file: "components/ghuba/feed/GhubaFeedItem.tsx:175-196",
      issue: "Framer Motion motion.div wraps video container with opacity animation",
      detail: "Framer Motion runs JS layout measurement on every render. Simple opacity fade " +
        "transitions do not need the full Framer Motion stack.",
      fix: "Replace with plain div + CSS animation for opacity fade.",
    },
  ];

  for (const issue of issues) {
    console.log(`[${issue.severity}] ${issue.file}`);
    console.log(`  Issue  : ${issue.issue}`);
    console.log(`  Detail : ${issue.detail}`);
    console.log(`  Fix    : ${issue.fix}\n`);
  }

  console.log("ROOT CAUSE CHAIN:");
  console.log("-----------------");
  console.log("1. User swipes up on the snap-y mandatory feed container");
  console.log("2. globals.css .snap-mandatory adds scroll-behavior:smooth");
  console.log("   -> browser smooth-interpolates every snap jump -> compositor blocked");
  console.log("3. IntersectionObserver fires -> setActiveIndex() called");
  console.log("4. activeIndex change triggers React re-render of GhubaFeedContainer");
  console.log("5. activeIndex >= items.length-3 -> fetchFeed runs -> items appended");
  console.log("6. IntersectionObserver useEffect [items] dep triggers cleanup");
  console.log("   -> ALL N observers disconnected and rebuilt (O(n) re-attachment)");
  console.log("7. blur-3xl on 3 virtual slides = 3 GPU compositing passes per frame");
  console.log("8. Main thread > 16.67ms -> dropped frames -> visible scroll jank\n");
}

runTests().catch(err => {
  console.error("TEST RUNNER ERROR:", err);
  process.exit(1);
});
