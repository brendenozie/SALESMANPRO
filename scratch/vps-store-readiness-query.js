// Query all 78 companies and generate the store readiness matrix
const db = db.getSiblingDB("salesmanprodb");

const targetUser = db.User.findOne({ email: "brendenozie@gmail.com" });
const targetUserId = targetUser ? targetUser._id.toString() : "";

const companies = db.Company.find().toArray();
const storeCategories = db.StoreCategory.find().toArray();
const productCategories = db.ProductCategory.find().toArray();

const storeCatMap = {};
storeCategories.forEach(sc => {
  storeCatMap[sc._id.toString()] = sc.displayName || sc.name;
});

const prodCatMap = {};
productCategories.forEach(pc => {
  prodCatMap[pc._id.toString()] = pc.name;
});

const matrix = companies.map(c => {
  const cid = c._id.toString();
  const owner = (c.userId || c.ownerId || c.createdBy || "").toString();
  const isOwnedByBrenden = (owner === targetUserId);

  const prodCount = db.Product.countDocuments({ companyId: c._id });
  const listCount = db.marketplaceListings.countDocuments({ companyId: c._id });
  const activeListCount = db.marketplaceListings.countDocuments({
    companyId: c._id,
    status: "ACTIVE",
    isAvailable: true,
    showOnGhuba: true
  });

  // Archetype heuristics based on name, slug, industry, store template
  const nameLower = (c.name || c.businessName || "").toLowerCase();
  const slugLower = (c.slug || c.subdomain || "").toLowerCase();
  
  let archetype = "Services & Business";
  if (nameLower.includes("duka yangu") || slugLower.includes("duka-yangu")) archetype = "General Retail & Electronics";
  else if (nameLower.includes("shoe") || slugLower.includes("shoe")) archetype = "Fashion, Footwear & Accessories";
  else if (nameLower.includes("food") || nameLower.includes("restaurant") || slugLower.includes("restaurant")) archetype = "Restaurants & Prepared Food";
  else if (nameLower.includes("estate") || slugLower.includes("real-estate") || nameLower.includes("property")) archetype = "Real Estate & Property";
  else if (nameLower.includes("agrovet") || slugLower.includes("agrovet")) archetype = "Agrovet & Agricultural Supplies";
  else if (nameLower.includes("travel") || nameLower.includes("safari") || slugLower.includes("travel")) archetype = "Travel & Hospitality";
  else if (nameLower.includes("coach") || nameLower.includes("speaking") || nameLower.includes("school") || slugLower.includes("courses")) archetype = "Education, Coaching & Training";
  else if (nameLower.includes("health") || nameLower.includes("clinic") || nameLower.includes("doctor")) archetype = "Healthcare & Pharmacy Retail";
  else if (nameLower.includes("peanut") || nameLower.includes("grocer")) archetype = "Grocery & Food Retail";
  else if (nameLower.includes("glass") || nameLower.includes("spectacle")) archetype = "Optical, Glasses & Accessories";
  else if (nameLower.includes("game") || nameLower.includes("gaming")) archetype = "Gaming & Entertainment Retail";
  else if (nameLower.includes("fitness") || nameLower.includes("gym")) archetype = "Fitness & Wellness";
  else if (nameLower.includes("auto") || nameLower.includes("car") || nameLower.includes("spare")) archetype = "Automotive & Spare Parts";

  // Readiness classification
  let readiness = "Pending Merchant Input";
  if (!isOwnedByBrenden) {
    readiness = "Excluded (Non-Owned Store)";
  } else if (prodCount > 0 || listCount > 0) {
    readiness = "Eligible for Activation (Existing Catalog)";
  } else if (c.isActive !== false && (c.slug || c.subdomain)) {
    readiness = "Ready for Catalog Population";
  } else {
    readiness = "Unconfigured / Skeleton Tenant";
  }

  return {
    id: cid,
    name: c.name || c.businessName || "Unnamed",
    slug: c.slug || c.subdomain || "",
    ownerId: owner,
    isOwnedByBrenden,
    archetype,
    categoryName: c.businessCategory || c.industry || "General",
    isActive: c.isActive !== false,
    status: c.status || "ACTIVE",
    productsCount: prodCount,
    listingsCount: listCount,
    activeGhubaListingsCount: activeListCount,
    readiness
  };
});

print("--- BEGIN STORE READINESS MATRIX ---");
print(JSON.stringify(matrix));
print("--- END STORE READINESS MATRIX ---");
