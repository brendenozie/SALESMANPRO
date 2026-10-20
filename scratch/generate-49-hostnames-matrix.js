// generate-49-hostnames-matrix.js
const targetUserId = ObjectId("67c5b0182e2372b5f2366dbe");

const hostnames = [
  "duka-yangu.salesmanpro.store",
  "shoes-store.salesmanpro.store",
  "ghuba.salesmanpro.store",
  "fashion-store.salesmanpro.store",
  "furniture-store.salesmanpro.store",
  "agrovet.salesmanpro.store",
  "baby-duka.salesmanpro.store",
  "cake-duka.salesmanpro.store",
  "pets-duka.salesmanpro.store",
  "watch-duka.salesmanpro.store",
  "honey-duka.salesmanpro.store",
  "peanut-duka.salesmanpro.store",
  "glasses-duka.salesmanpro.store",
  "gaming-duka.salesmanpro.store",
  "flowers-duka.salesmanpro.store",
  "earphones-duka.salesmanpro.store",
  "groceries-duka.salesmanpro.store",
  "service-provider.salesmanpro.store",
  "booking.salesmanpro.store",
  "portfolio-personal-branding.salesmanpro.store",
  "blog-content.salesmanpro.store",
  "directory-listings.salesmanpro.store",
  "educational-online-courses.salesmanpro.store",
  "nonprofit-community.salesmanpro.store",
  "restaurant-food-delivery.salesmanpro.store",
  "event-ticketing.salesmanpro.store",
  "real-estate.salesmanpro.store",
  "healthcare-clinics.salesmanpro.store",
  "media-entertainment.salesmanpro.store",
  "finance-legal.salesmanpro.store",
  "automotive.salesmanpro.store",
  "travel-tourism.salesmanpro.store",
  "fitness-wellness.salesmanpro.store",
  "marketplace.salesmanpro.store",
  "security-services.salesmanpro.store",
  "security-services-2.salesmanpro.store",
  "3educational-online-courses.salesmanpro.store",
  "2educational-online-courses.salesmanpro.store",
  "logistics.salesmanpro.store",
  "barbershop.salesmanpro.store",
  "executive-coach.salesmanpro.store",
  "public-speaking.salesmanpro.store",
  "flourishhub-2.salesmanpro.store",
  "bike-store.salesmanpro.store",
  "motorcycle-store.salesmanpro.store",
  "property-management.salesmanpro.store",
  "meat-store.salesmanpro.store",
  "hardware-store.salesmanpro.store",
  "books-store.salesmanpro.store"
];

const aliasMap = {
  "bike-store": "bike-duka",
  "motorcycle-store": "motorcycle-duka",
  "books-store": "book-store",
  "flourishhub-2": "flourishhub"
};

const allCompanies = db.Company.find({}).toArray();
const companyBySlug = {};
const companyByDomain = {};
const companyByName = {};

allCompanies.forEach(c => {
  if (c.slug) companyBySlug[c.slug.toLowerCase()] = c;
  if (c.domain) companyByDomain[c.domain.toLowerCase()] = c;
  if (c.subdomain) companyByDomain[c.subdomain.toLowerCase()] = c;
  if (c.name) companyByName[c.name.toLowerCase()] = c;
});

const matrix = [];
const seenCompanies = new Set();

hostnames.forEach((host, idx) => {
  let slug = host.split(".")[0].toLowerCase();
  if (aliasMap[slug]) slug = aliasMap[slug];

  let comp = companyByDomain[host] || 
             companyBySlug[slug] || 
             companyBySlug[slug.replace(/-/g, "")] ||
             companyByName[slug.replace(/-/g, " ")] ||
             null;

  if (!comp) {
    comp = db.Company.findOne({
      $or: [
        { slug: { $regex: new RegExp(`^${slug}$`, "i") } },
        { domain: { $regex: new RegExp(slug, "i") } },
        { name: { $regex: new RegExp(slug.replace(/-/g, " "), "i") } }
      ]
    });
  }

  if (!comp) {
    matrix.push({
      index: idx + 1,
      hostname: host,
      slug: slug,
      resolved: false,
      companyId: null,
      companyName: null,
      isTargetOwner: false,
      businessType: "UNKNOWN",
      existingOfferings: 0,
      shortfall: 20
    });
    return;
  }

  const cid = comp._id;
  const isTargetOwner = comp.userId && comp.userId.toString() === targetUserId.toString();
  
  const products = db.Product.find({ companyId: cid }).toArray();
  const listings = db.marketplaceListings.find({ companyId: cid }).toArray();

  const validProducts = products.filter(p => p.name && (p.sellingPrice !== undefined || p.buyingPrice !== undefined));
  const validListings = listings.filter(l => l.name);

  // Offerings count: Max of valid products or linked valid listings
  const distinctOfferings = Math.max(validProducts.length, validListings.length);
  const shortfall = Math.max(0, 20 - distinctOfferings);

  matrix.push({
    index: idx + 1,
    hostname: host,
    slug: slug,
    resolved: true,
    companyId: cid.toString(),
    companyName: comp.name,
    isTargetOwner: isTargetOwner,
    businessType: comp.businessType || comp.companyType || "RETAIL",
    productsCount: products.length,
    listingsCount: listings.length,
    distinctOfferings: distinctOfferings,
    shortfall: shortfall,
    isDuplicateCompany: seenCompanies.has(cid.toString())
  });

  seenCompanies.add(cid.toString());
});

print(JSON.stringify(matrix, null, 2));
