// Stage A: Inspection script for User, Companies, Categories, Brands in salesmanprodb
const db = db.getSiblingDB("salesmanprodb");

print("=================================================");
print("STAGE A: USER & OWNED COMPANIES INSPECTION");
print("Timestamp: " + new Date().toISOString());
print("=================================================\n");

// 1. Identify User brendenozie@gmail.com
const user = db.User.findOne({ email: "brendenozie@gmail.com" });
if (!user) {
  print("ERROR: User brendenozie@gmail.com not found!");
} else {
  print("User found:");
  print(" - ID: " + user._id.toString());
  print(" - Email: " + user.email);
  print(" - Name: " + (user.name || "N/A"));
  print(" - Role: " + (user.role || "N/A"));
}

const userId = user ? user._id : null;
const userIdStr = user ? user._id.toString() : "";

// Check company ownership fields in Company collection
// In Prisma/MongoDB, company might be linked via userId, ownerId, createdBy, or members
const sampleCompany = db.Company.findOne();
print("\nSample Company fields: " + Object.keys(sampleCompany || {}).join(", "));

// Find companies linked to this user by userId or ownerId or createdBy
const ownedCompanies = db.Company.find({
  $or: [
    { userId: userId },
    { userId: userIdStr },
    { ownerId: userId },
    { ownerId: userIdStr },
    { createdBy: userId },
    { createdBy: userIdStr }
  ]
}).toArray();

print("\nOwned Companies found for brendenozie@gmail.com: " + ownedCompanies.length);
ownedCompanies.forEach((c, idx) => {
  const prodCount = db.Product.countDocuments({ companyId: c._id });
  const listCount = db.marketplaceListings.countDocuments({ companyId: c._id });
  print((idx + 1) + ". [" + c._id.toString() + "] \"" + (c.name || c.businessName) + "\"");
  print("   Slug: " + (c.slug || c.subdomain || "none") + " | Category: " + (c.businessCategory || c.industry || "none"));
  print("   Store Category ID: " + (c.storeCategoryId || c.categoryId || "none"));
  print("   Inventory Products: " + prodCount + " | Marketplace Listings: " + listCount);
});

// Also check all 78 companies to see ownership breakdown
print("\n--- ALL 78 COMPANIES OWNER AUDIT ---");
const allCompanies = db.Company.find().toArray();
const ownerDistribution = {};
allCompanies.forEach(c => {
  const owner = (c.userId || c.ownerId || c.createdBy || "NO_OWNER").toString();
  ownerDistribution[owner] = (ownerDistribution[owner] || 0) + 1;
});
print("Company count by owner ID:");
for (const [owner, count] of Object.entries(ownerDistribution)) {
  const isTarget = (owner === userIdStr || owner === (userId ? userId.toString() : ""));
  print(" - Owner " + owner + (isTarget ? " (TARGET: brendenozie@gmail.com)" : "") + ": " + count + " companies");
}

// 2. Canonical Product Taxonomy Inspection
print("\n--- CANONICAL TAXONOMY INSPECTION ---");
const prodCatCount = db.ProductCategory.countDocuments();
const storeCatCount = db.StoreCategory.countDocuments();
print("ProductCategory count: " + prodCatCount);
print("StoreCategory count: " + storeCatCount);

const prodCats = db.ProductCategory.find().toArray();
print("\nProduct Categories in DB:");
prodCats.forEach((pc, idx) => {
  const subCats = pc.subCategories || [];
  print((idx + 1) + ". [" + pc._id.toString() + "] " + pc.name + " (slug: " + (pc.slug || "none") + ") - Subcategories: " + subCats.length);
  if (subCats.length > 0) {
    subCats.forEach(sc => {
      print("     - [" + (sc._id ? sc._id.toString() : (sc.id || "no-id")) + "] " + (sc.name || sc.title));
    });
  }
});

const storeCats = db.StoreCategory.find().toArray();
print("\nStore Categories in DB:");
storeCats.forEach((sc, idx) => {
  print((idx + 1) + ". [" + sc._id.toString() + "] " + sc.name + " (slug: " + (sc.slug || "none") + ")");
});

// Check if a Brand collection exists
const collections = db.getCollectionNames();
const brandCollExists = collections.some(c => c.toLowerCase().includes("brand"));
print("\nBrand collection exists in DB: " + brandCollExists);
if (brandCollExists) {
  const brandColls = collections.filter(c => c.toLowerCase().includes("brand"));
  print("Brand collections: " + brandColls.join(", "));
  brandColls.forEach(bc => {
    print(" - " + bc + " count: " + db.getCollection(bc).countDocuments());
  });
}
