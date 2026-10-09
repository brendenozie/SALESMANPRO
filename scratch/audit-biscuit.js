const db = db.getSiblingDB("salesmanprodb");

const dupBiscuitId = ObjectId("68ef880790cac14a0f2897a9");
const primBiscuitId = ObjectId("68e17a8016ac60978dc272ed");

print("=== BISCUIT RECONCILIATION & AUDIT ===");

const dupListing = db.marketplaceListings.findOne({ _id: dupBiscuitId });
const primListing = db.marketplaceListings.findOne({ _id: primBiscuitId });

print("Primary Biscuit Listing:");
print("  ID: " + primListing._id);
print("  Name: " + primListing.name);
print("  productId: " + primListing.productId);
print("  showOnGhuba: " + primListing.showOnGhuba);
print("  isAvailable: " + primListing.isAvailable);
print("  sellingPrice: " + primListing.sellingPrice);
print("  stock: " + primListing.stock);

print("Duplicate Biscuit Listing:");
print("  ID: " + dupListing._id);
print("  Name: " + dupListing.name);
print("  productId: " + dupListing.productId);
print("  showOnGhuba: " + dupListing.showOnGhuba);
print("  isAvailable: " + dupListing.isAvailable);
print("  sellingPrice: " + dupListing.sellingPrice);
print("  stock: " + dupListing.stock);

// Check Order Items referencing either
const dupOrders = db.OrderItem.find({ $or: [{ listingId: dupBiscuitId.toString() }, { productId: dupListing.productId ? dupListing.productId.toString() : "none" }] }).toArray();
const primOrders = db.OrderItem.find({ $or: [{ listingId: primBiscuitId.toString() }, { productId: primListing.productId ? primListing.productId.toString() : "none" }] }).toArray();

print("Order Items referencing Duplicate: " + dupOrders.length);
print("Order Items referencing Primary:   " + primOrders.length);

// Check Inventory Logs
const dupInv = db.InventoryLog.find({ productId: dupListing.productId }).toArray();
const primInv = db.InventoryLog.find({ productId: primListing.productId }).toArray();
print("Inventory Logs for Duplicate: " + dupInv.length);
print("Inventory Logs for Primary:   " + primInv.length);

print("=== BISCUIT AUDIT COMPLETE ===");
