const fs = require('fs');
const https = require('https');
const http = require('http');

const data = JSON.parse(fs.readFileSync('scratch/census-parsed.json', 'utf8'));
const visible = data.filter(d => d.group === 'PUBLICLY_VISIBLE');

function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) {
      return resolve({ ok: false, status: 0, error: 'Invalid URL' });
    }
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
    });
    req.on('error', (err) => resolve({ ok: false, status: 0, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 408, error: 'Timeout' }); });
    req.end();
  });
}

async function run() {
  console.log('=== PRIORITY 6: DEEP AUDIT OF THE 18 PUBLICLY VISIBLE LISTINGS ===\n');

  for (let i = 0; i < visible.length; i++) {
    const item = visible[i];
    const imgUrl = item.images[0] || null;
    const imgCheck = imgUrl ? await checkUrl(imgUrl) : { ok: false, status: 0, error: 'No image' };

    // Determine classification
    // Verified offering: Authentic product with known merchant, plausible price, matching image
    // Plausible but unverified: Legitimate store & product, but stock/price or image needs confirmation
    // Incorrect or mismatched: Obvious mismatch (e.g. fashion product with chair image, test product name)
    // Listing requiring merchant confirmation: High value / specific service / potential test item

    let classification = 'Plausible but unverified offering';
    let notes = [];

    // Check image match vs title
    if (imgUrl && imgUrl.includes('modern-wooden-chair') && !item.title.toLowerCase().includes('chair')) {
      classification = 'Incorrect or mismatched listing';
      notes.push('Image depicts a modern wooden chair, but listing title is "' + item.title + '"');
    }

    if (item.title.toLowerCase().includes('sample') || item.title.toLowerCase().includes('test')) {
      classification = 'Incorrect or mismatched listing';
      notes.push('Title indicates sample/test data ("' + item.title + '")');
    }

    if (item.price === 0 || item.price === undefined || item.price === null) {
      notes.push('Price is 0 or undefined');
    }

    if (item.companyName === 'Duka Yangu') {
      notes.push('Store is primary demo/seed store Duka Yangu');
    }

    if (item.title === 'Tronic 1.5mm Electrical cable') {
      if (item.brand === 'Asus') {
        notes.push('Brand mismatch: Electrical cable has brand set to Asus');
        classification = 'Incorrect or mismatched listing';
      }
    }

    if (item.title.includes('Stepping Out') || item.title.includes('Executive')) {
      notes.push('Educational / coaching service');
      if (item.brand === 'Apple' || item.brand === 'Coursera') {
        notes.push('Brand "' + item.brand + '" is inconsistent with local life skills program');
        classification = 'Incorrect or mismatched listing';
      }
    }

    console.log(`[Item ${i + 1}/18] ID: ${item.id}`);
    console.log(`  Title: "${item.title}"`);
    console.log(`  Store: "${item.companyName}" (ID: ${item.companyId})`);
    console.log(`  Category: ${item.category} | Subcategory: ${item.subcategory} | Brand: ${item.brand}`);
    console.log(`  Price: KES ${item.price} | Orders: ${item.ordersCount} | ProductFound: ${!!item.productTitle}`);
    console.log(`  Image Status: ${imgCheck.status} (${imgCheck.ok ? 'HTTP OK' : 'FAILED: ' + imgCheck.error})`);
    console.log(`  Image URL: ${imgUrl}`);
    console.log(`  Classification: ${classification}`);
    console.log(`  Audit Notes: ${notes.join('; ') || 'None'}`);
    console.log('----------------------------------------------------');
  }
}

run();
