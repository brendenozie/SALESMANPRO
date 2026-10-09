// Fetch exact prices and descriptions for all 58 listings
const db = db.getSiblingDB("salesmanprodb");

const listings = db.marketplaceListings.find().toArray();
const priceMap = {};

listings.forEach(l => {
  priceMap[l._id.toString()] = {
    id: l._id.toString(),
    name: l.name || l.title,
    sellingPrice: l.sellingPrice,
    finalPrice: l.finalPrice,
    basePrice: l.basePrice,
    costPrice: l.costPrice,
    price: l.price,
    subCategoryName: l.subCategoryName,
    category: l.category,
    brand: l.brand,
    description: (l.description || "").substring(0, 100)
  };
});

print("--- BEGIN PRICE MAP ---");
print(JSON.stringify(priceMap));
print("--- END PRICE MAP ---");
