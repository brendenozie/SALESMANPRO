/**
 * tests/ghuba-blank-screen-reproduce.ts
 *
 * Dedicated Playwright Diagnostic for Ghuba Mobile Scroll Blank/White Screen Failure
 * Reproduces, detects, and isolates why the screen becomes blank during scrolling
 * on Ghuba Home (/site/ghuba) and Product List (/site/ghuba/ghuba/productlist).
 */

import { chromium, Browser, Page, BrowserContext } from "playwright-core";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const HOME_URL = `${BASE_URL}/site/ghuba`;
const PRODUCT_LIST_URL = `${BASE_URL}/site/ghuba/ghuba/productlist`;

const ARTIFACTS_DIR = path.resolve(__dirname, "../scratch/blank-screen-diagnostics");
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

interface BlankEvent {
  id: string;
  page: string;
  testCase: string;
  timestamp: number;
  durationMs: number;
  scrollY: number;
  scrollHeight: number;
  clientHeight: number;
  viewport: { width: number; height: number };
  domNodeCount: number;
  productCardCount: number;
  visibleProductCardCount: number;
  imageCount: number;
  loadedImageCount: number;
  centralElement: {
    tagName: string;
    id: string;
    className: string;
    rect: { top: number; left: number; width: number; height: number };
    textContent: string;
  } | null;
  virtualizerState?: {
    totalSize: number;
    renderedItemCount: number;
    firstRenderedIndex: number | null;
    lastRenderedIndex: number | null;
    virtualRowTransforms: number[];
  };
  networkRequestsActive: string[];
  recentLongTasks: Array<{ duration: number; startTime: number }>;
  screenshotFile: string;
  isAllWhitePixels?: boolean;
}

const IN_PAGE_OBSERVER_SCRIPT = `
(function() {
  window.__blankDetector = {
    longTasks: [],
    frameGaps: [],
    networkRequests: new Set(),
    domMutations: { added: 0, removed: 0 },
    lastFrameTime: performance.now(),
  };

  // Performance frame gap tracker
  (function tick(now) {
    if (now && window.__blankDetector.lastFrameTime) {
      window.__blankDetector.frameGaps.push({
        gap: now - window.__blankDetector.lastFrameTime,
        time: now,
        scrollY: window.scrollY
      });
    }
    window.__blankDetector.lastFrameTime = now;
    requestAnimationFrame(tick);
  })();

  // Long task observer
  try {
    var lt = new PerformanceObserver(function(list) {
      list.getEntries().forEach(function(e) {
        window.__blankDetector.longTasks.push({ duration: e.duration, startTime: e.startTime, scrollY: window.scrollY });
      });
    });
    lt.observe({ type: 'longtask', buffered: true });
  } catch(e) {}

  // Mutation observer to track DOM removal
  try {
    var mo = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        window.__blankDetector.domMutations.added += m.addedNodes.length;
        window.__blankDetector.domMutations.removed += m.removedNodes.length;
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch(e) {}
})();
`;

async function sampleViewportState(page: Page) {
  return await page.evaluate(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = Math.round(w / 2);
    const cy = Math.round(h / 2);

    const centerEl = document.elementFromPoint(cx, cy);
    const centerInfo = centerEl ? {
      tagName: centerEl.tagName,
      id: centerEl.id || '',
      className: (centerEl.className && typeof centerEl.className === 'string') ? centerEl.className.slice(0, 100) : '',
      rect: centerEl.getBoundingClientRect(),
      textContent: (centerEl.textContent || '').trim().slice(0, 100),
    } : null;

    // Detect all product cards in DOM
    const allCards = Array.from(document.querySelectorAll(
      '[class*="perf-card-contain"], [class*="GhubaProductCard"], [data-editor-component*="Product"], .group.h-full'
    ));

    const visibleCards = allCards.filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < h && rect.right > 0 && rect.left < w;
    });

    // Detect skeleton cards (while loading next page)
    const allSkeletons = Array.from(document.querySelectorAll(
      '[class*="animate-pulse"], [class*="SkeletonGrid"]'
    ));
    const visibleSkeletons = allSkeletons.filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < h && rect.right > 0 && rect.left < w;
    });

    // Check if footer / site information is in view
    const isFooter = Boolean(
      centerEl?.closest('footer, [id*="footer"], [class*="footer"]') ||
      centerEl?.textContent?.includes("Global Headquarters") ||
      centerEl?.textContent?.includes("All rights reserved") ||
      centerEl?.textContent?.includes("Primary Hub")
    );

    // Detect all images
    const allImgs = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
    const loadedImgs = allImgs.filter(img => img.complete && img.naturalWidth > 0);

    // Detect TanStack Virtualizer containers
    const virtualContainer = document.querySelector('[style*="height:"][style*="px"].relative.w-full') as HTMLElement;
    let virtualizerState: any = null;
    if (virtualContainer) {
      const virtualRows = Array.from(virtualContainer.querySelectorAll('[data-index]')) as HTMLElement[];
      const indices = virtualRows.map(r => parseInt(r.getAttribute('data-index') || '-1', 10)).filter(i => i >= 0);
      const transforms = virtualRows.map(r => {
        const t = r.style.transform || '';
        const match = t.match(/translateY\((-?\d+(\.\d+)?)px\)/);
        return match ? parseFloat(match[1]) : 0;
      });

      virtualizerState = {
        totalSize: parseFloat(virtualContainer.style.height || '0'),
        renderedItemCount: virtualRows.length,
        firstRenderedIndex: indices.length ? Math.min(...indices) : null,
        lastRenderedIndex: indices.length ? Math.max(...indices) : null,
        virtualRowTransforms: transforms.slice(0, 10),
      };
    }

    const detector = (window as any).__blankDetector || { longTasks: [], frameGaps: [], domMutations: {} };

    return {
      timestamp: performance.now(),
      scrollY: window.scrollY,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      viewport: { width: w, height: h },
      domNodeCount: document.querySelectorAll('*').length,
      productCardCount: allCards.length,
      visibleProductCardCount: visibleCards.length,
      visibleSkeletonCount: visibleSkeletons.length,
      isFooter,
      imageCount: allImgs.length,
      loadedImageCount: loadedImgs.length,
      centralElement: centerInfo,
      virtualizerState,
      domMutations: detector.domMutations,
      recentLongTasks: detector.longTasks.slice(-5),
      recentFrameGaps: detector.frameGaps.slice(-10),
    };
  });
}

/**
 * Checks if a screenshot buffer is predominantly white / empty.
 */
function isBufferAllWhite(buffer: Buffer): boolean {
  // A rough estimate: if PNG buffer has extremely low entropy or starts with identical repeating white chunks
  // For precision, we can inspect a set of pixels or check size
  // If PNG size is very small (< 15KB for 390x844), it's almost certainly a uniform flat color (white)
  return buffer.length < 20000;
}

interface TestRunResult {
  pageName: string;
  testCase: string;
  totalDurationMs: number;
  samplesCount: number;
  blankEvents: BlankEvent[];
  maxFrameGapMs: number;
  p95FrameGapMs: number;
  jankFramesCount: number;
  longTasksCount: number;
  maxLongTaskMs: number;
}

async function executeAggressiveScrollWithDetection(
  page: Page,
  pageName: string,
  testCase: string,
  scenario: "fling_down" | "fling_bursts" | "rapid_bounce" | "continuous_stress"
): Promise<TestRunResult> {
  console.log(`\n======================================================`);
  console.log(`  [TEST] ${pageName} - ${testCase} (${scenario})`);
  console.log(`======================================================`);

  // Active network request tracking
  const activeRequests = new Set<string>();
  const requestListener = (req: any) => activeRequests.add(req.url());
  const responseListener = (res: any) => activeRequests.delete(res.url());
  page.on("request", requestListener);
  page.on("response", responseListener);
  page.on("requestfailed", responseListener);

  const blankEvents: BlankEvent[] = [];
  const samples: any[] = [];
  const startTime = Date.now();

  const vp = page.viewportSize() || { width: 390, height: 844 };
  const cx = Math.round(vp.width / 2);
  const cy = Math.round(vp.height / 2);
  await page.mouse.move(cx, cy);

  let isSampling = true;

  // Background sampler running every 100ms
  const samplingPromise = (async () => {
    let sampleIdx = 0;
    while (isSampling) {
      try {
        const state = await sampleViewportState(page);
        sampleIdx++;

        // A potential blank/white failure condition:
        // 1. In product list: scrollY > 400 (inside grid) but visibleProductCardCount === 0!
        // 2. In home: scrollY > 600 but centralElement is HTML/BODY/wrapper with 0 visible cards & no section
        // 3. Central element is null or document root when deep in scroll
        const isDeepInScroll = state.scrollY > 400;
        const hasContent = state.visibleProductCardCount > 0 || state.visibleSkeletonCount > 0 || state.isFooter;
        const isProductListBlank = pageName.includes("productlist") && isDeepInScroll && !hasContent;
        const isHomeBlank = pageName.includes("home") && isDeepInScroll && (state.centralElement?.tagName === "HTML" || state.centralElement?.tagName === "BODY" || (!hasContent && state.centralElement === null));

        if (isProductListBlank || isHomeBlank) {
          const timestamp = Date.now();
          const shotName = `blank_${pageName}_${testCase}_${sampleIdx}_y${Math.round(state.scrollY)}.png`;
          const shotPath = path.join(ARTIFACTS_DIR, shotName);
          const shotBuffer = await page.screenshot({ path: shotPath });
          const isWhite = isBufferAllWhite(shotBuffer);

          const event: BlankEvent = {
            id: `blank_${sampleIdx}`,
            page: pageName,
            testCase,
            timestamp,
            durationMs: 100, // approximate sample resolution
            scrollY: state.scrollY,
            scrollHeight: state.scrollHeight,
            clientHeight: state.clientHeight,
            viewport: state.viewport,
            domNodeCount: state.domNodeCount,
            productCardCount: state.productCardCount,
            visibleProductCardCount: state.visibleProductCardCount,
            imageCount: state.imageCount,
            loadedImageCount: state.loadedImageCount,
            centralElement: state.centralElement,
            virtualizerState: state.virtualizerState,
            networkRequestsActive: Array.from(activeRequests).slice(0, 5),
            recentLongTasks: state.recentLongTasks,
            screenshotFile: shotName,
            isAllWhitePixels: isWhite,
          };

          blankEvents.push(event);
          console.log(`  🚨 [BLANK SCREEN DETECTED] scrollY: ${Math.round(state.scrollY)}px | visibleCards: ${state.visibleProductCardCount} | central: <${state.centralElement?.tagName} class="${state.centralElement?.className?.slice(0,30)}"> | shot: ${shotName} | bufferSize: ${shotBuffer.length} bytes`);
        }

        samples.push(state);
      } catch (err) {
        // page navigating or closed
      }
      await new Promise(r => setTimeout(r, 100));
    }
  })();

  // Execute scroll pattern
  if (scenario === "fling_down") {
    // Progressive fast flings downward
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(100);
    }
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 1500); // aggressive touch fling
      await page.waitForTimeout(60);
    }
    for (let i = 0; i < 4; i++) {
      await page.mouse.wheel(0, 2500); // extreme flick
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(1000);
  } else if (scenario === "fling_bursts") {
    // Repeated fast flings with small pauses
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 2000);
      await page.waitForTimeout(50);
      await page.mouse.wheel(0, 2000);
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(1000);
  } else if (scenario === "rapid_bounce") {
    // Down then immediately up
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 2500);
      await page.waitForTimeout(80);
      await page.mouse.wheel(0, -2000);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(1000);
  } else if (scenario === "continuous_stress") {
    // Long continuous mixed scrolling
    const duration = 6000;
    const start = Date.now();
    let dir = 1;
    let accumulated = 0;
    while (Date.now() - start < duration) {
      const step = dir * (400 + Math.random() * 1200);
      await page.mouse.wheel(0, step);
      accumulated += Math.abs(step);
      if (accumulated > 6000) {
        dir *= -1;
        accumulated = 0;
      }
      await page.waitForTimeout(70);
    }
    await page.waitForTimeout(1000);
  }

  isSampling = false;
  await samplingPromise;

  page.off("request", requestListener);
  page.off("response", responseListener);
  page.off("requestfailed", responseListener);

  // Compute final frame stats from in-page perf detector
  const finalPerf: any = await page.evaluate(() => (window as any).__blankDetector || {});
  const gaps: number[] = (finalPerf.frameGaps || []).map((g: any) => g.gap).sort((a: number, b: number) => a - b);
  const longTasks: any[] = finalPerf.longTasks || [];

  const maxGap = gaps.length ? gaps[gaps.length - 1] : 0;
  const p95Gap = gaps.length ? gaps[Math.floor(gaps.length * 0.95)] : 0;
  const jankFrames = gaps.filter(g => g > 50).length;

  console.log(`  [RESULT] Samples: ${samples.length} | Blank Events: ${blankEvents.length} | Max Gap: ${maxGap.toFixed(0)}ms | p95: ${p95Gap.toFixed(1)}ms | Jank: ${jankFrames} | LongTasks: ${longTasks.length}`);

  return {
    pageName,
    testCase,
    totalDurationMs: Date.now() - startTime,
    samplesCount: samples.length,
    blankEvents,
    maxFrameGapMs: maxGap,
    p95FrameGapMs: p95Gap,
    jankFramesCount: jankFrames,
    longTasksCount: longTasks.length,
    maxLongTaskMs: longTasks.reduce((m: number, t: any) => Math.max(m, t.duration), 0),
  };
}

async function runTestSuite() {
  console.log("================================================================================");
  console.log("  GHUBA SCROLL PERFORMANCE & WHITE/BLANK SCREEN REPRODUCTION DIAGNOSTIC");
  console.log("================================================================================\n");

  const launchArgs = { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] };
  let browser: Browser | null = null;
  for (const channel of [undefined, "msedge", "chrome"] as const) {
    try {
      browser = await chromium.launch(channel ? { ...launchArgs, channel } : launchArgs);
      console.log(`Browser launched: ${channel || "bundled chromium"}`);
      break;
    } catch {}
  }
  if (!browser) throw new Error("Could not launch Chromium");

  const results: TestRunResult[] = [];

  const VIEWPORTS = [
    { name: "Pixel 5 (390x844)", width: 390, height: 844, userAgent: "Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36" },
    { name: "Galaxy A52 (360x800)", width: 360, height: 800, userAgent: "Mozilla/5.0 (Linux; Android 11; SM-A525F) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36" },
  ];

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n--------------------------------------------------------------------------------`);
      console.log(`  DEVICE CONTEXT: ${vp.name}`);
      console.log(`--------------------------------------------------------------------------------`);

      // ------------------------------------------------------------------
      // SUITE A: PRODUCT LIST (/site/ghuba/ghuba/productlist)
      // ------------------------------------------------------------------
      {
        const ctx: BrowserContext = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          userAgent: vp.userAgent,
          isMobile: true,
          hasTouch: true,
        });
        const page = await ctx.newPage();

        // 1. Fast fling on product list
        await page.goto(PRODUCT_LIST_URL, { waitUntil: "domcontentloaded", timeout: 90000 });
        await page.evaluate(IN_PAGE_OBSERVER_SCRIPT);
        await page.click('button:has-text("Accept All"), button:has-text("Accept")').catch(() => {});
        // Wait for product cards to mount
        await page.waitForSelector('[class*="perf-card-contain"], [class*="GhubaProductCard"], .group.h-full', { timeout: 30000 }).catch(() => {});
        await page.waitForTimeout(1000);

        const r1 = await executeAggressiveScrollWithDetection(page, "productlist", `${vp.name}_fling_down`, "fling_down");
        results.push(r1);

        // 2. Repeated fast flings
        const r2 = await executeAggressiveScrollWithDetection(page, "productlist", `${vp.name}_fling_bursts`, "fling_bursts");
        results.push(r2);

        // 3. Rapid bounce up/down
        const r3 = await executeAggressiveScrollWithDetection(page, "productlist", `${vp.name}_rapid_bounce`, "rapid_bounce");
        results.push(r3);

        // 4. Continuous stress
        const r4 = await executeAggressiveScrollWithDetection(page, "productlist", `${vp.name}_continuous_stress`, "continuous_stress");
        results.push(r4);

        await ctx.close();
      }

      // ------------------------------------------------------------------
      // SUITE B: HOME (/site/ghuba)
      // ------------------------------------------------------------------
      {
        const ctx: BrowserContext = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          userAgent: vp.userAgent,
          isMobile: true,
          hasTouch: true,
        });
        const page = await ctx.newPage();

        await page.goto(HOME_URL, { waitUntil: "domcontentloaded", timeout: 90000 });
        await page.evaluate(IN_PAGE_OBSERVER_SCRIPT);
        await page.click('button:has-text("Accept All"), button:has-text("Accept")').catch(() => {});
        await page.waitForTimeout(2000);

        // 1. Home fling down
        const rh1 = await executeAggressiveScrollWithDetection(page, "home", `${vp.name}_fling_down`, "fling_down");
        results.push(rh1);

        // 2. Home fling bursts
        const rh2 = await executeAggressiveScrollWithDetection(page, "home", `${vp.name}_fling_bursts`, "fling_bursts");
        results.push(rh2);

        // 3. Home rapid bounce
        const rh3 = await executeAggressiveScrollWithDetection(page, "home", `${vp.name}_rapid_bounce`, "rapid_bounce");
        results.push(rh3);

        // 4. Home continuous stress
        const rh4 = await executeAggressiveScrollWithDetection(page, "home", `${vp.name}_continuous_stress`, "continuous_stress");
        results.push(rh4);

        await ctx.close();
      }
    }
  } finally {
    await browser.close();
  }

  // Summary Report
  console.log("\n================================================================================");
  console.log("  BLANK SCREEN INVESTIGATION SUMMARY");
  console.log("================================================================================");
  console.log(`| Page | Test Case | Blank Events | Max Frame Gap | p95 Gap | Jank Frames | Long Tasks |`);
  console.log(`|---|---|---:|---:|---:|---:|---:|`);
  for (const r of results) {
    console.log(`| ${r.pageName} | ${r.testCase} | **${r.blankEvents.length}** | ${r.maxFrameGapMs.toFixed(0)}ms | ${r.p95FrameGapMs.toFixed(1)}ms | ${r.jankFramesCount} | ${r.longTasksCount} |`);
  }

  // Save full JSON output
  const reportPath = path.join(ARTIFACTS_DIR, "reproduction_summary.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed report and screenshots saved to: ${ARTIFACTS_DIR}`);
}

runTestSuite().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
