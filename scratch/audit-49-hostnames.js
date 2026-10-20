// audit-49-hostnames.js
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

print("=== STARTING 49-HOSTNAME AUDIT & TENANT RESOLUTION ===");

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

const results = [];

hostnames.forEach((host, index) => {
  const slug = host.split(".")[0].toLowerCase();
  
  // Resolve company
  let comp = companyByDomain[host] || 
             companyBySlug[slug] || 
             companyBySlug[slug.replace(/-/g, "")] ||
             companyByName[slug.replace(/-/g, " ")] ||
             null;

  if (!comp) {
    // Try regex search
    comp = db.Company.findOne({
      $or: [
        { slug: { $regex: new RegExp(`^${slug}$`, "i") } },
        { domain: { $regex: new RegExp(slug, "i") } },
        { name: { $regex: new RegExp(slug.replace(/-/g, " "), "i") } }
      ]
    });
  }

  const res = {
    index: index + 1,
    hostname: host,
    slug: slug,
    resolved: !!comp,
    companyId: comp ? comp._id.toString() : null,
    companyName: comp ? comp.name : null,
    ownerUserId: comp && comp.userId ? comp.userId.toString() : null,
    isTargetOwner: comp && comp.userId ? (comp.userId.toString() === targetUserId.toString()) : false,
    businessType: comp ? (comp.businessType || comp.companyType || "UNKNOWN") : null,
    template: comp ? (comp.theme || comp.template || null) : null,
    productsCount: 0,
    listingsCount: 0,
    validOfferings: 0,
    draftListings: 0,
    activePublicListings: 0,
    shortfall: 20
  };

  if (comp) {
    const cid = comp._id;
    const products = db.Product.find({ companyId: cid }).toArray();
    const listings = db.marketplaceListings.find({ companyId: cid }).toArray();

    res.productsCount = products.length;
    res.listingsCount = listings.length;

    // Distinct valid products
    const validProds = products.filter(p => p.name && p.sellingPrice !== undefined);
    res.validOfferings = validProds.length;

    listings.forEach(l => {
      if (l.showOnGhuba === true && l.isAvailable === true) {
        res.activePublicListings++;
      } else {
        res.draftListings++;
      }
    });

    res.shortfall = Math.max(0, 20 - res.validOfferings);
  }

  results.push(res);
});

print(JSON.stringify(results, null, 2));

// Summary counts
const resolvedCount = results.filter(r => r.resolved).length;
const ownedCount = results.filter(r => r.isTargetOwner).length;
const externalCount = results.filter(r => r.resolved && !r.isTargetOwner).length;
const unmappedCount = results.filter(r => !r.resolved).length;

print(`\nSUMMARY:`);
print(`Total Hostnames: ${hostnames.length}`);
print(`Resolved: ${resolvedCount}`);
print(`Owned by brendenozie@gmail.com: ${ownedCount}`);
print(`External / Unassigned: ${externalCount}`);
print(`Unmapped / No Company: ${unmappedCount}`);
