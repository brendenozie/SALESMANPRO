// scratch/extract-unimaged-products.js
const targetUserId = ObjectId("67c5b0182e2372b5f2366dbe");

const ownedCompanies = db.Company.find({ userId: targetUserId }, { _id: 1, name: 1, slug: 1, category: 1, domain: 1 }).toArray();
const companyMap = {};
ownedCompanies.forEach(c => {
  companyMap[c._id.toString()] = {
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    category: c.category,
    domain: c.domain
  };
});

const ownedCompanyIds = ownedCompanies.map(c => c._id);

// Find all products for owned companies
const products = db.Product.find(
  { companyId: { $in: ownedCompanyIds } },
  { _id: 1, companyId: 1, name: 1, brand: 1, category: 1, subCategory: 1, images: 1, price: 1, stock: 1 }
).toArray();

// Find all marketplace listings for owned companies
const listings = db.marketplaceListings.find(
  { companyId: { $in: ownedCompanyIds } },
  { _id: 1, companyId: 1, productId: 1, name: 1, brand: 1, category: 1, subCategory: 1, images: 1, status: 1, showOnGhuba: 1 }
).toArray();

const productToListings = {};
listings.forEach(l => {
  if (l.productId) {
    const pId = l.productId.toString();
    if (!productToListings[pId]) productToListings[pId] = [];
    productToListings[pId].push({
      id: l._id.toString(),
      images: l.images || [],
      status: l.status,
      showOnGhuba: l.showOnGhuba
    });
  }
});

const unimagedProducts = [];
const imagedProducts = [];

products.forEach(p => {
  const pId = p._id.toString();
  const cId = p.companyId.toString();
  const hasImage = Array.isArray(p.images) && p.images.length > 0 && typeof p.images[0] === 'string' && p.images[0].trim().length > 0;
  
  const pObj = {
    productId: pId,
    companyId: cId,
    storeName: companyMap[cId]?.name || "Unknown",
    storeCategory: companyMap[cId]?.category || "Unknown",
    name: p.name,
    brand: p.brand || null,
    category: p.category || null,
    subCategory: p.subCategory || null,
    images: p.images || [],
    price: p.price,
    stock: p.stock,
    listings: productToListings[pId] || []
  };

  if (hasImage) {
    imagedProducts.push(pObj);
  } else {
    unimagedProducts.push(pObj);
  }
});

print(JSON.stringify({
  totalOwnedProducts: products.length,
  imagedCount: imagedProducts.length,
  unimagedCount: unimagedProducts.length,
  unimagedProducts: unimagedProducts
}));
