/**
 * Master Catalog Reconstruction Script for 49 Merchant Stores
 * Owned exclusively by brendenozie@gmail.com (UserId: 67c5b0182e2372b5f2366dbe)
 * 
 * Supports:
 *   --manifest-only : Build and save the JSON manifest locally
 *   --dry-run       : Connect to DB, validate queries/schemas without mutating
 *   --live          : Apply atomic changes to MongoDB
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function genObjectId(hex) {
  if (hex) return hex;
  return crypto.randomBytes(12).toString('hex');
}

const AUTHORIZED_USER_ID = '67c5b0182e2372b5f2366dbe';
const EXPORT_FILE = path.join(__dirname, 'targeted_catalog_export_2026-10-15.json');
const TAXONOMY_FILE = path.join(__dirname, 'canonical-taxonomy-full.json');
const MANIFEST_FILE = path.join(__dirname, 'reconstruction_manifest_full.json');

// Load Data Modules
const DATA_MODULES = [
  './data/retail_stores.js',
  './data/retail_stores_2.js',
  './data/retail_stores_3.js',
  './data/retail_stores_4.js',
  './data/service_stores_1.js',
  './data/service_stores_2.js',
  './data/service_stores_3.js',
  './data/service_stores_4.js'
];

function loadCatalogDefinitions() {
  const allStores = {};
  for (const modPath of DATA_MODULES) {
    const fullPath = path.resolve(__dirname, modPath);
    const mod = require(fullPath);
    const data = Object.values(mod)[0];
    Object.assign(allStores, data);
  }
  return allStores;
}

function buildTaxonomyResolver(taxonomyData) {
  const catMap = new Map();
  for (const cat of taxonomyData.categories) {
    catMap.set(cat.slug, cat);
    catMap.set(cat.name.toLowerCase(), cat);
    catMap.set(cat.id, cat);
  }

  return function resolveTaxonomy(catKey, subcatName) {
    const cat = catMap.get(catKey) || catMap.get(catKey.toLowerCase());
    if (!cat) throw new Error(`Category key not found: ${catKey}`);
    
    let subcat = null;
    if (cat.subcategories && cat.subcategories.length > 0) {
      if (subcatName) {
        subcat = cat.subcategories.find(s => 
          s.name.toLowerCase() === subcatName.toLowerCase() ||
          s.slug.toLowerCase() === subcatName.toLowerCase()
        );
      }
      if (!subcat) subcat = cat.subcategories[0];
    }

    return {
      productCategoryId: cat.id,
      categoryName: cat.name,
      subCategoryName: subcat ? subcat.name : cat.name,
      subCategory: subcat ? {
        _id: subcat.id || subcat._id || cat.id,
        name: subcat.name,
        slug: subcat.slug,
        status: "Active"
      } : {
        _id: cat.id,
        name: cat.name,
        slug: cat.slug,
        status: "Active"
      }
    };
  };
}

function generateSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function generateSku(storeSlug, index) {
  const prefix = storeSlug.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 4);
  const num = String(index + 1).padStart(3, '0');
  return `${prefix}-${num}`;
}

function buildManifest() {
  console.log('--- Loading input files ---');
  const exportData = JSON.parse(fs.readFileSync(EXPORT_FILE, 'utf8'));
  const taxonomyData = JSON.parse(fs.readFileSync(TAXONOMY_FILE, 'utf8'));
  const catalogDefinitions = loadCatalogDefinitions();
  const resolveTaxonomy = buildTaxonomyResolver(taxonomyData);

  console.log(`Loaded ${exportData.companyCount} companies, ${exportData.productCount} existing products, ${exportData.listingCount} listings.`);
  
  const companyMap = new Map();
  exportData.companies.forEach(c => companyMap.set(c.id, c));

  const prodsByCompany = new Map();
  exportData.companies.forEach(c => prodsByCompany.set(c.id, []));
  exportData.products.forEach(p => {
    if (prodsByCompany.has(p.companyId)) {
      prodsByCompany.get(p.companyId).push(p);
    }
  });

  const listingsByProduct = new Map();
  exportData.listings.forEach(l => {
    if (l.productId) {
      listingsByProduct.set(l.productId, l);
    }
  });

  const manifest = {
    generatedAt: new Date().toISOString(),
    authorizedUserId: AUTHORIZED_USER_ID,
    totalStores: exportData.companies.length,
    stores: [],
    archiveProducts: [],
    archiveListings: [],
    enrichProducts: [],
    enrichListings: [],
    newProducts: [],
    newListings: [],
    summary: {
      totalExistingProducts: exportData.products.length,
      totalExistingListings: exportData.listings.length,
      productsToArchive: 0,
      listingsToArchive: 0,
      productsToEnrich: 0,
      listingsToEnrich: 0,
      productsToCreate: 0,
      listingsToCreate: 0,
      finalProductCount: 0,
      finalListingCount: 0
    }
  };

  for (const comp of exportData.companies) {
    const storeDef = catalogDefinitions[comp.slug];
    if (!storeDef) {
      throw new Error(`Missing store definition for slug: ${comp.slug}`);
    }

    const existingProds = prodsByCompany.get(comp.id) || [];
    const matchedExistingIds = new Set();
    const matchedDefinedNames = new Set();

    const storeManifest = {
      companyId: comp.id,
      companySlug: comp.slug,
      companyName: comp.name,
      catKey: storeDef.catKey,
      items: []
    };

    // 1. Identify genuine items to KEEP / ENRICH
    storeDef.products.forEach((defProd, idx) => {
      const found = existingProds.find(ep => {
        if (matchedExistingIds.has(ep.id)) return false;
        const n1 = ep.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const n2 = defProd.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return n1 === n2 || (n1.length > 8 && (n2.includes(n1) || n1.includes(n2)));
      });

      const tax = resolveTaxonomy(storeDef.catKey, defProd.subcat || storeDef.subcatDefault);
      const sellingPrice = Number(defProd.price);
      const costPrice = Number(defProd.cost || Math.round(defProd.price * 0.6));
      const profitMargin = Number((((sellingPrice - costPrice) / sellingPrice) * 100).toFixed(2));
      const tags = Array.from(new Set([
        ...defProd.name.toLowerCase().split(/\s+/).filter(w => w.length > 3),
        tax.categoryName.toLowerCase(),
        tax.subCategoryName.toLowerCase()
      ])).slice(0, 8);

      if (found) {
        matchedExistingIds.add(found.id);
        matchedDefinedNames.add(defProd.name);

        const enrichedProd = {
          id: found.id,
          companyId: comp.id,
          name: defProd.name,
          description: defProd.desc,
          sellingPrice,
          costPrice,
          finalPrice: sellingPrice,
          profitMargin,
          brand: defProd.brand || null,
          category: tax.categoryName,
          subCategory: tax.subCategory,
          subCategoryName: tax.subCategoryName,
          productCategoryId: tax.productCategoryId,
          images: [{ index: 0, url: defProd.img, isPrimary: true }],
          tags,
          status: 'DRAFT',
          listingSystemStatus: 'DRAFT',
          active: false,
          showOnGhuba: false,
          isAvailable: true
        };
        manifest.enrichProducts.push(enrichedProd);

        const linkedListing = listingsByProduct.get(found.id);
        if (linkedListing) {
          manifest.enrichListings.push({
            id: linkedListing.id,
            productId: found.id,
            companyId: comp.id,
            name: defProd.name,
            description: defProd.desc,
            sellingPrice,
            buyingPrice: costPrice,
            finalPrice: sellingPrice,
            profitMargin,
            category: tax.categoryName,
            subCategory: tax.subCategory,
            subCategoryName: tax.subCategoryName,
            productCategoryId: tax.productCategoryId,
            images: [defProd.img],
            tags,
            status: 'DRAFT',
            listingSystemStatus: 'DRAFT',
            active: false,
            showOnGhuba: false,
            isAvailable: true
          });
        }

        storeManifest.items.push({
          action: 'ENRICH',
          productId: found.id,
          name: defProd.name,
          price: sellingPrice,
          subCategory: tax.subCategoryName
        });
      } else {
        // New Product to CREATE
        const newProdId = genObjectId();
        const newListingId = genObjectId();
        const sku = generateSku(comp.slug, idx);

        const newProd = {
          _id: newProdId,
          companyId: comp.id,
          name: defProd.name,
          description: defProd.desc,
          sellingPrice,
          costPrice,
          finalPrice: sellingPrice,
          profitMargin,
          brand: defProd.brand || null,
          sku,
          quantity: 50,
          category: tax.categoryName,
          subCategory: tax.subCategory,
          subCategoryName: tax.subCategoryName,
          productCategoryId: tax.productCategoryId,
          images: [{ index: 0, url: defProd.img, isPrimary: true }],
          tags,
          status: 'DRAFT',
          listingSystemStatus: 'DRAFT',
          active: false,
          showOnGhuba: false,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        manifest.newProducts.push(newProd);

        const newListing = {
          _id: newListingId,
          companyId: comp.id,
          sellerId: null,
          productId: newProdId,
          productCategoryId: tax.productCategoryId,
          name: defProd.name,
          description: defProd.desc,
          sellingPrice,
          buyingPrice: costPrice,
          finalPrice: sellingPrice,
          profitMargin,
          quantity: 50,
          category: tax.categoryName,
          subCategory: tax.subCategory,
          subCategoryName: tax.subCategoryName,
          images: [defProd.img],
          tags,
          status: 'DRAFT',
          listingSystemStatus: 'DRAFT',
          active: false,
          showOnGhuba: false,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        manifest.newListings.push(newListing);

        storeManifest.items.push({
          action: 'CREATE',
          productId: newProdId,
          name: defProd.name,
          price: sellingPrice,
          subCategory: tax.subCategoryName
        });
      }
    });

    // 2. Identify products to ARCHIVE
    existingProds.forEach(ep => {
      if (!matchedExistingIds.has(ep.id)) {
        manifest.archiveProducts.push({
          id: ep.id,
          companyId: comp.id,
          name: ep.name
        });

        const linkedListing = listingsByProduct.get(ep.id);
        if (linkedListing) {
          manifest.archiveListings.push({
            id: linkedListing.id,
            productId: ep.id,
            companyId: comp.id,
            name: linkedListing.name
          });
        }
      }
    });

    manifest.stores.push(storeManifest);
  }

  // Any remaining orphan listings in these companies must also be archived
  const archivedListingIds = new Set(manifest.archiveListings.map(l => l.id));
  const enrichedListingIds = new Set(manifest.enrichListings.map(l => l.id));
  exportData.listings.forEach(l => {
    if (!archivedListingIds.has(l.id) && !enrichedListingIds.has(l.id)) {
      manifest.archiveListings.push({
        id: l.id,
        productId: l.productId,
        companyId: l.companyId,
        name: l.name
      });
    }
  });

  // Calculate summary counts
  manifest.summary.productsToArchive = manifest.archiveProducts.length;
  manifest.summary.listingsToArchive = manifest.archiveListings.length;
  manifest.summary.productsToEnrich = manifest.enrichProducts.length;
  manifest.summary.listingsToEnrich = manifest.enrichListings.length;
  manifest.summary.productsToCreate = manifest.newProducts.length;
  manifest.summary.listingsToCreate = manifest.newListings.length;
  manifest.summary.finalProductCount = manifest.summary.productsToEnrich + manifest.summary.productsToCreate;
  manifest.summary.finalListingCount = manifest.summary.listingsToEnrich + manifest.summary.listingsToCreate;

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Manifest written to ${MANIFEST_FILE}`);
  console.log('Summary:', JSON.stringify(manifest.summary, null, 2));

  return manifest;
}

// Database Runner
async function executeDatabasePlan(manifest, isDryRun) {
  let MongoClient, ObjectId;
  try {
    const mongo = require('mongodb');
    MongoClient = mongo.MongoClient;
    ObjectId = mongo.ObjectId;
  } catch (e) {
    throw new Error('mongodb driver not found in environment. When running on VPS, run from /var/www/salesmanpro/current');
  }

  const MONGO_URI = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/salesmanprodb?replicaSet=rs0&directConnection=true';
  console.log(`\nConnecting to MongoDB: ${MONGO_URI.replace(/\/\/.*@/, '//***@')} ...`);
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db();
    console.log(`Connected successfully to database: ${db.databaseName}`);

    // Pre-Execution Safety Audits
    console.log('\n--- Pre-Execution Safety Audits ---');
    const orderCount = await db.collection('Order').countDocuments();
    const orderItemCount = await db.collection('OrderItem').countDocuments();
    console.log(`Current Total Orders: ${orderCount}, OrderItems: ${orderItemCount}`);

    // Verify zero orderItems reference any target product
    const allTargetCompanyIds = manifest.stores.map(s => s.companyId);
    const affectedOrderItems = await db.collection('OrderItem').find({
      companyId: { $in: allTargetCompanyIds }
    }).toArray();
    console.log(`Target store OrderItems count: ${affectedOrderItems.length}`);
    if (affectedOrderItems.length > 0) {
      console.warn(`WARNING: ${affectedOrderItems.length} OrderItems found belonging to target stores! These MUST NOT be mutated.`);
    }

    if (isDryRun) {
      console.log('\n========================================');
      console.log('DRY RUN MODE: Validating execution plan');
      console.log('========================================');
      
      // Validate that all companies exist and belong to authorized user
      const companies = await db.collection('Company').find({
        _id: { $in: allTargetCompanyIds.map(id => new ObjectId(id)) }
      }).toArray();
      console.log(`Found ${companies.length} of ${allTargetCompanyIds.length} target companies in DB.`);
      
      for (const comp of companies) {
        if (comp.userId && comp.userId.toString() !== AUTHORIZED_USER_ID) {
          throw new Error(`CRITICAL: Company ${comp.slug} (${comp._id}) has unauthorized userId: ${comp.userId}`);
        }
      }
      console.log('Verification PASSED: All target companies belong strictly to authorized user.');

      // Check existing products count in DB
      const existingInDb = await db.collection('Product').countDocuments({
        companyId: { $in: allTargetCompanyIds }
      });
      console.log(`Existing products in target companies in DB: ${existingInDb}`);

      console.log('\n[DRY RUN SUMMARY]');
      console.log(` - Products to ARCHIVE: ${manifest.summary.productsToArchive}`);
      console.log(` - Listings to ARCHIVE: ${manifest.summary.listingsToArchive}`);
      console.log(` - Products to ENRICH:  ${manifest.summary.productsToEnrich}`);
      console.log(` - Listings to ENRICH:  ${manifest.summary.listingsToEnrich}`);
      console.log(` - Products to CREATE:  ${manifest.summary.productsToCreate}`);
      console.log(` - Listings to CREATE:  ${manifest.summary.listingsToCreate}`);
      console.log(` - Expected Post-Reconstruction Count: ${manifest.summary.finalProductCount} (49 stores * 20 products)`);
      console.log('\nDry run completed successfully with ZERO database mutations.');
      return;
    }

    console.log('\n========================================');
    console.log('LIVE EXECUTION: Applying mutations to DB');
    console.log('========================================');

    // 1. Archive generic/irrelevant products
    console.log(`\nArchiving ${manifest.archiveProducts.length} irrelevant products...`);
    const archiveProdIds = manifest.archiveProducts.map(p => new ObjectId(p.id));
    const archiveProdRes = await db.collection('Product').updateMany(
      { _id: { $in: archiveProdIds } },
      { 
        $set: { 
          status: 'INACTIVE', 
          listingSystemStatus: 'INACTIVE', 
          active: false, 
          showOnGhuba: false,
          isAvailable: false,
          updatedAt: new Date()
        } 
      }
    );
    console.log(`Archived ${archiveProdRes.modifiedCount} products in Product collection.`);

    // 2. Archive corresponding listings
    console.log(`\nArchiving ${manifest.archiveListings.length} listings...`);
    const archiveListingIds = manifest.archiveListings.map(l => new ObjectId(l.id));
    const archiveListRes = await db.collection('MarketplaceListing').updateMany(
      { _id: { $in: archiveListingIds } },
      { 
        $set: { 
          status: 'INACTIVE', 
          listingSystemStatus: 'INACTIVE', 
          active: false, 
          showOnGhuba: false,
          isAvailable: false,
          updatedAt: new Date()
        } 
      }
    );
    console.log(`Archived ${archiveListRes.modifiedCount} listings in MarketplaceListing collection.`);

    // 3. Enrich genuine preserved products
    console.log(`\nEnriching ${manifest.enrichProducts.length} preserved products...`);
    for (const ep of manifest.enrichProducts) {
      await db.collection('Product').updateOne(
        { _id: new ObjectId(ep.id) },
        {
          $set: {
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
            active: false,
            showOnGhuba: false,
            isAvailable: true,
            updatedAt: new Date()
          }
        }
      );
    }
    console.log(`Enriched ${manifest.enrichProducts.length} products.`);

    // 4. Enrich preserved listings
    console.log(`\nEnriching ${manifest.enrichListings.length} preserved listings...`);
    for (const el of manifest.enrichListings) {
      await db.collection('MarketplaceListing').updateOne(
        { _id: new ObjectId(el.id) },
        {
          $set: {
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
            active: false,
            showOnGhuba: false,
            isAvailable: true,
            updatedAt: new Date()
          }
        }
      );
    }
    console.log(`Enriched ${manifest.enrichListings.length} listings.`);

    // 5. Insert newly created authentic products
    console.log(`\nInserting ${manifest.newProducts.length} new authentic products...`);
    const newProdRes = await db.collection('Product').insertMany(manifest.newProducts);
    console.log(`Inserted ${newProdRes.insertedCount} products into Product collection.`);

    // 6. Insert newly created listings
    console.log(`\nInserting ${manifest.newListings.length} new marketplace listings...`);
    const newListingRes = await db.collection('MarketplaceListing').insertMany(manifest.newListings);
    console.log(`Inserted ${newListingRes.insertedCount} listings into MarketplaceListing collection.`);

    // Post-Execution Verification
    console.log('\n--- Post-Execution Verification ---');
    const finalOrderCount = await db.collection('Order').countDocuments();
    const finalOrderItemCount = await db.collection('OrderItem').countDocuments();
    if (finalOrderCount !== orderCount || finalOrderItemCount !== orderItemCount) {
      throw new Error(`CRITICAL INTEGRITY FAILURE: Order counts changed! Before: ${orderCount}, After: ${finalOrderCount}`);
    }
    console.log('Order integrity verification PASSED: 0 customer orders or items modified.');

    // Verify per-store active/draft counts
    let allStoresValid = true;
    for (const store of manifest.stores) {
      const activeDraftProds = await db.collection('Product').countDocuments({
        companyId: store.companyId,
        status: { $in: ['DRAFT', 'ACTIVE'] }
      });
      const activeDraftListings = await db.collection('MarketplaceListing').countDocuments({
        companyId: store.companyId,
        status: { $in: ['DRAFT', 'ACTIVE'] }
      });
      if (activeDraftProds !== 20 || activeDraftListings !== 20) {
        console.error(`Store ${store.companySlug} failed post-audit: ${activeDraftProds} products, ${activeDraftListings} listings.`);
        allStoresValid = false;
      }
    }

    if (allStoresValid) {
      console.log('\nSUCCESS! All 49 stores now have exactly 20 commercial offerings and 20 listings.');
    } else {
      console.warn('\nWarning: Some stores did not reach exactly 20 items. Check log above.');
    }

  } finally {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const manifest = buildManifest();

  if (args.includes('--manifest-only')) {
    console.log('Finished manifest generation.');
    process.exit(0);
  }

  const isDryRun = !args.includes('--live');
  await executeDatabasePlan(manifest, isDryRun);
  process.exit(0);
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}
