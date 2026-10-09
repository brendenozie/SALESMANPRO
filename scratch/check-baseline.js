const targetUserId = ObjectId("67c5b0182e2372b5f2366dbe");

const res = {
  products: db.Product.countDocuments(),
  listings: db.marketplaceListings.countDocuments(),
  activeListings: db.marketplaceListings.countDocuments({ showOnGhuba: true, isAvailable: true }),
  companies: db.Company.countDocuments(),
  ownedCompanies: db.Company.countDocuments({ userId: targetUserId }),
  orders: db.CustomerOrder.countDocuments(),
  orderItems: db.OrderItem.countDocuments()
};

print(JSON.stringify(res, null, 2));
