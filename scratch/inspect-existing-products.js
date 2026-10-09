const targetUserId = ObjectId("67c5b0182e2372b5f2366dbe");

// Fetch all owned company IDs
const ownedCompanies = db.Company.find({ userId: targetUserId }, { _id: 1, name: 1, slug: 1, category: 1, businessType: 1 }).toArray();
const ownedCompanyIds = ownedCompanies.map(c => c._id.toString());
const companyMap = {};
ownedCompanies.forEach(c => { companyMap[c._id.toString()] = c; });

// Fetch all 15 products
const products = db.Product.find({}).toArray();

const productDetails = products.map(p => {
  const pCompId = p.companyId ? p.companyId.toString() : null;
  const isOwned = ownedCompanyIds.includes(pCompId);
  const comp = companyMap[pCompId] || { name: "External or Unknown" };
  const listingCount = db.marketplaceListings.countDocuments({ productId: p._id });
  return {
    id: p._id.toString(),
    name: p.name,
    companyId: pCompId,
    companyName: comp.name,
    isOwned: isOwned,
    category: p.category,
    subCategoryName: p.subCategoryName,
    productCategoryId: p.productCategoryId ? p.productCategoryId.toString() : null,
    brand: p.brand,
    price: p.price,
    stock: p.stock,
    listingCount: listingCount
  };
});

print(JSON.stringify({
  totalProducts: products.length,
  products: productDetails
}, null, 2));
