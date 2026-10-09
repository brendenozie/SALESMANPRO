const p = db.Product.findOne({ name: "Tronic 1.5mm Electrical cable" }) || db.Product.findOne();
const l = db.marketplaceListings.findOne({ name: "Tronic 1.5mm Cable" }) || db.marketplaceListings.findOne();

print("=== PRODUCT SAMPLE ===");
print(JSON.stringify(p, null, 2));

print("=== LISTING SAMPLE ===");
print(JSON.stringify(l, null, 2));
