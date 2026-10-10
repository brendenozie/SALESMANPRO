// audit-image-inventory.js
const targetUserId = ObjectId("67c5b0182e2372b5f2366dbe");

const ownedCompanies = db.Company.find({ userId: targetUserId }, { _id: 1, name: 1, slug: 1, category: 1, domain: 1 }).toArray();
const ownedCompanyIdSet = new Set(ownedCompanies.map(c => c._id.toString()));

print(`Auditing Image Coverage for ${ownedCompanies.length} owned companies...`);

let totalProducts = 0;
let productsWithImages = 0;
let productsWithoutImages = 0;

let totalListings = 0;
let listingsWithImages = 0;
let listingsWithoutImages = 0;

const domainCounts = {};
const existingSampleUrls = [];

const storeBreakdown = [];

ownedCompanies.forEach(comp => {
  const cId = comp._id;
  
  const products = db.Product.find({ companyId: cId }, { _id: 1, name: 1, category: 1, images: 1 }).toArray();
  const listings = db.marketplaceListings.find({ companyId: cId }, { _id: 1, name: 1, category: 1, images: 1, productId: 1, status: 1 }).toArray();

  let pWith = 0;
  let pWithout = 0;
  products.forEach(p => {
    totalProducts++;
    if (Array.isArray(p.images) && p.images.length > 0 && typeof p.images[0] === 'string' && p.images[0].trim().length > 0) {
      pWith++;
      productsWithImages++;
      try {
        const u = new URL(p.images[0]);
        domainCounts[u.hostname] = (domainCounts[u.hostname] || 0) + 1;
        if (existingSampleUrls.length < 15) {
          existingSampleUrls.push({ store: comp.name, name: p.name, url: p.images[0] });
        }
      } catch (e) {
        domainCounts["invalid_url"] = (domainCounts["invalid_url"] || 0) + 1;
      }
    } else {
      pWithout++;
      productsWithoutImages++;
    }
  });

  let lWith = 0;
  let lWithout = 0;
  listings.forEach(l => {
    totalListings++;
    if (Array.isArray(l.images) && l.images.length > 0 && typeof l.images[0] === 'string' && l.images[0].trim().length > 0) {
      lWith++;
      listingsWithImages++;
    } else {
      lWithout++;
      listingsWithoutImages++;
    }
  });

  storeBreakdown.push({
    id: cId.toString(),
    name: comp.name,
    category: comp.category || "N/A",
    totalProducts: products.length,
    productsWithImages: pWith,
    productsWithoutImages: pWithout,
    totalListings: listings.length,
    listingsWithImages: lWith,
    listingsWithoutImages: lWithout
  });
});

const report = {
  timestamp: new Date().toISOString(),
  targetUserId: targetUserId.toString(),
  ownedCompaniesCount: ownedCompanies.length,
  totals: {
    totalProducts,
    productsWithImages,
    productsWithoutImages,
    totalListings,
    listingsWithImages,
    listingsWithoutImages
  },
  domainCounts,
  sampleExistingImages: existingSampleUrls,
  storeBreakdown
};

print(JSON.stringify(report, null, 2));
