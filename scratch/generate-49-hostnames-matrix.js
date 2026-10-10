// generate-49-hostnames-matrix.js
const targetUserId = ObjectId("67c5b0182e2372b5f2366dbe");

const hostnames = [
  "duka-yangu.salesmanpro.site",
  "shoes-store.salesmanpro.site",
  "ghuba.salesmanpro.site",
  "fashion-store.salesmanpro.site",
  "furniture-store.salesmanpro.site",
  "agrovet.salesmanpro.site",
  "baby-duka.salesmanpro.site",
  "cake-duka.salesmanpro.site",
  "pets-duka.salesmanpro.site",
  "watch-duka.salesmanpro.site",
  "honey-duka.salesmanpro.site",
  "peanut-duka.salesmanpro.site",
  "glasses-duka.salesmanpro.site",
  "gaming-duka.salesmanpro.site",
  "flowers-duka.salesmanpro.site",
  "earphones-duka.salesmanpro.site",
  "groceries-duka.salesmanpro.site",
  "service-provider.salesmanpro.site",
  "booking.salesmanpro.site",
  "portfolio-personal-branding.salesmanpro.site",
  "blog-content.salesmanpro.site",
  "directory-listings.salesmanpro.site",
  "educational-online-courses.salesmanpro.site",
  "nonprofit-community.salesmanpro.site",
  "restaurant-food-delivery.salesmanpro.site",
  "event-ticketing.salesmanpro.site",
  "real-estate.salesmanpro.site",
  "healthcare-clinics.salesmanpro.site",
  "media-entertainment.salesmanpro.site",
  "finance-legal.salesmanpro.site",
  "automotive.salesmanpro.site",
  "travel-tourism.salesmanpro.site",
  "fitness-wellness.salesmanpro.site",
  "marketplace.salesmanpro.site",
  "security-services.salesmanpro.site",
  "security-services-2.salesmanpro.site",
  "3educational-online-courses.salesmanpro.site",
  "2educational-online-courses.salesmanpro.site",
  "logistics.salesmanpro.site",
  "barbershop.salesmanpro.site",
  "executive-coach.salesmanpro.site",
  "public-speaking.salesmanpro.site",
  "flourishhub-2.salesmanpro.site",
  "bike-store.salesmanpro.site",
  "motorcycle-store.salesmanpro.site",
  "property-management.salesmanpro.site",
  "meat-store.salesmanpro.site",
  "hardware-store.salesmanpro.site",
  "books-store.salesmanpro.site"
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
