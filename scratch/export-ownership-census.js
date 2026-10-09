const db = db.getSiblingDB("salesmanprodb");

const targetUser = db.User.findOne({ email: "brendenozie@gmail.com" });
const targetUserId = targetUser._id.toString();

const allCompanies = db.Company.find({}).toArray();

const owned = [];
const external = [];

allCompanies.forEach(c => {
  const cId = c._id.toString();
  let rel = null;
  if (c.userId && c.userId.toString() === targetUserId) rel = "userId";
  else if (c.ownerId && c.ownerId.toString() === targetUserId) rel = "ownerId";
  else if (c.createdBy && c.createdBy.toString() === targetUserId) rel = "createdBy";

  const pCount = db.Product.countDocuments({ companyId: c._id });
  const lCount = db.marketplaceListings.countDocuments({ companyId: c._id });

  if (rel) {
    owned.push({
      companyId: cId,
      name: c.name,
      slug: c.slug,
      qualifiedBy: rel,
      targetUserId: targetUserId,
      productCount: pCount,
      listingCount: lCount
    });
  } else {
    external.push({
      companyId: cId,
      name: c.name,
      slug: c.slug,
      actualOwnerId: (c.userId || c.ownerId || c.createdBy || "UNASSIGNED").toString(),
      productCount: pCount,
      listingCount: lCount
    });
  }
});

const report = {
  timestamp: new Date().toISOString(),
  targetUser: {
    id: targetUserId,
    email: targetUser.email,
    name: targetUser.name
  },
  summary: {
    totalCompanies: allCompanies.length,
    ownedCompaniesCount: owned.length,
    externalCompaniesCount: external.length
  },
  ownedCompanies: owned,
  externalCompanies: external
};

print(JSON.stringify(report, null, 2));
