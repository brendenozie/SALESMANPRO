const { PrismaClient } = require('@prisma/client');
const https = require('https');
const http = require('http');
const fs = require('fs');

const prisma = new PrismaClient();

function checkUrl(urlStr) {
  return new Promise((resolve) => {
    try {
      const url = new URL(urlStr);
      const client = url.protocol === 'https:' ? https : http;
      const req = client.request(url, { method: 'HEAD', timeout: 7000 }, (res) => {
        resolve({
          url: urlStr,
          statusCode: res.statusCode,
          contentType: res.headers['content-type'] || 'unknown',
          contentLength: res.headers['content-length'] || 0,
          accessible: res.statusCode >= 200 && res.statusCode < 400
        });
      });
      req.on('error', (err) => resolve({ url: urlStr, error: err.message, accessible: false }));
      req.on('timeout', () => { req.destroy(); resolve({ url: urlStr, error: 'TIMEOUT', accessible: false }); });
      req.end();
    } catch (e) {
      resolve({ url: urlStr, error: e.message, accessible: false });
    }
  });
}

async function auditAuthenticity() {
  console.log('=== ITEM 4 & 5: CATALOG AUTHENTICITY & IMAGE ACCESSIBILITY AUDIT ===\n');

  const listings = await prisma.marketplaceListings.findMany({
    include: {
      product: true,
      productCategory: true,
      company: { select: { slug: true, name: true } }
    }
  });

  console.log(`Auditing ${listings.length} marketplace listings and their linked products...`);

  // Collect all unique image URLs
  const allImages = new Set();
  for (const l of listings) {
    if (Array.isArray(l.images)) {
      l.images.forEach(img => {
        if (typeof img === 'string') allImages.add(img);
        else if (img && typeof img === 'object' && img.url) allImages.add(img.url);
      });
    }
  }

  console.log(`Found ${allImages.size} unique image URLs across all listings. Performing HTTP accessibility checks...`);

  const imageResults = {};
  const imageList = [...allImages];

  // Check in batches of 10
  for (let i = 0; i < imageList.length; i += 10) {
    const batch = imageList.slice(i, i + 10);
    const results = await Promise.all(batch.map(checkUrl));
    for (const r of results) imageResults[r.url] = r;
    process.stdout.write(`  Checked ${Math.min(i + 10, imageList.length)} / ${imageList.length} images...\r`);
  }
  console.log('\nImage check complete.\n');

  let brokenImages = 0;
  for (const [url, r] of Object.entries(imageResults)) {
    if (!r.accessible) {
      console.warn(`[BROKEN IMAGE] ${url} -> ${r.statusCode || r.error}`);
      brokenImages++;
    }
  }
  console.log(`Image Accessibility Summary: ${allImages.size - brokenImages} / ${allImages.size} accessible (Broken: ${brokenImages})`);

  // Classify each offering into Tier 1 (Merchant Origin) vs Tier 2 (Standardized Curated Baseline)
  const auditReport = [];

  const MERCHANT_ORIGIN_LISTING_IDS = new Set([
    '68e17a8016ac60978dc272ed', // McVitie's Biscuit (Ordered)
    '68ef880790cac14a0f2897a9', // Biscuit
    '68e17abb16ac60978dc272ef', // Bose Headphones
    '68e17b2f16ac60978dc272f3', // Bose SoundLink
    '68e17afe16ac60978dc272f2', // Savannah Coffee Table
    '68e17a9116ac60978dc272ee', // Nordic Armchair
    '68e17af116ac60978dc272f1', // Jambotron Toy
    '68e17ae416ac60978dc272f0', // Bata Safari Boots
    '68dbfaccead1b2af584e8cda', // Nuby Teething Ring
    '687ae1d3990c2854fe8bcdd2', // Safari Glamp Tent
    '6ac7fb1ca4b9557d69603655', // 2025 Toyota Probox
    '6ac7fafca4b9557d69603654', // Panadol Extra 500mg
    '68ca81c355aabf7d60a8c91a', // 7-Day Luxury Private Safari
    '6884b2b6eb9bffc4afd0a22f', // Lake Victoria Tilapia
    '6889c23b24f9f89a608b48fb', // Awesome Heights Apartment
    '68c29ab8c4264d75af2ad196', // Corporate Legal Advisory
    '6882938ca195c3ed50b3fdaf', // Bata Bullets Sneakers
    '68ff403ec691020fd06b2a8c', // Stepping Out Life Skills
    '68fbf52b584c118332856acf', // Sample Programs Book
    '690084dca2172b890cd8f61b', // Stepping Out (pflourishhub Ebook)
    '69012ecbcda3cea48b52be7f'  // Stepping Out (pflourishhub Coaching)
  ]);

  let tier1Count = 0;
  let tier2Count = 0;

  for (const l of listings) {
    const isMerchantOrigin = MERCHANT_ORIGIN_LISTING_IDS.has(l.id);
    const tier = isMerchantOrigin ? 'TIER_1_MERCHANT_PRE_EXISTING' : 'TIER_2_STANDARDIZED_CURATED_BASELINE';
    if (isMerchantOrigin) tier1Count++;
    else tier2Count++;

    const firstImg = Array.isArray(l.images) && l.images.length > 0 ? (typeof l.images[0] === 'string' ? l.images[0] : l.images[0].url) : null;
    const imgCheck = firstImg ? imageResults[firstImg] : null;

    auditReport.push({
      listingId: l.id,
      productId: l.product?.id || null,
      storeSlug: l.company?.slug || 'unknown',
      storeName: l.company?.name || 'unknown',
      title: l.name,
      brand: l.brand || 'Unbranded',
      model: l.model || 'N/A',
      category: l.category || l.productCategory?.name || 'N/A',
      subCategory: typeof l.subCategory === 'object' ? l.subCategory?.name : (l.subCategoryName || 'N/A'),
      sellingPriceKES: l.sellingPrice,
      buyingPriceKES: l.buyingPrice || l.product?.costPrice || 0,
      tier,
      tierDescription: isMerchantOrigin
        ? 'Pre-existing merchant offering created by store owner; metadata, imagery, and relations synchronized in Phase 0.'
        : 'Standardized demonstration offering materialized in Phase 0 to populate specialized store category matching real-world specifications.',
      hasValidLinkedProduct: !!l.product,
      primaryImageUrl: firstImg,
      imageAccessible: imgCheck ? imgCheck.accessible : false,
      imageStatusCode: imgCheck ? imgCheck.statusCode : 'N/A',
      imageContentType: imgCheck ? imgCheck.contentType : 'N/A',
      status: l.status,
      isAvailable: l.isAvailable,
      showOnGhuba: l.showOnGhuba
    });
  }

  console.log(`\nCatalog Classification Breakdown:`);
  console.log(`- Tier 1 (Merchant Pre-Existing Real Records): ${tier1Count}`);
  console.log(`- Tier 2 (Standardized Curated Baseline Demo Records): ${tier2Count}`);
  console.log(`- Total Classified Offerings: ${auditReport.length}`);

  fs.writeFileSync('scratch/catalog_authenticity_audit.json', JSON.stringify(auditReport, null, 2));
  console.log('\nSaved full catalog authenticity & image audit to scratch/catalog_authenticity_audit.json');

  await prisma.$disconnect();
}

auditAuthenticity().catch(console.error);
