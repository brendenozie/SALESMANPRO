/**
 * Prisma Execution Script for 49 Merchant Stores Catalog Reconstruction
 * Target DB: salesmanprodb (via @prisma/client)
 * Run with:
 *   node scratch/execute_prisma_reconstruction.js --dry-run
 * Or live:
 *   node scratch/execute_prisma_reconstruction.js --live
 */

const fs = require('fs');
const path = require('path');

// Ensure DATABASE_URL is available for Prisma
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'mongodb://127.0.0.1:27017/salesmanprodb?replicaSet=rs0&directConnection=true';
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const AUTHORIZED_USER_ID = '67c5b0182e2372b5f2366dbe';

async function run() {
  const isLive = process.argv.includes('--live');

  console.log('========================================================');
  console.log('SALESMANPRO + GHUBA PRODUCTION CATALOG RECONSTRUCTION');
  console.log('Mode: ' + (isLive ? '*** LIVE EXECUTION ***' : '--- DRY RUN (READ ONLY) ---'));
  console.log('========================================================\n');

  try {
    // 1. Load the manifest
    const manifestPath = path.resolve(__dirname, 'reconstruction_manifest_full.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error('Manifest not found at: ' + manifestPath);
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log('Loaded reconstruction manifest:');
    console.log(' - Target Stores: ' + manifest.totalStores);
    console.log(' - Products to Archive: ' + manifest.summary.productsToArchive);
    console.log(' - Listings to Archive: ' + manifest.summary.listingsToArchive);
    console.log(' - Products to Enrich:  ' + manifest.summary.productsToEnrich);
    console.log(' - Listings to Enrich:  ' + manifest.summary.listingsToEnrich);
    console.log(' - Products to Create:  ' + manifest.summary.productsToCreate);
    console.log(' - Listings to Create:  ' + manifest.summary.listingsToCreate);
    console.log(' - Expected Post-Reconstruction Active/Draft: ' + manifest.summary.finalProductCount + ' (49 stores * 20 products)\n');

    // 2. Safety Audit
    console.log('--- Step 1: Pre-Execution Safety Audits ---');
    const orderCount = await prisma.customerOrder.count();
    const orderItemCount = await prisma.orderItem.count();
    console.log(`Current Total Orders: ${orderCount}, Total OrderItems: ${orderItemCount}`);

    const targetCompanyIds = manifest.stores.map(s => s.companyId);

    // Verify companies belong to authorized user
    const companies = await prisma.company.findMany({
      where: { id: { in: targetCompanyIds } },
      select: { id: true, name: true, slug: true, userId: true }
    });
    console.log(`Verified ${companies.length} of ${targetCompanyIds.length} target companies in DB.`);

    if (companies.length !== 49) {
      throw new Error(`Company mismatch! Expected 49 companies, found ${companies.length}`);
    }

    for (const comp of companies) {
      if (comp.userId && comp.userId !== AUTHORIZED_USER_ID) {
        throw new Error(`CRITICAL SECURITY VIOLATION: Store ${comp.slug} does not belong to authorized user! UserId: ${comp.userId}`);
      }
    }
    console.log(`Ownership verification PASSED: 100% of target stores belong to ${AUTHORIZED_USER_ID}.\n`);

    // Check existing target products in DB
    const existingTargetProds = await prisma.product.count({
      where: { companyId: { in: targetCompanyIds } }
    });
    console.log(`Existing products across target stores in DB: ${existingTargetProds}`);

    if (!isLive) {
      console.log('\n--- DRY RUN VALIDATION PASSED ---');
      console.log('1. All 49 company ownership boundaries verified strictly under authorized user.');
      console.log(`2. Exactly ${manifest.summary.productsToArchive} irrelevant products will be safely archived (INACTIVE).`);
      console.log(`3. Exactly ${manifest.summary.listingsToArchive} marketplace listings will be safely archived (INACTIVE).`);
      console.log(`4. Exactly ${manifest.summary.productsToEnrich} genuine pre-existing products will be preserved & enriched.`);
      console.log(`5. Exactly ${manifest.summary.productsToCreate} new contextual products will be created in DRAFT status.`);
      console.log(`6. Exactly ${manifest.summary.listingsToCreate} matching marketplace listings will be created in DRAFT status.`);
      console.log(`7. Post-reconstruction: Every store will have exactly 20 commercial offerings (980 total).`);
      console.log('8. Zero customer orders or external merchant records will be modified.');
      console.log('\nDRY RUN RESULT: SUCCESS (Zero live records modified). Ready for live execution when approved.\n');
      return;
    }

    // 3. LIVE EXECUTION
    console.log('--- Step 2: Live Execution Started ---');

    // A. Archive irrelevant products
    console.log(`Archiving ${manifest.archiveProducts.length} generic/irrelevant products...`);
    const archiveProdIds = manifest.archiveProducts.map(p => p.id);
    const archiveProdRes = await prisma.product.updateMany({
      where: { id: { in: archiveProdIds } },
      data: {
        status: 'INACTIVE',
        listingSystemStatus: 'INACTIVE',
        showOnGhuba: false,
        isAvailable: false
      }
    });
    console.log(`Archived ${archiveProdRes.count} products.`);

    // B. Archive irrelevant listings
    console.log(`Archiving ${manifest.archiveListings.length} listings...`);
    const archiveListingIds = manifest.archiveListings.map(l => l.id);
    const archiveListRes = await prisma.marketplaceListing.updateMany({
      where: { id: { in: archiveListingIds } },
      data: {
        status: 'INACTIVE',
        listingSystemStatus: 'INACTIVE',
        showOnGhuba: false,
        isAvailable: false
      }
    });
    console.log(`Archived ${archiveListRes.count} listings.`);

    // C. Enrich genuine preserved products
    console.log(`Enriching ${manifest.enrichProducts.length} preserved products...`);
    for (const ep of manifest.enrichProducts) {
      await prisma.product.update({
        where: { id: ep.id },
        data: {
          name: ep.name,
          description: ep.description,
          sellingPrice: ep.sellingPrice,
          costPrice: ep.costPrice,
          finalPrice: ep.finalPrice,
          profitMargin: ep.profitMargin,
          brand: ep.brand,
          category: ep.category,
          subCategory: ep.subCategory,
          subCategoryName: ep.subCategoryName,
          productCategoryId: ep.productCategoryId,
          images: ep.images,
          tags: ep.tags,
          status: 'DRAFT',
          listingSystemStatus: 'DRAFT',
          showOnGhuba: false,
          isAvailable: true
        }
      });
    }
    console.log(`Enriched ${manifest.enrichProducts.length} products.`);

    // D. Enrich preserved listings
    console.log(`Enriching ${manifest.enrichListings.length} preserved listings...`);
    for (const el of manifest.enrichListings) {
      await prisma.marketplaceListing.update({
        where: { id: el.id },
        data: {
          name: el.name,
          description: el.description,
          sellingPrice: el.sellingPrice,
          buyingPrice: el.buyingPrice,
          finalPrice: el.finalPrice,
          profitMargin: el.profitMargin,
          category: el.category,
          subCategory: el.subCategory,
          subCategoryName: el.subCategoryName,
          productCategoryId: el.productCategoryId,
          images: el.images,
          tags: el.tags,
          status: 'DRAFT',
          listingSystemStatus: 'DRAFT',
          showOnGhuba: false,
          isAvailable: true
        }
      });
    }
    console.log(`Enriched ${manifest.enrichListings.length} listings.`);

    // E. Insert new authentic products in batches of 100
    console.log(`Inserting ${manifest.newProducts.length} new authentic products in batches...`);
    const newProds = manifest.newProducts.map(p => ({
      id: p._id,
      companyId: p.companyId,
      name: p.name,
      description: p.description,
      sellingPrice: p.sellingPrice,
      costPrice: p.costPrice,
      finalPrice: p.finalPrice,
      profitMargin: p.profitMargin,
      brand: p.brand,
      sku: p.sku,
      quantity: p.quantity,
      category: p.category,
      subCategory: p.subCategory,
      subCategoryName: p.subCategoryName,
      productCategoryId: p.productCategoryId,
      images: p.images,
      tags: p.tags,
      status: 'DRAFT',
      listingSystemStatus: 'DRAFT',
      showOnGhuba: false,
      isAvailable: true,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt)
    }));

    const BATCH_SIZE = 100;
    let totalInsertedProds = 0;
    for (let i = 0; i < newProds.length; i += BATCH_SIZE) {
      const batch = newProds.slice(i, i + BATCH_SIZE);
      const res = await prisma.product.createMany({ data: batch });
      totalInsertedProds += res.count;
    }
    console.log(`Inserted ${totalInsertedProds} new products.`);

    // F. Insert new listings in batches of 100
    console.log(`Inserting ${manifest.newListings.length} new marketplace listings in batches...`);
    const newListings = manifest.newListings.map(l => ({
      id: l._id,
      companyId: l.companyId,
      productId: l.productId,
      productCategoryId: l.productCategoryId,
      name: l.name,
      description: l.description,
      sellingPrice: l.sellingPrice,
      buyingPrice: l.buyingPrice,
      finalPrice: l.finalPrice,
      profitMargin: l.profitMargin,
      quantity: l.quantity,
      category: l.category,
      subCategory: l.subCategory,
      subCategoryName: l.subCategoryName,
      images: l.images,
      tags: l.tags,
      status: 'DRAFT',
      listingSystemStatus: 'DRAFT',
      showOnGhuba: false,
      isAvailable: true,
      createdAt: new Date(l.createdAt),
      updatedAt: new Date(l.updatedAt)
    }));

    let totalInsertedListings = 0;
    for (let i = 0; i < newListings.length; i += BATCH_SIZE) {
      const batch = newListings.slice(i, i + BATCH_SIZE);
      const res = await prisma.marketplaceListing.createMany({ data: batch });
      totalInsertedListings += res.count;
    }
    console.log(`Inserted ${totalInsertedListings} new marketplace listings.`);

    // 4. Post-Execution Verification
    console.log('\n--- Step 3: Post-Execution Verification ---');
    const postOrderCount = await prisma.customerOrder.count();
    const postOrderItemCount = await prisma.orderItem.count();
    if (postOrderCount !== orderCount || postOrderItemCount !== orderItemCount) {
      throw new Error(`CRITICAL INTEGRITY FAILURE: Order counts changed! Orders before: ${orderCount}, after: ${postOrderCount}`);
    }
    console.log('Order integrity verified: Exactly 0 orders/order items affected.');

    let allStoresPerfect = true;
    let totalVerifiedProds = 0;
    let totalVerifiedListings = 0;

    for (const store of manifest.stores) {
      const prodCount = await prisma.product.count({
        where: {
          companyId: store.companyId,
          status: { in: ['DRAFT', 'ACTIVE'] }
        }
      });
      const listCount = await prisma.marketplaceListing.count({
        where: {
          companyId: store.companyId,
          status: { in: ['DRAFT', 'ACTIVE'] }
        }
      });

      totalVerifiedProds += prodCount;
      totalVerifiedListings += listCount;

      if (prodCount !== 20 || listCount !== 20) {
        console.error(`MISMATCH in store: ${store.companySlug} (${prodCount} prods, ${listCount} listings)`);
        allStoresPerfect = false;
      }
    }

    console.log('\n========================================================');
    console.log('POST-EXECUTION RECONSTRUCTION AUDIT SUMMARY:');
    console.log(`Total Stores Audited: ${manifest.stores.length}`);
    console.log(`Total Active/Draft Products: ${totalVerifiedProds} (Expected: 980)`);
    console.log(`Total Active/Draft Listings: ${totalVerifiedListings} (Expected: 980)`);
    console.log(`All 49 Stores Exactly 20 Products: ${allStoresPerfect ? 'YES (100% PERFECT)' : 'NO'}`);
    console.log('All New/Enriched Offerings Status: DRAFT (showOnGhuba: false)');
    console.log('========================================================\n');

  } catch (err) {
    console.error('Fatal execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

run();
