// Dump canonical taxonomy and existing products/listings for owned stores
const db = db.getSiblingDB("salesmanprodb");

const user = db.User.findOne({ email: "brendenozie@gmail.com" });
const userId = user._id;

const ownedCompanies = db.Company.find({
  $or: [
    { userId: userId },
    { ownerId: userId },
    { createdBy: userId }
  ]
}).toArray();

const ownedCompIds = ownedCompanies.map(c => c._id);

// 1. All Product Categories with subcategories and brands
const prodCats = db.ProductCategory.find().toArray();
const categoriesTaxonomy = prodCats.map(pc => ({
  id: pc._id.toString(),
  name: pc.name,
  slug: pc.slug,
  subcategories: pc.subcategories || [],
  allBrands: pc.allBrands || []
}));

// 2. All 15 existing Products
const products = db.Product.find({ companyId: { $in: ownedCompIds } }).toArray();

// 3. Existing marketplace listings for owned stores
const listings = db.marketplaceListings.find({ companyId: { $in: ownedCompIds } }).toArray();

// 4. Existing inventory items for owned stores
const inventory = db.InventoryItem.find({ companyId: { $in: ownedCompIds } }).toArray();

const result = {
  categoriesTaxonomy,
  productsCount: products.length,
  products: products.map(p => ({
    id: p._id.toString(),
    name: p.name,
    companyId: p.companyId ? p.companyId.toString() : null,
    productCategoryId: p.productCategoryId ? p.productCategoryId.toString() : null,
    category: p.category,
    subCategory: p.subCategory,
    subCategoryName: p.subCategoryName,
    brand: p.brand,
    costPrice: p.costPrice,
    sellingPrice: p.sellingPrice,
    finalPrice: p.finalPrice,
    quantity: p.quantity,
    images: p.images || []
  })),
  listingsCount: listings.length,
  inventoryCount: inventory.length
};

print("--- BEGIN TAXONOMY DUMP ---");
print(JSON.stringify(result));
print("--- END TAXONOMY DUMP ---");
