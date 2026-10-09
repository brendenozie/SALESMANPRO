const targetUserId = ObjectId("67c5b0182e2372b5f2366dbe");

print("=== VERIFYING EXPANSION INTEGRITY IN DATABASE ===");

// 1. Verify counts
const productsCount = db.Product.countDocuments();
const listingsCount = db.marketplaceListings.countDocuments();
const ordersCount = db.CustomerOrder.countDocuments();
const orderItemsCount = db.OrderItem.countDocuments();
const activeListingsCount = db.marketplaceListings.countDocuments({ showOnGhuba: true, isAvailable: true });

print(`Products: ${productsCount} (Expected: 27)`);
print(`Listings: ${listingsCount} (Expected: 71)`);
print(`Orders: ${ordersCount} (Expected: 196)`);
print(`Order Items: ${orderItemsCount} (Expected: 295)`);
print(`Active Public Listings: ${activeListingsCount} (Expected: 11)`);

if (productsCount !== 27 || listingsCount !== 71 || ordersCount !== 196 || orderItemsCount !== 295 || activeListingsCount !== 11) {
  throw new Error("COUNT ASSERTION FAILED!");
}

// 2. Verify all 13 newly created listings link to existing products
const newListingIds = [
  ObjectId("6ac8de2f7095d311e6d805db"),
  ObjectId("6ac8de2f7095d311e6d805dd"),
  ObjectId("6ac8de2f7095d311e6d805df"),
  ObjectId("6ac8de2f7095d311e6d805e1"),
  ObjectId("6ac8de2f7095d311e6d805e3"),
  ObjectId("6ac8de2f7095d311e6d805e5"),
  ObjectId("6ac8de2f7095d311e6d805e7"),
  ObjectId("6ac8de2f7095d311e6d805e9"),
  ObjectId("6ac8de2f7095d311e6d805eb"),
  ObjectId("6ac8de2f7095d311e6d805ed"),
  ObjectId("6ac8de2f7095d311e6d805ef"),
  ObjectId("6ac8de2f7095d311e6d805f1"),
  ObjectId("6ac8de2f7095d311e6d805f3")
];

const listings = db.marketplaceListings.find({ _id: { $in: newListingIds } }).toArray();
print(`Retrieved ${listings.length} new listings for integrity verification.`);

listings.forEach(l => {
  if (!l.productId) throw new Error(`Listing ${l._id} has no productId!`);
  const p = db.Product.findOne({ _id: l.productId });
  if (!p) throw new Error(`Listing ${l._id} links to missing product ${l.productId}!`);
  
  // Verify company ownership
  const c = db.Company.findOne({ _id: l.companyId });
  if (!c || c.userId.toString() !== targetUserId.toString()) {
    throw new Error(`Listing ${l._id} company ${l.companyId} not owned by target user!`);
  }

  // Verify category consistency
  if (l.category !== p.category || l.subCategoryName !== p.subCategoryName) {
    throw new Error(`Taxonomy mismatch between listing ${l._id} and product ${p._id}!`);
  }

  print(`✓ Listing "${l.name}" (${l._id}) -> Product "${p.name}" (${p._id}) [Company: ${c.name}]`);
});

print("\nALL EXPANSION INTEGRITY CHECKS PASSED SUCCESSFULLY!");
