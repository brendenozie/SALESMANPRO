const db = db.getSiblingDB("salesmanprodb");

const user = db.User.findOne({ email: "brendenozie@gmail.com" });
const userId = user ? user._id : null;
const userIdStr = user ? user._id.toString() : "";

// Check all possible ownership fields in Company
const owned = db.Company.find({
  $or: [
    { userId: userId },
    { userId: userIdStr },
    { ownerId: userId },
    { ownerId: userIdStr },
    { createdBy: userId },
    { createdBy: userIdStr }
  ]
}).toArray();

const result = {
  user: user ? { id: user._id.toString(), email: user.email, name: user.name, role: user.role } : null,
  ownedCompaniesCount: owned.length,
  ownedCompanies: owned.map(c => {
    const prodCount = db.Product.countDocuments({ companyId: c._id });
    const listCount = db.marketplaceListings.countDocuments({ companyId: c._id });
    return {
      id: c._id.toString(),
      name: c.name || c.businessName || "Unnamed",
      slug: c.slug || c.subdomain || "",
      category: c.businessCategory || c.industry || "",
      storeCategoryId: c.storeCategoryId ? c.storeCategoryId.toString() : null,
      isActive: c.isActive,
      status: c.status,
      productsCount: prodCount,
      listingsCount: listCount
    };
  })
};

// Also inspect ProductCategory schema
const prodCats = db.ProductCategory.find().toArray();
result.productCategories = prodCats.map(pc => ({
  id: pc._id.toString(),
  name: pc.name,
  slug: pc.slug,
  subCategories: (pc.subCategories || []).map(sc => ({
    id: sc._id ? sc._id.toString() : (sc.id || ""),
    name: sc.name || sc.title
  }))
}));

// Also inspect StoreCategory
const storeCats = db.StoreCategory.find().toArray();
result.storeCategories = storeCats.map(sc => ({
  id: sc._id.toString(),
  name: sc.name,
  slug: sc.slug
}));

print("--- BEGIN STAGE A DATA ---");
print(JSON.stringify(result));
print("--- END STAGE A DATA ---");
