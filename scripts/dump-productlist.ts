import { chromium } from "playwright-core";
import * as fs from "fs";

async function dump() {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  page.on('console', msg => console.log('PAGE CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto("http://127.0.0.1:3000/site/ghuba/ghuba/productlist", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);

  const html = await page.content();
  fs.writeFileSync("scratch/productlist_dump.html", html);
  await page.screenshot({ path: "scratch/productlist_dump.png" });

  const summary = await page.evaluate(() => {
    return {
      bodyText: document.body.innerText.slice(0, 500),
      h1: document.querySelector('h1')?.innerText,
      h2: document.querySelector('h2')?.innerText,
      h3: document.querySelector('h3')?.innerText,
      skeletons: document.querySelectorAll('[class*="animate-pulse"]').length,
      cards: document.querySelectorAll('[class*="card"], [class*="Product"]').length,
    };
  });
  console.log("Summary:", summary);

  await browser.close();
}

dump().catch(console.error);
