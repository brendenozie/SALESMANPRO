// vps-status-check.js
const counts = {
  products: db.Product.countDocuments(),
  listings: db.marketplaceListings.countDocuments(),
  orders: db.CustomerOrder.countDocuments(),
  orderItems: db.OrderItem.countDocuments(),
  activeListings: db.marketplaceListings.countDocuments({ status: "ACTIVE" }),
  targetUserCompanies: db.Company.countDocuments({ userId: ObjectId("67c5b0182e2372b5f2366dbe") }),
  totalCompanies: db.Company.countDocuments()
};
print(JSON.stringify(counts, null, 2));
