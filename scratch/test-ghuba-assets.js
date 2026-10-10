// test-ghuba-assets.js
const https = require('https');

https.get("https://ghuba.shop/", (res) => {
  console.log("HOMEPAGE STATUS:", res.statusCode);
  let body = "";
  res.on("data", chunk => { body += chunk; });
  res.on("end", async () => {
    // Extract CSS and JS links
    const assetRegex = /(?:src|href)="(\/_next\/[^"]+)"/g;
    const assets = new Set();
    let m;
    while ((m = assetRegex.exec(body)) !== null) {
      assets.add(m[1]);
    }
    console.log(`Found ${assets.size} Next.js assets to verify:`);
    
    let failCount = 0;
    for (const asset of assets) {
      const assetUrl = `https://ghuba.shop${asset}`;
      const status = await new Promise(resolve => {
        https.get(assetUrl, r => {
          resolve(r.statusCode);
        }).on("error", () => resolve(500));
      });
      if (status === 404) {
        console.error(`404 NOT FOUND: ${assetUrl}`);
        failCount++;
      } else {
        console.log(`✓ [${status}] ${asset}`);
      }
    }
    console.log(`Verification completed: ${assets.size - failCount} OK, ${failCount} 404s.`);
  });
}).on("error", console.error);
