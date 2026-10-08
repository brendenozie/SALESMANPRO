import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';
const RESULTS_FILE = 'scripts/benchmark_results.json';

function saveResults(data) {
  try {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write results file:', e);
  }
}

async function runBenchmark() {
  const allResults = {
    startedAt: new Date().toISOString(),
    status: 'IN_PROGRESS',
    device: 'Samsung Galaxy A13 (412x915, DPR 2.625)',
    homepage: null,
    productList: null,
    feed: null
  };
  saveResults(allResults);

  console.log('--- STARTING PLAYWRIGHT MOBILE BENCHMARK ---');

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu-shader-disk-cache']
  });

  // Samsung Galaxy A13 specs: 1080x2408 CSS ~412x915, DPR 2.625
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A135F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
  });

  const page = await context.newPage();

  // Test 1: Homepage
  console.log('\n[1/3] Benchmarking Ghuba Homepage (/site/ghuba)...');
  try {
    await page.goto(`${BASE_URL}/site/ghuba`, { waitUntil: 'domcontentloaded', timeout: 180000 });
    await page.waitForTimeout(3000);

    const homeScrollMetrics = await page.evaluate(async () => {
      let blankFrames = 0;
      const totalFrames = 30;
      const scrollStep = 800;

      for (let i = 0; i < totalFrames; i++) {
        window.scrollBy({ top: scrollStep, behavior: 'instant' });
        await new Promise(r => requestAnimationFrame(r));
        if (!document.body.innerText.trim()) {
          blankFrames++;
        }
      }
      return { blankFrames, totalScroll: window.scrollY };
    });

    try {
      await page.screenshot({ path: 'scripts/playwright_home.png', timeout: 5000 });
    } catch (e) {
      console.log('Screenshot font timeout, captured without waiting for fonts');
    }
    allResults.homepage = {
      status: 'PASSED',
      totalScrolledPx: homeScrollMetrics.totalScroll,
      blankFrames: homeScrollMetrics.blankFrames,
      screenshot: 'scripts/playwright_home.png'
    };
    saveResults(allResults);
    console.log('Homepage benchmark complete:', allResults.homepage);
  } catch (err) {
    allResults.homepage = { status: 'FAILED', error: err.message };
    saveResults(allResults);
    console.error('Homepage benchmark failed:', err.message);
  }

  // Test 2: Product List
  console.log('\n[2/3] Benchmarking Ghuba Product List (/ghuba/productlist)...');
  try {
    await page.goto(`${BASE_URL}/ghuba/productlist`, { waitUntil: 'domcontentloaded', timeout: 180000 });
    // Wait specifically for product cards to render inside VirtualizedGrid
    await page.waitForSelector('.perf-card-contain', { timeout: 90000 });
    await page.waitForTimeout(1000);

    const productListMetrics = await page.evaluate(async () => {
      const results = [];
      for (let fling = 0; fling < 10; fling++) {
        window.scrollBy({ top: 1200, behavior: 'instant' });
        await new Promise(r => requestAnimationFrame(r));
        
        const cards = document.querySelectorAll('.perf-card-contain, [data-index]');
        let visibleCards = 0;
        let skeletonCards = 0;
        const vh = window.innerHeight;
        
        cards.forEach(c => {
          const rect = c.getBoundingClientRect();
          if (rect.top < vh && rect.bottom > 0) {
            if (c.querySelector('.animate-pulse') || c.classList.contains('animate-pulse')) {
              skeletonCards++;
            } else {
              visibleCards++;
            }
          }
        });

        results.push({
          fling,
          scrollY: window.scrollY,
          visibleCards,
          skeletonCards,
          isCompletelyBlank: (visibleCards === 0 && skeletonCards === 0)
        });
        await new Promise(r => setTimeout(r, 150));
      }
      return results;
    });

    const blankFlings = productListMetrics.filter(m => m.isCompletelyBlank).length;
    await page.screenshot({ path: 'scripts/playwright_productlist.png' });
    allResults.productList = {
      status: 'PASSED',
      totalFlings: productListMetrics.length,
      blankViewports: blankFlings,
      flingsDetail: productListMetrics,
      screenshot: 'scripts/playwright_productlist.png'
    };
    saveResults(allResults);
    console.log('Product list benchmark complete:', allResults.productList);
  } catch (err) {
    allResults.productList = { status: 'FAILED', error: err.message };
    saveResults(allResults);
    console.error('Product list benchmark failed:', err.message);
  }

  // Test 3: Ghuba Feed
  console.log('\n[3/3] Benchmarking Ghuba Feed (/ghuba/feed)...');
  try {
    await page.goto(`${BASE_URL}/ghuba/feed`, { waitUntil: 'domcontentloaded', timeout: 180000 });
    await page.waitForSelector('[data-index="0"]', { timeout: 30000 });
    await page.waitForTimeout(2000);

    const feedMetrics = [];
    for (let slide = 0; slide < 5; slide++) {
      if (slide > 0) {
        await page.evaluate((s) => {
          const target = document.querySelector(`[data-index="${s}"]`);
          if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
        }, slide);
        await page.waitForTimeout(500);
      }

      const slideInfo = await page.evaluate((s) => {
        const currentSlideDiv = document.querySelector(`[data-index="${s}"]`);
        const isPlaceholder = currentSlideDiv ? Boolean(currentSlideDiv.querySelector('.bg-neutral-950')) : true;
        const img = currentSlideDiv ? currentSlideDiv.querySelector('img') : null;
        const isImgLoaded = img ? (img.complete && img.naturalWidth > 0) : false;
        const hasImageSrc = img ? Boolean(img.src) : false;

        return {
          slide: s,
          isPlaceholder,
          hasImageSrc,
          isImgLoaded
        };
      }, slide);

      feedMetrics.push(slideInfo);
    }

    await page.screenshot({ path: 'scripts/playwright_feed.png' });
    allResults.feed = {
      status: 'PASSED',
      slides: feedMetrics,
      screenshot: 'scripts/playwright_feed.png'
    };
    saveResults(allResults);
    console.log('Feed benchmark complete:', allResults.feed);
  } catch (err) {
    allResults.feed = { status: 'FAILED', error: err.message };
    saveResults(allResults);
    console.error('Feed benchmark failed:', err.message);
  }

  allResults.status = 'COMPLETED';
  allResults.completedAt = new Date().toISOString();
  saveResults(allResults);

  await browser.close();
  console.log('\n--- PLAYWRIGHT BENCHMARK COMPLETE ---');
}

runBenchmark().catch(err => {
  console.error('Benchmark fatal error:', err);
  saveResults({ status: 'FATAL_ERROR', error: err.message });
  process.exit(1);
});
