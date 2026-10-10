// check-inconsistent-types.js

const listingsBadDiscount = db.marketplaceListings.find({
  discount: { $type: "object" }
}).count();

const listingsBadQuantity = db.marketplaceListings.find({
  quantity: { $type: "object" }
}).count();

const productsBadDiscount = db.Product.find({
  discount: { $type: "object" }
}).count();

const productsBadQuantity = db.Product.find({
  quantity: { $type: "object" }
}).count();

print(JSON.stringify({
  listingsBadDiscount,
  listingsBadQuantity,
  productsBadDiscount,
  productsBadQuantity
}, null, 2));
