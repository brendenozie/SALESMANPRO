const liveDb = db.getSiblingDB("salesmanprodb");
const backupDb = db.getSiblingDB("salesmanprodb_verify");

print("=================================================");
print("PRE-POPULATION BACKUP FIELD-LEVEL RECONCILIATION");
print("Timestamp: " + new Date().toISOString());
print("=================================================\n");

// 1. Resolve Target User & Ownership Mapping
const targetUser = liveDb.User.findOne({ email: "brendenozie@gmail.com" });
const targetUserId = targetUser._id.toString();

const allLiveCompanies = liveDb.Company.find({}).toArray();
const ownedCompanyIds = new Set();
const externalCompanyIds = new Set();
const companyOwnershipMap = {};

allLiveCompanies.forEach(c => {
  const cId = c._id.toString();
  const isOwned = (c.userId && c.userId.toString() === targetUserId) ||
                  (c.ownerId && c.ownerId.toString() === targetUserId) ||
                  (c.createdBy && c.createdBy.toString() === targetUserId);
  if (isOwned) {
    ownedCompanyIds.add(cId);
    companyOwnershipMap[cId] = { name: c.name, type: "OWNED" };
  } else {
    externalCompanyIds.add(cId);
    companyOwnershipMap[cId] = { name: c.name, type: "EXTERNAL", owner: (c.userId || c.ownerId || c.createdBy || "NONE").toString() };
  }
});

print("Resolved Companies: " + ownedCompanyIds.size + " Owned, " + externalCompanyIds.size + " External\n");

// Helper to deep compare objects ignoring updatedAt or internal Mongo fields if needed
function diffObjects(obj1, obj2, ignoreKeys = ["updatedAt"]) {
  const diffs = [];
  const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
  allKeys.forEach(k => {
    if (ignoreKeys.includes(k)) return;
    const v1 = obj1 ? obj1[k] : undefined;
    const v2 = obj2 ? obj2[k] : undefined;
    const s1 = JSON.stringify(v1);
    const s2 = JSON.stringify(v2);
    if (s1 !== s2) {
      diffs.push({ key: k, before: v1, after: v2 });
    }
  });
  return diffs;
}

// 2. CustomerOrder Field-Level Diff
print("--- 1. CUSTOMER ORDER INTEGRITY CHECK ---");
const liveOrders = liveDb.CustomerOrder.find({}).toArray();
const backupOrders = backupDb.CustomerOrder.find({}).toArray();
print("Live Orders Count:   " + liveOrders.length);
print("Backup Orders Count: " + backupOrders.length);

let orderDiffsCount = 0;
liveOrders.forEach(o => {
  const bo = backupDb.CustomerOrder.findOne({ _id: o._id });
  if (!bo) {
    orderDiffsCount++;
    print("NEW ORDER NOT IN BACKUP: " + o._id);
  } else {
    const diffs = diffObjects(bo, o);
    if (diffs.length > 0) {
      orderDiffsCount++;
      print("ORDER MODIFIED: " + o._id + " -> " + JSON.stringify(diffs));
    }
  }
});
print("Result CustomerOrder Field-Level Diffs: " + orderDiffsCount + " (TARGET: 0)\n");

// 3. OrderItem Field-Level Diff
print("--- 2. ORDER ITEM INTEGRITY CHECK ---");
const liveItems = liveDb.OrderItem.find({}).toArray();
const backupItems = backupDb.OrderItem.find({}).toArray();
print("Live Items Count:   " + liveItems.length);
print("Backup Items Count: " + backupItems.length);

let itemDiffsCount = 0;
liveItems.forEach(it => {
  const bit = backupDb.OrderItem.findOne({ _id: it._id });
  if (!bit) {
    itemDiffsCount++;
    print("NEW ITEM NOT IN BACKUP: " + it._id);
  } else {
    const diffs = diffObjects(bit, it);
    if (diffs.length > 0) {
      itemDiffsCount++;
      print("ITEM MODIFIED: " + it._id + " -> " + JSON.stringify(diffs));
    }
  }
});
print("Result OrderItem Field-Level Diffs: " + itemDiffsCount + " (TARGET: 0)\n");

// 4. External Merchant Data Protection Check
print("--- 3. EXTERNAL MERCHANT DATA PROTECTION ---");
let externalDiffsCount = 0;
externalCompanyIds.forEach(cId => {
  const lc = liveDb.Company.findOne({ _id: ObjectId(cId) });
  const bc = backupDb.Company.findOne({ _id: ObjectId(cId) });
  const cDiffs = diffObjects(bc, lc);
  if (cDiffs.length > 0) {
    externalDiffsCount++;
    print("EXTERNAL COMPANY MODIFIED: " + cId + " (" + lc.name + ")");
  }

  // Check products belonging to this external company
  const lProds = liveDb.Product.find({ companyId: ObjectId(cId) }).toArray();
  const bProds = backupDb.Product.find({ companyId: ObjectId(cId) }).toArray();
  if (lProds.length !== bProds.length) {
    externalDiffsCount++;
    print("EXTERNAL PRODUCTS COUNT CHANGED for " + cId);
  }
  lProds.forEach(lp => {
    const bp = backupDb.Product.findOne({ _id: lp._id });
    const pDiffs = diffObjects(bp, lp);
    if (pDiffs.length > 0) {
      externalDiffsCount++;
      print("EXTERNAL PRODUCT MODIFIED: " + lp._id);
    }
  });

  // Check listings belonging to this external company
  const lLists = liveDb.marketplaceListings.find({ companyId: ObjectId(cId) }).toArray();
  const bLists = backupDb.marketplaceListings.find({ companyId: ObjectId(cId) }).toArray();
  if (lLists.length !== bLists.length) {
    externalDiffsCount++;
    print("EXTERNAL LISTINGS COUNT CHANGED for " + cId);
  }
  lLists.forEach(ll => {
    const bl = backupDb.marketplaceListings.findOne({ _id: ll._id });
    const lDiffs = diffObjects(bl, ll);
    if (lDiffs.length > 0) {
      externalDiffsCount++;
      print("EXTERNAL LISTING MODIFIED: " + ll._id);
    }
  });
});
print("Result External Merchant Diffs: " + externalDiffsCount + " (TARGET: 0)\n");

// 5. Complete Inventory of All Modified Records in Production
print("--- 4. EXACT MUTATION AUDIT ACROSS ALL COLLECTIONS ---");
const changedListings = [];
const liveAllListings = liveDb.marketplaceListings.find({}).toArray();
liveAllListings.forEach(ll => {
  const bl = backupDb.marketplaceListings.findOne({ _id: ll._id });
  const diffs = diffObjects(bl, ll);
  if (diffs.length > 0) {
    const cId = ll.companyId ? ll.companyId.toString() : "NONE";
    const ownership = companyOwnershipMap[cId] || { name: "UNKNOWN", type: "UNKNOWN" };
    changedListings.push({
      id: ll._id.toString(),
      name: ll.name,
      companyId: cId,
      companyName: ownership.name,
      ownershipType: ownership.type,
      diffs: diffs
    });
  }
});

const changedProducts = [];
const liveAllProducts = liveDb.Product.find({}).toArray();
liveAllProducts.forEach(lp => {
  const bp = backupDb.Product.findOne({ _id: lp._id });
  const diffs = diffObjects(bp, lp);
  if (diffs.length > 0) {
    const cId = lp.companyId ? lp.companyId.toString() : "NONE";
    const ownership = companyOwnershipMap[cId] || { name: "UNKNOWN", type: "UNKNOWN" };
    changedProducts.push({
      id: lp._id.toString(),
      name: lp.name,
      companyId: cId,
      companyName: ownership.name,
      ownershipType: ownership.type,
      diffs: diffs
    });
  }
});

print("Total marketplaceListings Changed: " + changedListings.length);
changedListings.forEach((cl, i) => {
  print((i+1) + ". [" + cl.ownershipType + " - " + cl.companyName + "] " + cl.name + " (" + cl.id + "):");
  cl.diffs.forEach(d => {
    print("    - " + d.key + ": " + JSON.stringify(d.before) + " -> " + JSON.stringify(d.after));
  });
});
print("");

print("Total Products Changed: " + changedProducts.length);
changedProducts.forEach((cp, i) => {
  print((i+1) + ". [" + cp.ownershipType + " - " + cp.companyName + "] " + cp.name + " (" + cp.id + "):");
  cp.diffs.forEach(d => {
    print("    - " + d.key + ": " + JSON.stringify(d.before) + " -> " + JSON.stringify(d.after));
  });
});
print("");

// 6. Reconcile the 14 Public Ghuba Listings
print("--- 5. RECONCILIATION OF 14 PUBLIC GHUBA SEARCH RESULTS ---");
const publicListings = liveDb.marketplaceListings.find({ showOnGhuba: true, isAvailable: true }).toArray();
print("Count of Public Listings: " + publicListings.length + "\n");
publicListings.forEach((pl, idx) => {
  const comp = liveDb.Company.findOne({ _id: pl.companyId }, { name: 1, slug: 1, userId: 1 });
  const compName = comp ? comp.name : "UNKNOWN";
  const compSlug = comp ? comp.slug : "UNKNOWN";
  const imgList = pl.images || [];
  print((idx + 1) + ". Listing ID: " + pl.id);
  print("   Name:             " + pl.name);
  print("   Store:            " + compName + " (/store/" + compSlug + ")");
  print("   Category:         " + pl.category + " (ID: " + (pl.productCategoryId || "null") + ")");
  print("   SubCategory:      " + (pl.subCategoryName || "null"));
  print("   Brand:            " + (pl.brand || "null"));
  print("   Price:            KES " + pl.price);
  print("   Image Count:      " + imgList.length);
  if (imgList.length > 0) {
    print("   Sample Image:     " + imgList[0]);
  } else {
    print("   Sample Image:     NONE (Service/Directory listing without product photos)");
  }
  print("   Approval Status:  " + (pl.status || "APPROVED"));
  print("");
});

print("=================================================");
print("BACKUP DIFF AUDIT COMPLETE");
print("=================================================");
