// MongoDB Shell Audit Script for SalesmanPro / Ghuba Post-Cleanup Verification

print("=================================================");
print("MONGOSH POST-CLEANUP PRODUCTION INTEGRITY AUDIT");
print("Timestamp: " + new Date().toISOString());
print("Current DB: " + db.getName());
print("=================================================\n");

// 1. Verify Databases on Server
const adminDb = db.getSiblingDB("admin");
const dbs = adminDb.runCommand({ listDatabases: 1 });
print("Databases present on MongoDB server (127.0.0.1:27017):");
dbs.databases.forEach(d => {
  print(" - " + d.name + " (" + (d.sizeOnDisk / 1024 / 1024).toFixed(2) + " MB)");
});

// Check if SALESMANDB exists
const hasSalesmanDb = dbs.databases.some(d => d.name === "SALESMANDB");
print("Is 'SALESMANDB' present on this server? " + hasSalesmanDb);

// 2. Collection inventory
print("\n--- Collection counts in " + db.getName() + " ---");
const listingCount = db.marketplaceListings.countDocuments();
const productCount = db.Product.countDocuments();
const orderCount = db.CustomerOrder.countDocuments();
const orderItemCount = db.OrderItem.countDocuments();
const companyCount = db.Company.countDocuments();
const userCount = db.User.countDocuments();

print("marketplaceListings: " + listingCount);
print("Product: " + productCount);
print("CustomerOrder: " + orderCount);
print("OrderItem: " + orderItemCount);
print("Company: " + companyCount);
print("User: " + userCount);

// 3. Complete Breakdown of surviving marketplace listings (Priority 2)
print("\n--- PRIORITY 2: SURVIVING LISTINGS INVENTORY & RECONCILIATION ---");
const listings = db.marketplaceListings.find().toArray();
print("Total retrieved listings: " + listings.length);

const companies = db.Company.find().toArray();
const compMap = {};
companies.forEach(c => {
  compMap[c._id.toString()] = c.name || c.businessName || "Unnamed";
});

const products = db.Product.find().toArray();
const prodMap = {};
products.forEach(p => {
  prodMap[p._id.toString()] = p;
});

const orderItems = db.OrderItem.find().toArray();
const orderRefs = {};
orderItems.forEach(item => {
  const lid = item.listingId ? item.listingId.toString() : (item.marketplaceListingId ? item.marketplaceListingId.toString() : null);
  if (lid) {
    orderRefs[lid] = (orderRefs[lid] || 0) + 1;
  }
});

let countVisible = 0;
let countInactive = 0;
let countOther = 0;

const visibleList = [];
const inactiveList = [];
const otherList = [];

listings.forEach(l => {
  const id = l._id.toString();
  const cname = compMap[l.companyId ? l.companyId.toString() : ""] || "Unknown";
  const pExists = !!prodMap[l.productId ? l.productId.toString() : ""];
  const oCount = orderRefs[id] || 0;
  const isVis = (l.status === "ACTIVE" && l.isAvailable === true && l.showOnGhuba === true);
  const isArch = (l.status === "INACTIVE");

  const itemObj = {
    id: id,
    title: l.title || l.name,
    status: l.status,
    isAvailable: l.isAvailable,
    showOnGhuba: l.showOnGhuba,
    price: l.price,
    company: cname,
    productId: l.productId ? l.productId.toString() : null,
    productFound: pExists,
    orderRefCount: oCount,
    images: (l.images || []).length,
    firstImage: (l.images && l.images[0]) ? l.images[0] : null
  };

  if (isVis) {
    countVisible++;
    visibleList.push(itemObj);
  } else if (isArch) {
    countInactive++;
    inactiveList.push(itemObj);
  } else {
    countOther++;
    otherList.push(itemObj);
  }
});

print("Classification Summary:");
print(" - Total Listings: " + listings.length);
print(" - Publicly Visible (status=ACTIVE, isAvailable=true, showOnGhuba=true): " + countVisible);
print(" - Inactive / Preserved Clones (status=INACTIVE): " + countInactive);
print(" - Other / Internal / Unaccounted: " + countOther);

print("\n--- THE 18 PUBLICLY VISIBLE LISTINGS ---");
visibleList.forEach((l, idx) => {
  print((idx+1) + ". ID: " + l.id + " | Title: " + l.title + " | Price: " + l.price + " | Store: " + l.company + " | ProductFound: " + l.productFound + " | ImgCount: " + l.images);
  if (l.firstImage) print("   Image: " + l.firstImage);
});

print("\n--- THE 28 INACTIVE / PRESERVED CLONE LISTINGS ---");
inactiveList.forEach((l, idx) => {
  print((idx+1) + ". ID: " + l.id + " | Title: " + l.title + " | OrderRefs: " + l.orderRefCount + " | Avail: " + l.isAvailable + " | showGhuba: " + l.showOnGhuba + " | Store: " + l.company);
});

print("\n--- THE 'OTHER' (" + otherList.length + ") LISTINGS (ACCOUNTING FOR DISCREPANCY) ---");
otherList.forEach((l, idx) => {
  print((idx+1) + ". ID: " + l.id + " | Title: " + l.title + " | Status: " + l.status + " | Avail: " + l.isAvailable + " | showGhuba: " + l.showOnGhuba + " | OrderRefs: " + l.orderRefCount + " | Store: " + l.company);
});

// 4. Historical Transaction Integrity (Priority 3)
print("\n--- PRIORITY 3: HISTORICAL TRANSACTION INTEGRITY ---");
const listingIdSet = new Set(listings.map(l => l._id.toString()));
const productIdSet = new Set(products.map(p => p._id.toString()));

let itemsWithValidListing = 0;
let itemsWithMissingListing = 0;
let itemsWithValidProduct = 0;
let itemsWithMissingProduct = 0;
let itemsTotallyOrphaned = 0;

orderItems.forEach(item => {
  const lid = item.listingId ? item.listingId.toString() : (item.marketplaceListingId ? item.marketplaceListingId.toString() : null);
  const pid = item.productId ? item.productId.toString() : null;

  const hasLid = lid && listingIdSet.has(lid);
  const hasPid = pid && productIdSet.has(pid);

  if (hasLid) itemsWithValidListing++;
  else itemsWithMissingListing++;

  if (hasPid) itemsWithValidProduct++;
  else itemsWithMissingProduct++;

  if (!hasLid && !hasPid) {
    itemsTotallyOrphaned++;
    print("Orphaned OrderItem ID: " + item._id.toString() + " in Order: " + (item.orderId || item.customerOrderId) + " title: " + (item.title || item.name));
  }
});

print("Total OrderItems checked: " + orderItems.length);
print(" - Items with surviving Listing reference: " + itemsWithValidListing);
print(" - Items with missing Listing reference: " + itemsWithMissingListing);
print(" - Items with valid Product reference: " + itemsWithValidProduct);
print(" - Items with missing Product reference: " + itemsWithMissingProduct);
print(" - Items totally orphaned (no listing AND no product): " + itemsTotallyOrphaned);

// Distinct listings referenced in orders
const distinctLids = new Set();
orderItems.forEach(i => {
  const lid = i.listingId ? i.listingId.toString() : (i.marketplaceListingId ? i.marketplaceListingId.toString() : null);
  if (lid) distinctLids.add(lid);
});
print("Distinct Listing IDs referenced in OrderItems: " + distinctLids.size);
let distinctLidsSurviving = 0;
distinctLids.forEach(lid => {
  if (listingIdSet.has(lid)) distinctLidsSurviving++;
});
print("Distinct Listing IDs surviving in database: " + distinctLidsSurviving + " of " + distinctLids.size);

// Check Orders integrity
const orders = db.CustomerOrder.find().toArray();
print("\nTotal CustomerOrders checked: " + orders.length);
let ordersWithItems = 0;
let ordersWithoutItems = 0;
const orderIdsWithItems = new Set();
orderItems.forEach(i => {
  const oid = i.customerOrderId ? i.customerOrderId.toString() : (i.orderId ? i.orderId.toString() : null);
  if (oid) orderIdsWithItems.add(oid);
});

orders.forEach(o => {
  if (orderIdsWithItems.has(o._id.toString())) ordersWithItems++;
  else ordersWithoutItems++;
});
print(" - Orders with OrderItem records: " + ordersWithItems);
print(" - Orders without OrderItem records: " + ordersWithoutItems);

print("\nAudit completed.");
