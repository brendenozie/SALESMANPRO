const targetUserId = ObjectId("67c5b0182e2372b5f2366dbe");

print("=== VERIFYING BATCH 2 INTEGRITY IN DATABASE ===");

const productsCount = db.Product.countDocuments();
const listingsCount = db.marketplaceListings.countDocuments();
const ordersCount = db.CustomerOrder.countDocuments();
const orderItemsCount = db.OrderItem.countDocuments();
const activeListingsCount = db.marketplaceListings.countDocuments({ showOnGhuba: true, isAvailable: true });

print(`Total Products: ${productsCount} (Expected: 39)`);
print(`Total Listings: ${listingsCount} (Expected: 83)`);
print(`Orders: ${ordersCount} (Expected: 196)`);
print(`Order Items: ${orderItemsCount} (Expected: 295)`);
print(`Active Public Listings: ${activeListingsCount} (Expected: 11)`);

if (productsCount !== 39 || listingsCount !== 83 || ordersCount !== 196 || orderItemsCount !== 295 || activeListingsCount !== 11) {
  throw new Error("BATCH 2 INVARIANT ASSERTION FAILED!");
}

const batch2ListingIds = [
  ObjectId("6ac8e1bec23b24b9e6d805dc"),
  ObjectId("6ac8e1bec23b24b9e6d805de"),
  ObjectId("6ac8e1bec23b24b9e6d805e0"),
  ObjectId("6ac8e1bec23b24b9e6d805e2"),
  ObjectId("6ac8e1bec23b24b9e6d805e4"),
  ObjectId("6ac8e1bec23b24b9e6d805e6"),
  ObjectId("6ac8e1bec23b24b9e6d805e8"),
  ObjectId("6ac8e1bec23b24b9e6d805ea"),
  ObjectId("6ac8e1bec23b24b9e6d805ec"),
  ObjectId("6ac8e1bec23b24b9e6d805ee"),
  ObjectId("6ac8e1bec23b24b9e6d805f0"),
  ObjectId("6ac8e1bec23b24b9e6d805f2")
];

const listings = db.marketplaceListings.find({ _id: { $in: batch2ListingIds } }).toArray();
print(`Retrieved ${listings.length} Batch 2 listings for verification.`);

listings.forEach(l => {
  if (!l.productId) throw new Error(`Listing ${l._id} has no productId!`);
  const p = db.Product.findOne({ _id: l.productId });
  if (!p) throw new Error(`Listing ${l._id} links to missing product ${l.productId}!`);
  
  const c = db.Company.findOne({ _id: l.companyId });
  if (!c || c.userId.toString() !== targetUserId.toString()) {
    throw new Error(`Listing ${l._id} company ${l.companyId} not owned by target user!`);
  }

  if (l.category !== p.category || l.subCategoryName !== p.subCategoryName) {
    throw new Error(`Taxonomy mismatch between listing ${l._id} and product ${p._id}!`);
  }

  print(`✓ Listing "${l.name}" (${l._id}) -> Product "${p.name}" (${p._id}) [Company: ${c.name}]`);
});

print("\nALL BATCH 2 INTEGRITY CHECKS PASSED SUCCESSFULLY!");
