const { MongoClient } = require('mongodb');
const fs = require('fs');
const { execSync } = require('child_process');

async function main() {
  console.log("=================================================");
  console.log("PRODUCTION AUDIT: SalesmanPro / Ghuba Post-Cleanup");
  console.log("Timestamp:", new Date().toISOString());
  console.log("=================================================\n");

  // 1. PM2 and Environment Inspection
  console.log("--- 1. PM2 APP CONFIGURATION ---");
  try {
    const pm2ListRaw = execSync('pm2 jlist', { encoding: 'utf8' });
    const pm2List = JSON.parse(pm2ListRaw);
    const salesmanApp = pm2List.find(p => p.name === 'salesmanpro');
    if (salesmanApp) {
      console.log("PM2 App Name:", salesmanApp.name);
      console.log("PM2 App Status:", salesmanApp.pm2_env.status);
      console.log("PM2 Process IDs:", pm2List.filter(p => p.name === 'salesmanpro').map(p => ({ pm_id: p.pm_id, pid: p.pid })));
      console.log("PM2 CWD:", salesmanApp.pm2_env.pm_cwd);
      console.log("PM2 Node Version:", salesmanApp.pm2_env.node_version);
      
      const dbUrl = salesmanApp.pm2_env.DATABASE_URL || '';
      const redactedUrl = dbUrl.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://<USER>:<PASS>@');
      console.log("Effective DATABASE_URL (Redacted):", redactedUrl);
      
      const redisUrl = salesmanApp.pm2_env.REDIS_URL || '';
      console.log("Effective REDIS_URL (Redacted):", redisUrl.replace(/redis:\/\/([^:]+):([^@]+)@/, 'redis://<USER>:<PASS>@'));
    } else {
      console.log("salesmanpro process not found in pm2 jlist");
    }
  } catch (err) {
    console.error("Error reading PM2 config:", err.message);
  }

  // 2. MongoDB Databases and Collections Check
  console.log("\n--- 2. LOCAL MONGODB INSTANCE INSPECTION ---");
  const localUri = "mongodb://127.0.0.1:27017/?directConnection=true";
  const client = new MongoClient(localUri);
  await client.connect();

  const adminDb = client.db().admin();
  const dbs = await adminDb.listDatabases();
  console.log("Databases on 127.0.0.1:27017:");
  for (const d of dbs.databases) {
    console.log(` - ${d.name} (${(d.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
  }

  // Target database
  const targetDbName = "salesmanprodb";
  const db = client.db(targetDbName);
  const collections = await db.listCollections().toArray();
  console.log(`\nCollections in ${targetDbName}: ${collections.length} collections`);

  const listingColl = db.collection('marketplaceListings');
  const productColl = db.collection('Product');
  const companyColl = db.collection('Company');
  const orderColl = db.collection('CustomerOrder');
  const orderItemColl = db.collection('OrderItem');

  const totalListings = await listingColl.countDocuments();
  const totalProducts = await productColl.countDocuments();
  const totalOrders = await orderColl.countDocuments();
  const totalOrderItems = await orderItemColl.countDocuments();
  const totalCompanies = await companyColl.countDocuments();

  console.log(`Summary Counts in ${targetDbName}:`);
  console.log(` - marketplaceListings: ${totalListings}`);
  console.log(` - Product: ${totalProducts}`);
  console.log(` - CustomerOrder: ${totalOrders}`);
  console.log(` - OrderItem: ${totalOrderItems}`);
  console.log(` - Company: ${totalCompanies}`);

  // Also check if SALESMANDB exists or ever existed
  const salesmanDbExists = dbs.databases.some(d => d.name === 'SALESMANDB');
  console.log(`Database 'SALESMANDB' exists locally: ${salesmanDbExists}`);

  // 3. Complete Inventory & Reconciliation of all 58 surviving listings
  console.log("\n--- 3. COMPLETE RECONCILIATION OF ALL SURVIVING LISTINGS ---");
  const allListings = await listingColl.find({}).toArray();
  console.log(`Total listings retrieved from DB: ${allListings.length}`);

  // Fetch all companies and products for reference
  const companies = await companyColl.find({}).toArray();
  const compMap = new Map(companies.map(c => [c._id.toString(), c.name || c.businessName || 'Unnamed']));

  const products = await productColl.find({}).toArray();
  const prodMap = new Map(products.map(p => [p._id.toString(), p]));

  // Count order items referencing each listing
  const orderItems = await orderItemColl.find({}).toArray();
  const orderItemRefCounts = new Map();
  for (const item of orderItems) {
    const listId = item.listingId ? item.listingId.toString() : (item.marketplaceListingId ? item.marketplaceListingId.toString() : null);
    if (listId) {
      orderItemRefCounts.set(listId, (orderItemRefCounts.get(listId) || 0) + 1);
    }
  }

  // Classify each listing
  const reconciled = allListings.map(l => {
    const id = l._id.toString();
    const companyName = compMap.get(l.companyId ? l.companyId.toString() : '') || 'Unknown';
    const prod = prodMap.get(l.productId ? l.productId.toString() : '');
    const orderRefCount = orderItemRefCounts.get(id) || 0;
    
    // Visibility criteria on Ghuba: status === 'ACTIVE' && isAvailable === true && showOnGhuba === true
    const isPubliclyVisible = l.status === 'ACTIVE' && l.isAvailable === true && l.showOnGhuba === true;
    const isArchivedInactive = l.status === 'INACTIVE';

    return {
      id,
      title: l.title || l.name,
      status: l.status,
      isAvailable: l.isAvailable,
      showOnGhuba: l.showOnGhuba,
      price: l.price,
      companyId: l.companyId ? l.companyId.toString() : null,
      companyName,
      productId: l.productId ? l.productId.toString() : null,
      productFound: !!prod,
      orderRefCount,
      isPubliclyVisible,
      isArchivedInactive,
      imagesCount: (l.images || []).length,
      imageUrls: l.images || []
    };
  });

  const visibleListings = reconciled.filter(r => r.isPubliclyVisible);
  const inactiveListings = reconciled.filter(r => r.isArchivedInactive);
  const otherListings = reconciled.filter(r => !r.isPubliclyVisible && !r.isArchivedInactive);

  console.log(`\nReconciliation Breakdown:`);
  console.log(` - Total listings: ${reconciled.length}`);
  console.log(` - Publicly visible on Ghuba (ACTIVE + available + showOnGhuba): ${visibleListings.length}`);
  console.log(` - Archived / Inactive (INACTIVE): ${inactiveListings.length}`);
  console.log(` - Other / In-Between (neither visible nor INACTIVE): ${otherListings.length}`);

  console.log("\nDetails of 'Other' listings (The unaccounted group):");
  otherListings.forEach(l => {
    console.log(`ID: ${l.id} | Title: "${l.title}" | Status: ${l.status} | Avail: ${l.isAvailable} | showGhuba: ${l.showOnGhuba} | Company: ${l.companyName} | OrderRefs: ${l.orderRefCount}`);
  });

  // 4. Verify Historical Transaction Integrity (196 Orders / 295 Items)
  console.log("\n--- 4. HISTORICAL TRANSACTION INTEGRITY ---");
  console.log(`Total Orders: ${totalOrders}, Total Order Items: ${totalOrderItems}`);
  
  let validListingRefs = 0;
  let missingListingRefs = 0;
  let validProductRefs = 0;
  let missingProductRefs = 0;
  const listingIdSet = new Set(allListings.map(l => l._id.toString()));
  const productIdSet = new Set(products.map(p => p._id.toString()));

  const unresolvableItems = [];

  for (const item of orderItems) {
    const listId = item.listingId ? item.listingId.toString() : (item.marketplaceListingId ? item.marketplaceListingId.toString() : null);
    const prodId = item.productId ? item.productId.toString() : null;

    if (listId && listingIdSet.has(listId)) {
      validListingRefs++;
    } else {
      missingListingRefs++;
    }

    if (prodId && productIdSet.has(prodId)) {
      validProductRefs++;
    } else {
      missingProductRefs++;
    }

    if ((!listId || !listingIdSet.has(listId)) && (!prodId || !productIdSet.has(prodId))) {
      unresolvableItems.push({
        itemId: item._id.toString(),
        orderId: item.orderId ? item.orderId.toString() : item.customerOrderId,
        listId,
        prodId,
        title: item.title || item.name,
        price: item.price,
        quantity: item.quantity
      });
    }
  }

  console.log(`Order Items listing resolution:`);
  console.log(` - Valid listing references pointing to surviving listings: ${validListingRefs}`);
  console.log(` - Listing references pointing to non-surviving/null listings: ${missingListingRefs}`);
  console.log(` - Valid product references pointing to existing products: ${validProductRefs}`);
  console.log(` - Product references missing/null: ${missingProductRefs}`);
  console.log(` - Unresolvable items (neither listing nor product exists): ${unresolvableItems.length}`);

  // Reconcile the 47 reportedly order-referenced listings:
  const distinctOrderedListingIds = new Set();
  orderItems.forEach(i => {
    const lid = i.listingId ? i.listingId.toString() : (i.marketplaceListingId ? i.marketplaceListingId.toString() : null);
    if (lid) distinctOrderedListingIds.add(lid);
  });
  console.log(`Distinct listing IDs referenced across all 295 OrderItems: ${distinctOrderedListingIds.size}`);
  const distinctOrderedInSurviving = [...distinctOrderedListingIds].filter(id => listingIdSet.has(id));
  console.log(`Distinct ordered listing IDs present in surviving 58 listings: ${distinctOrderedInSurviving.length}`);

  // 5. Redis Inspection
  console.log("\n--- 5. REDIS CONFIGURATION & STATUS ---");
  try {
    const redisInfoRaw = execSync('redis-cli info', { encoding: 'utf8' });
    const redisDbLines = redisInfoRaw.split('\n').filter(l => l.startsWith('db'));
    console.log("Redis DB stats:", redisDbLines.join(', '));
    
    // Check keys in db0
    const dbSize = execSync('redis-cli dbsize', { encoding: 'utf8' }).trim();
    console.log("Redis current DBSIZE:", dbSize);

    // Sample keys
    const sampleKeys = execSync('redis-cli --scan | head -n 30', { encoding: 'utf8' }).trim();
    console.log("Sample Redis keys currently in DB 0:\n" + sampleKeys);
  } catch (err) {
    console.error("Error inspecting Redis:", err.message);
  }

  // Save audit data to JSON file
  fs.writeFileSync('/var/www/salesmanpro/post_cleanup_audit_data.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    totalListings,
    totalProducts,
    totalOrders,
    totalOrderItems,
    totalCompanies,
    reconciledListings: reconciled,
    distinctOrderedListingIds: [...distinctOrderedListingIds],
    unresolvableItems
  }, null, 2));

  console.log("\nSaved detailed audit data to /var/www/salesmanpro/post_cleanup_audit_data.json");
  await client.close();
}

main().catch(err => {
  console.error("FATAL AUDIT ERROR:", err);
  process.exit(1);
});
