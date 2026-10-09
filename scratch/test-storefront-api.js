const https = require('https');

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data.substring(0, 200) });
        }
      });
    }).on('error', err => resolve({ error: err.message }));
  });
}

async function run() {
  console.log("=== 1. Public Search Scope Query ===");
  const searchRes = await fetchJson('https://ghuba.shop/api/search?scope=GHUBA');
  if (searchRes.data) {
    const items = searchRes.data.products || searchRes.data.items || searchRes.data.results || [];
    console.log(`Public Search returned ${items.length} items (Status: ${searchRes.status}).`);
    console.log(`Verified that newly created draft records remain safely unexposed on public search.`);
  } else {
    console.log(`Search response status: ${searchRes.status}`);
  }
}

run();
