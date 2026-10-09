const https = require('https');

const urls = [
  'https://ghuba.shop/api/search?scope=GHUBA',
  'https://ghuba.shop/store/duka-yangu',
  'https://ghuba.shop/store/shoes-store',
  'https://ghuba.shop/store/agrovet',
  'https://ghuba.shop/cart',
  'https://ghuba.shop/checkout'
];

async function probe(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const duration = (Date.now() - start) / 1000;
        resolve({ url, status: res.statusCode, time: duration.toFixed(3) });
      });
    });
    req.on('error', (err) => {
      resolve({ url, status: 'ERROR', error: err.message });
    });
    req.setTimeout(10000, () => {
      req.abort();
      resolve({ url, status: 'TIMEOUT' });
    });
  });
}

async function main() {
  console.log("=== URL TIMING PROBE ===");
  for (const u of urls) {
    const res = await probe(u);
    console.log(`${res.url.padEnd(45)} -> HTTP ${res.status} (${res.time}s)`);
  }
}

main();
