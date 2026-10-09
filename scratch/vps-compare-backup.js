// Compare Restored Backup against Live Production Database

const prodDb = db.getSiblingDB("salesmanprodb");
const backupDb = db.getSiblingDB("audit_backup_verify_test");

print("=================================================");
print("BACKUP RESTORE VERIFICATION & COMPARISON");
print("Timestamp: " + new Date().toISOString());
print("=================================================\n");

// Collection counts comparison
const collections = ["marketplaceListings", "Product", "CustomerOrder", "OrderItem", "Company", "User", "Category"];

print("Collection Counts Comparison:");
print("Collection \t\t Restored Backup \t Live Prod \t Diff");
collections.forEach(coll => {
  const bCount = backupDb.getCollection(coll).countDocuments();
  const pCount = prodDb.getCollection(coll).countDocuments();
  print(coll.padEnd(20) + "\t " + bCount.toString().padEnd(10) + "\t " + pCount.toString().padEnd(10) + "\t " + (pCount - bCount));
});

// Deep Dive: marketplaceListings in Restored Backup
const bListings = backupDb.marketplaceListings.find().toArray();
const pListings = prodDb.marketplaceListings.find().toArray();

print("\nmarketplaceListings in Backup: " + bListings.length);
print("marketplaceListings in Live Prod: " + pListings.length);
print("Net reduction in marketplaceListings: " + (bListings.length - pListings.length));

// Deep Dive into the 42 "orphaned" OrderItems
print("\n--- Investigating the 42 OrderItems with missing listings ---");
const bOrderItems = backupDb.OrderItem.find().toArray();
const bListingsMap = new Map();
bListings.forEach(l => bListingsMap.set(l._id.toString(), l));

const pListingsMap = new Map();
pListings.forEach(l => pListingsMap.set(l._id.toString(), l));

let itemsMissingInBackup = 0;
let itemsMissingInProdOnly = 0;
let itemsMissingInBoth = 0;

const missingBreakdown = [];

bOrderItems.forEach(item => {
  const lid = item.listingId ? item.listingId.toString() : (item.marketplaceListingId ? item.marketplaceListingId.toString() : null);
  const inBackup = lid && bListingsMap.has(lid);
  const inProd = lid && pListingsMap.has(lid);

  if (!inBackup && !inProd) {
    itemsMissingInBoth++;
    missingBreakdown.push({
      itemId: item._id.toString(),
      orderId: (item.orderId || item.customerOrderId || "").toString(),
      lid: lid,
      title: item.title || item.name,
      createdAt: item.createdAt,
      state: "ALREADY_MISSING_IN_PRE_CLEANUP_BACKUP"
    });
  } else if (inBackup && !inProd) {
    itemsMissingInProdOnly++;
    const bListing = bListingsMap.get(lid);
    missingBreakdown.push({
      itemId: item._id.toString(),
      orderId: (item.orderId || item.customerOrderId || "").toString(),
      lid: lid,
      title: item.title || item.name,
      bListingTitle: bListing ? (bListing.title || bListing.name) : "unknown",
      createdAt: item.createdAt,
      state: "PRESENT_IN_BACKUP_PURGED_IN_PROD"
    });
  }
});

print("OrderItems with missing listing reference analysis:");
print(" - Missing in BOTH backup and live prod (were already missing before cleanup): " + itemsMissingInBoth);
print(" - Present in backup, but missing in live prod (purged in cleanup): " + itemsMissingInProdOnly);

if (itemsMissingInProdOnly > 0) {
  print("\nItems that were present in backup but missing in prod:");
  missingBreakdown.filter(m => m.state === "PRESENT_IN_BACKUP_PURGED_IN_PROD").forEach(m => {
    print("Item ID: " + m.itemId + " | Order: " + m.orderId + " | Listing ID: " + m.lid + " | BListing Title: " + m.bListingTitle);
  });
}

if (itemsMissingInBoth > 0) {
  print("\nSample items that were ALREADY missing listing in pre-cleanup backup:");
  missingBreakdown.filter(m => m.state === "ALREADY_MISSING_IN_PRE_CLEANUP_BACKUP").slice(0, 10).forEach(m => {
    print("Item ID: " + m.itemId + " | Order: " + m.orderId + " | Listing ID: " + m.lid + " | Item Title: " + m.title + " | Created: " + m.createdAt);
  });
}

// Reconcile the 47 distinct listing IDs in OrderItems
const allDistinctOrderLids = new Set();
bOrderItems.forEach(item => {
  const lid = item.listingId ? item.listingId.toString() : (item.marketplaceListingId ? item.marketplaceListingId.toString() : null);
  if (lid) allDistinctOrderLids.add(lid);
});

print("\n--- Distinct Listing IDs in OrderItems Reconciliation ---");
print("Total distinct listing IDs referenced in OrderItem collection: " + allDistinctOrderLids.size);

let inBackupCount = 0;
let inProdCount = 0;
let inBothCount = 0;
let inNeitherCount = 0;

allDistinctOrderLids.forEach(lid => {
  const inB = bListingsMap.has(lid);
  const inP = pListingsMap.has(lid);
  if (inB && inP) inBothCount++;
  else if (inB && !inP) inBackupCount++;
  else if (!inB && !inP) inNeitherCount++;
  else inProdCount++;
});

print(" - Present in BOTH backup and prod: " + inBothCount);
print(" - Present in backup, NOT in prod: " + inBackupCount);
print(" - Present in NEITHER (already non-existent before cleanup): " + inNeitherCount);
print(" - Present in prod, NOT in backup: " + inProdCount);

print("\nVerification complete.");
