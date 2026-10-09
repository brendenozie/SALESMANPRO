// Detailed Census and Quality Audit Script for SalesmanPro / Ghuba
const db = db.getSiblingDB("salesmanprodb");

print("=== STARTING DETAILED CENSUS & CATALOG QUALITY AUDIT ===");

const listings = db.marketplaceListings.find().toArray();
const companies = db.Company.find().toArray();
const compMap = {};
companies.forEach(c => {
  compMap[c._id.toString()] = {
    id: c._id.toString(),
    name: c.name || c.businessName || "Unnamed",
    slug: c.slug || c.subdomain || "",
    category: c.businessCategory || c.industry || ""
  };
});

const products = db.Product.find().toArray();
const prodMap = {};
products.forEach(p => {
  prodMap[p._id.toString()] = p;
});

const orderItems = db.OrderItem.find().toArray();
const orderItemCounts = {};
orderItems.forEach(i => {
  const lid = i.listingId ? i.listingId.toString() : (i.marketplaceListingId ? i.marketplaceListingId.toString() : null);
  if (lid) {
    orderItemCounts[lid] = (orderItemCounts[lid] || 0) + 1;
  }
});

const census = listings.map(l => {
  const id = l._id.toString();
  const c = compMap[l.companyId ? l.companyId.toString() : ""] || { name: "Unknown", slug: "", category: "" };
  const prod = prodMap[l.productId ? l.productId.toString() : ""];
  const orders = orderItemCounts[id] || 0;
  const isVis = (l.status === "ACTIVE" && l.isAvailable === true && l.showOnGhuba === true);
  const isArch = (l.status === "INACTIVE");

  let group = "OTHER";
  if (isVis) group = "PUBLICLY_VISIBLE";
  else if (isArch) group = "INACTIVE_ORDER_PRESERVED";

  return {
    id,
    title: l.title || l.name,
    group,
    status: l.status,
    isAvailable: l.isAvailable,
    showOnGhuba: l.showOnGhuba,
    price: l.price,
    companyId: l.companyId ? l.companyId.toString() : null,
    companyName: c.name,
    category: l.category || (prod ? prod.category : null) || c.category,
    subcategory: l.subcategory || (prod ? prod.subcategory : null),
    brand: l.brand || (prod ? prod.brand : null),
    productId: l.productId ? l.productId.toString() : null,
    productTitle: prod ? (prod.title || prod.name) : null,
    ordersCount: orders,
    images: l.images || [],
    createdAt: l.createdAt,
    updatedAt: l.updatedAt
  };
});

print("TOTAL_LISTINGS: " + census.length);
print("VISIBLE_COUNT: " + census.filter(c => c.group === "PUBLICLY_VISIBLE").length);
print("INACTIVE_COUNT: " + census.filter(c => c.group === "INACTIVE_ORDER_PRESERVED").length);
print("OTHER_COUNT: " + census.filter(c => c.group === "OTHER").length);

// Output JSON for downstream parsing
print("--- BEGIN JSON CENSUS ---");
print(JSON.stringify(census));
print("--- END JSON CENSUS ---");
