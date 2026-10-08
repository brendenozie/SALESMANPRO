import { chromium } from "playwright-core";

const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const PRODUCT_LIST_URL = `${BASE_URL}/site/ghuba/ghuba/productlist`;

async function inspectProductList() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox"]
  });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text().slice(0, 100)));
  page.on('response', res => {
    if (res.url().includes('/api/search')) {
      console.log(`[API RESPONSE] /api/search -> ${res.status()}`);
    }
  });

  console.log("Navigating to:", PRODUCT_LIST_URL);
  await page.goto(PRODUCT_LIST_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector('[class*="perf-card-contain"], [class*="GhubaProductCard"]', { timeout: 60000 }).catch(e => console.log("Timeout waiting for cards:", e.message));
  await page.waitForTimeout(2000);

  // Check state before scrolling
  const initial = await page.evaluate(() => {
    const parent = document.querySelector('[style*="height:"][style*="px"].relative.w-full') as HTMLElement;
    const cards = document.querySelectorAll('.perf-card-contain, [class*="GhubaProductCard"]');
    const items = document.querySelectorAll('[data-index]');
    return {
      scrollY: window.scrollY,
      docHeight: document.documentElement.scrollHeight,
      parentHeight: parent ? parent.style.height : 'null',
      offsetTop: parent ? parent.offsetTop : 'null',
      cardsInDom: cards.length,
      dataIndexInDom: items.length,
      indices: Array.from(items).map(i => i.getAttribute('data-index')),
      transforms: Array.from(items).map(i => (i as HTMLElement).style.transform),
    };
  });
  console.log("Initial state:", JSON.stringify(initial, null, 2));

  // Now perform a series of fast scrolls down and check state after each scroll
  for (let step = 1; step <= 8; step++) {
    // Large fling
    await page.mouse.wheel(0, 1200);
    // Wait only 40ms to inspect mid-flight/immediate state
    await page.waitForTimeout(50);

    const midFlight = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[data-index]')) as HTMLElement[];
      const visibleItems = items.filter(el => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight;
      });
      const centerEl = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);

      return {
        scrollY: window.scrollY,
        itemsInDom: items.length,
        visibleItemsCount: visibleItems.length,
        visibleIndices: visibleItems.map(i => i.getAttribute('data-index')),
        allIndices: items.map(i => i.getAttribute('data-index')),
        centerElTag: centerEl?.tagName,
        centerElClass: centerEl?.className?.slice(0, 50),
        centerElText: centerEl?.textContent?.slice(0, 60),
      };
    });

    console.log(`Step ${step} (immediate after fling):`, JSON.stringify(midFlight));

    // Capture screenshot if visible items is 0
    if (midFlight.visibleItemsCount === 0) {
      console.log(`🚨 ZERO VISIBLE ITEMS AT scrollY=${midFlight.scrollY}!`);
      await page.screenshot({ path: `scratch/blank-screen-diagnostics/productlist_zero_items_step_${step}_y${midFlight.scrollY}.png` });
    }

    await page.waitForTimeout(100);
  }

  await browser.close();
}

inspectProductList().catch(console.error);
