// audit-49-hostnames.js
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
