// final-audit-report.js
const targetUserId = ObjectId("67c5b0182e2372b5f2366dbe");

const orders = db.CustomerOrder.countDocuments();
const orderItems = db.OrderItem.countDocuments();
const products = db.Product.countDocuments();
const listings = db.marketplaceListings.countDocuments();
const activeListings = db.marketplaceListings.countDocuments({ status: "ACTIVE" });
const draftListings = db.marketplaceListings.countDocuments({ status: "DRAFT" });

const ownedCompanies = db.Company.find({ userId: targetUserId }, { _id: 1, name: 1, slug: 1, category: 1 }).toArray();
const externalCompanies = db.Company.find({ userId: { $ne: targetUserId } }, { _id: 1 }).toArray();

const externalCompanyIds = externalCompanies.map(c => c._id);
const externalListings = db.marketplaceListings.countDocuments({ companyId: { $in: externalCompanyIds } });

let storesMeetingTarget = 0;
let storesBelowTarget = 0;
const storeDetails = [];

ownedCompanies.forEach(c => {
  const cnt = db.marketplaceListings.countDocuments({ companyId: c._id });
  const pCnt = db.Product.countDocuments({ companyId: c._id });
  const actCnt = db.marketplaceListings.countDocuments({ companyId: c._id, status: "ACTIVE" });
  const drfCnt = db.marketplaceListings.countDocuments({ companyId: c._id, status: "DRAFT" });

  if (cnt >= 20) {
    storesMeetingTarget++;
  } else {
    storesBelowTarget++;
  }

  storeDetails.push({
    id: c._id.toString(),
    name: c.name,
    category: c.category || "N/A",
    totalListings: cnt,
    activeListings: actCnt,
    draftListings: drfCnt,
    products: pCnt,
    meetsTarget: cnt >= 20
  });
});

const report = {
  timestamp: new Date().toISOString(),
  targetUser: {
    id: targetUserId.toString(),
    email: "brendenozie@gmail.com"
  },
  invariants: {
    orders: { current: orders, expected: 196, status: orders === 196 ? "PASSED" : "FAILED" },
    orderItems: { current: orderItems, expected: 295, status: orderItems === 295 ? "PASSED" : "FAILED" },
    externalMerchantListings: { current: externalListings, baseline: 5, status: externalListings === 5 ? "PASSED" : "FAILED" }
  },
  catalogSummary: {
    totalProducts: products,
    totalListings: listings,
    activeListings: activeListings,
    draftListings: draftListings,
    ownedStoresCount: ownedCompanies.length,
    storesMeeting20Target: storesMeetingTarget,
    storesBelowTarget: storesBelowTarget
  },
  storeDetails: storeDetails.slice(0, 20) // sample of stores
};

print(JSON.stringify(report, null, 2));
