// vps-owned-stores-matrix.js
const targetUserId = ObjectId("67c5b0182e2372b5f2366dbe");

const companies = db.Company.find({ userId: targetUserId }, { _id: 1, name: 1, slug: 1, domain: 1, category: 1 }).toArray();

const matrix = companies.map(c => {
  const cId = c._id;
  const listingsCount = db.marketplaceListings.countDocuments({ companyId: cId });
  const activeCount = db.marketplaceListings.countDocuments({ companyId: cId, status: "ACTIVE" });
  const draftCount = db.marketplaceListings.countDocuments({ companyId: cId, status: "DRAFT" });
  const productsCount = db.Product.countDocuments({ companyId: cId });
  const shortfall = Math.max(0, 20 - listingsCount);

  return {
    id: cId.toString(),
    name: c.name || c.slug || "Unnamed",
    slug: c.slug || "",
    category: c.category || "",
    listingsCount,
    activeCount,
    draftCount,
    productsCount,
    shortfall,
    atTarget: shortfall === 0
  };
});

matrix.sort((a, b) => b.shortfall - a.shortfall);

print(JSON.stringify(matrix, null, 2));
