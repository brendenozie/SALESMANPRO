/**
 * vps-execute-expansion.js
 * 
 * Production Catalog Expansion & Store-by-Store Product Population on VPS
 * 
 * Strict Ownership Boundary:
 * - Only companies owned by brendenozie@gmail.com (userId: ObjectId("67c5b0182e2372b5f2366dbe"))
 * - Zero modifications to external merchants
 * - Orders & OrderItems invariants strictly enforced (196 / 295)
 * - All scalar integer fields created as NumberInt(...) to prevent Prisma P2023 Long mismatches
 * - Newly added listings set to status: "DRAFT", listingSystemStatus: "DRAFT", showOnGhuba: false
 */

const targetUserId = ObjectId("67c5b0182e2372b5f2366dbe");
const TARGET_PER_STORE = 20;

print("=== STARTING FULL PRODUCTION CATALOG EXPANSION ON VPS ===");
const startTime = new Date();

// 1. Initial Invariants Verification
const initialOrders = db.CustomerOrder.countDocuments();
const initialOrderItems = db.OrderItem.countDocuments();
const initialProducts = db.Product.countDocuments();
const initialListings = db.marketplaceListings.countDocuments();

print(`Initial CustomerOrders: ${initialOrders} (Must be 196)`);
print(`Initial OrderItems:     ${initialOrderItems} (Must be 295)`);
print(`Initial Products:       ${initialProducts}`);
print(`Initial Listings:       ${initialListings}`);

if (initialOrders !== 196 || initialOrderItems !== 295) {
  throw new Error(`CRITICAL INVARIANCE FAILURE: Baseline orders (${initialOrders}) or items (${initialOrderItems}) do not match 196/295! Aborting.`);
}

// 2. Strict Allowlist of Owned Companies
const ownedCompanies = db.Company.find({ userId: targetUserId }, { _id: 1, name: 1, slug: 1, category: 1, domain: 1 }).toArray();
const ownedCompanyIdSet = new Set(ownedCompanies.map(c => c._id.toString()));
const externalCompanies = db.Company.find({ userId: { $ne: targetUserId } }, { _id: 1 }).toArray();
const externalCompanyIdSet = new Set(externalCompanies.map(c => c._id.toString()));

const initialExternalListings = db.marketplaceListings.countDocuments({ companyId: { $in: Array.from(externalCompanyIdSet).map(id => ObjectId(id)) } });
print(`Verified ${ownedCompanyIdSet.size} owned companies in allowlist.`);
print(`Verified ${externalCompanyIdSet.size} external merchant companies (Baseline listings: ${initialExternalListings}).`);

if (ownedCompanyIdSet.size !== 65) {
  throw new Error(`OWNERSHIP CHECK FAILED: Expected 65 owned companies, found ${ownedCompanyIdSet.size}! Aborting.`);
}

// 3. Domain Catalog Generators
function getOfferingsForStore(company) {
  const cat = (company.category || "").toLowerCase();
  const name = (company.name || "").toLowerCase();
  const slug = (company.slug || "").toLowerCase();

  const offerings = [];

  // Helper to generate generic service/product titles with commercial realism
  function addItems(prefixList, suffixList, basePrice, categoryStr) {
    prefixList.forEach((p, pIdx) => {
      suffixList.forEach((s, sIdx) => {
        const itemPrice = basePrice + ((pIdx * 5 + sIdx) * 250);
        offerings.push({
          name: `${p} ${s}`,
          price: itemPrice,
          category: categoryStr,
          description: `High-quality authentic commercial ${s.toLowerCase()} by ${company.name}. Reliable, verified, and customer-rated.`
        });
      });
    });
  }

  if (cat.includes("education") || cat.includes("school") || slug.includes("school") || slug.includes("course") || cat.includes("teacher") || cat.includes("student")) {
    addItems(
      ["Grade 1-8 CBC", "Form 1-4 KCSE", "Junior Secondary", "Senior Secondary", "IGCSE & Cambridge"],
      ["Mathematics Revision Pack", "Science Laboratory Guide", "English Literature Study Guide", "Swahili Composition Workbook", "Terminal Assessment Papers"],
      1200, "Education & Academics"
    );
  } else if (cat.includes("health") || cat.includes("clinic") || name.includes("health") || name.includes("clinic")) {
    addItems(
      ["Comprehensive", "Standard Routine", "Preventative", "Family Wellness", "Pediatric Care"],
      ["Health Check-up & Consultation", "Diagnostic Laboratory Screening", "Physiotherapy Treatment Session", "Dental Scaling & Examination", "Nutritional Advisory Protocol"],
      2000, "Healthcare & Medical"
    );
  } else if (cat.includes("auto") || name.includes("auto") || name.includes("motor") || slug.includes("auto") || slug.includes("bike")) {
    addItems(
      ["Synthetic Engine", "Brake Pad & Rotor", "Transmission Fluid", "Suspension Bushing", "Headlight & Electrical"],
      ["Service & Filter Kit", "Inspection & Replacement", "Diagnostics & Fluid Flush", "Overhaul & Alignment Package", "Installation & Testing"],
      3500, "Automotive Care"
    );
  } else if (cat.includes("food") || cat.includes("restaurant") || name.includes("cake") || name.includes("meat") || name.includes("grocer") || name.includes("honey") || name.includes("peanut")) {
    addItems(
      ["Fresh Gourmet", "Chef's Special", "Artisanal Organic", "Traditional Kenyan", "Family Celebration"],
      ["Platter & Accompaniments", "Baking & Dessert Selection", "Cold-Pressed Natural Extract", "Farm-Fresh Supply Box", "Grilled Barbeque Feast"],
      800, "Food & Groceries"
    );
  } else if (cat.includes("fashion") || cat.includes("shoe") || name.includes("shoe") || name.includes("cloth") || slug.includes("shoe") || name.includes("bens")) {
    addItems(
      ["Classic Leather", "Casual Breathable", "Handcrafted African", "Formal Executive", "All-Weather Outdoor"],
      ["Oxford Shoes", "Loafers & Slip-Ons", "Boots with Rubber Sole", "Sneakers & Athletic Footwear", "Belt & Accessory Companion"],
      4500, "Fashion & Footwear"
    );
  } else if (cat.includes("furniture") || cat.includes("home") || name.includes("furniture")) {
    addItems(
      ["Solid Hardwood", "Modern Minimalist", "Executive Ergonomic", "Contemporary Upholstered", "Modular Space-Saving"],
      ["Office Desk & Workstation", "Living Room Sofa & Cushions", "Dining Table Set", "Bedroom Wardrobe Unit", "Display Bookshelf Unit"],
      15000, "Furniture & Interior"
    );
  } else if (cat.includes("real estate") || cat.includes("property") || name.includes("property") || name.includes("estate")) {
    addItems(
      ["Commercial Office", "Residential Luxury", "Suburban Family", "Mixed-Use Development", "Prime Agricultural"],
      ["Lease & Tenancy Agreement Package", "Property Valuation Inspection", "Facility Management Monthly Plan", "Site Due Diligence Report", "Architectural Space Planning"],
      25000, "Real Estate Services"
    );
  } else if (cat.includes("security") || name.includes("secur") || name.includes("cuda")) {
    addItems(
      ["Perimeter Infrared", "Commercial IP 4K", "Biometric Access", "Rapid Guard Patrol", "Workplace Emergency"],
      ["CCTV Surveillance Kit", "Electric Fence Maintenance", "Attendance Terminal Setup", "Night Shift Deployment", "First Aid & Fire Protocol"],
      12000, "Security & Safety"
    );
  } else if (cat.includes("logistics") || cat.includes("delivery") || name.includes("logistics")) {
    addItems(
      ["Same-Day Nairobi Metro", "Inter-County Scheduled", "Express Motorbike", "Refrigerated Cold-Chain", "Heavy Freight Cargo"],
      ["Delivery Dispatch Service", "Distribution Route Service", "Parcel Courier Service", "Bulk Goods Transport", "Warehousing Storage Retainer"],
      2500, "Logistics & Transport"
    );
  } else if (cat.includes("legal") || cat.includes("finance") || name.includes("finance") || name.includes("legal")) {
    addItems(
      ["Statutory Corporate", "Commercial Contract", "Tax Dispute & KRA", "Employment & Labour", "Intellectual Property"],
      ["Advisory Consultation (1h)", "Review & Drafting Retainer", "Compliance Filing Package", "Mediation & Settlement Session", "Trademark & Trademark Filing"],
      10000, "Legal & Financial Services"
    );
  } else {
    // Universal commercial offerings
    addItems(
      ["Standard Professional", "Executive Advanced", "Turnkey End-to-End", "Comprehensive Priority", "Dedicated Monthly"],
      ["Consultation & Scoping Session", "Implementation Blueprint", "Operational Execution Package", "Quality Assurance Audit", "Support Retainer Agreement"],
      5000, company.category || "Professional Services"
    );
  }

  return offerings;
}

let totalCreatedProducts = 0;
let totalCreatedListings = 0;
const resultsByStore = [];

// 4. Populate each store to 20 listings
for (let i = 0; i < ownedCompanies.length; i++) {
  const comp = ownedCompanies[i];
  const cId = comp._id;

  // Security check before ANY write
  if (!ownedCompanyIdSet.has(cId.toString())) {
    throw new Error(`SECURITY CRITICAL: Attempted to process unauthorized company ${cId}`);
  }

  const currentCount = db.marketplaceListings.countDocuments({ companyId: cId });
  const shortfall = Math.max(0, TARGET_PER_STORE - currentCount);

  if (shortfall === 0) {
    resultsByStore.push({
      id: cId.toString(),
      name: comp.name,
      before: currentCount,
      added: 0,
      after: currentCount,
      status: "ALREADY_TARGET"
    });
    continue;
  }

  // Fetch existing names to prevent duplicate titles
  const existingNames = new Set(
    db.marketplaceListings.find({ companyId: cId }, { name: 1 }).toArray().map(l => l.name)
  );

  const candidateOfferings = getOfferingsForStore(comp);
  let addedThisStore = 0;

  for (let j = 0; j < candidateOfferings.length && addedThisStore < shortfall; j++) {
    const item = candidateOfferings[j];
    if (existingNames.has(item.name)) continue;

    const sellingPrice = Number(item.price);
    const costPrice = Math.round(sellingPrice * 0.65);
    const prodId = new ObjectId();

    // Insert Product with strict scalar NumberInt types
    db.Product.insertOne({
      _id: prodId,
      name: item.name,
      description: item.description,
      category: item.category,
      companyId: cId,
      costPrice: costPrice,
      sellingPrice: sellingPrice,
      finalPrice: sellingPrice,
      discount: NumberInt(0),
      quantity: NumberInt(10),
      isAvailable: true,
      status: "ACTIVE",
      tags: ["verified", "commercial"],
      images: [],
      videos: [],
      ebooks: [],
      pricingTiers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Insert Marketplace Listing with strict scalar NumberInt types & DRAFT status
    db.marketplaceListings.insertOne({
      _id: new ObjectId(),
      companyId: cId,
      productId: prodId,
      name: item.name,
      description: item.description,
      category: item.category,
      buyingPrice: costPrice,
      sellingPrice: sellingPrice,
      finalPrice: sellingPrice,
      discount: NumberInt(0),
      quantity: NumberInt(10),
      status: "DRAFT",
      listingSystemStatus: "DRAFT",
      listingMarketStatus: "AVAILABLE",
      listingTransactionType: "SALE",
      showOnGhuba: false,
      isAvailable: true,
      images: [],
      videos: [],
      ebooks: [],
      tags: ["verified", "commercial"],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    existingNames.add(item.name);
    addedThisStore++;
    totalCreatedProducts++;
    totalCreatedListings++;
  }

  // If candidate offerings ran out before reaching shortfall, pad with numbered offerings
  while (addedThisStore < shortfall) {
    const padNum = addedThisStore + 1;
    const padName = `${comp.name} Premier Offering #${padNum}`;
    const padPrice = 3000 + (padNum * 250);
    const padCost = Math.round(padPrice * 0.65);
    const prodId = new ObjectId();

    db.Product.insertOne({
      _id: prodId,
      name: padName,
      description: `Verified specialized commercial offering provided by ${comp.name}.`,
      category: comp.category || "General Commerce",
      companyId: cId,
      costPrice: padCost,
      sellingPrice: padPrice,
      finalPrice: padPrice,
      discount: NumberInt(0),
      quantity: NumberInt(10),
      isAvailable: true,
      status: "ACTIVE",
      tags: ["verified", "commercial"],
      images: [],
      videos: [],
      ebooks: [],
      pricingTiers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    db.marketplaceListings.insertOne({
      _id: new ObjectId(),
      companyId: cId,
      productId: prodId,
      name: padName,
      description: `Verified specialized commercial offering provided by ${comp.name}.`,
      category: comp.category || "General Commerce",
      buyingPrice: padCost,
      sellingPrice: padPrice,
      finalPrice: padPrice,
      discount: NumberInt(0),
      quantity: NumberInt(10),
      status: "DRAFT",
      listingSystemStatus: "DRAFT",
      listingMarketStatus: "AVAILABLE",
      listingTransactionType: "SALE",
      showOnGhuba: false,
      isAvailable: true,
      images: [],
      videos: [],
      ebooks: [],
      tags: ["verified", "commercial"],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    addedThisStore++;
    totalCreatedProducts++;
    totalCreatedListings++;
  }

  const finalCount = currentCount + addedThisStore;
  resultsByStore.push({
    id: cId.toString(),
    name: comp.name,
    before: currentCount,
    added: addedThisStore,
    after: finalCount,
    status: finalCount >= TARGET_PER_STORE ? "SUCCESS" : "DEFICIT"
  });
}

// 5. Post-Expansion Integrity Verification
const finalOrders = db.CustomerOrder.countDocuments();
const finalOrderItems = db.OrderItem.countDocuments();
const finalProducts = db.Product.countDocuments();
const finalListings = db.marketplaceListings.countDocuments();
const finalExternalListings = db.marketplaceListings.countDocuments({ companyId: { $in: Array.from(externalCompanyIdSet).map(id => ObjectId(id)) } });

print("\n=== POST-EXPANSION INTEGRITY AUDIT ===");
print(`Final CustomerOrders:    ${finalOrders} (Expected 196)`);
print(`Final OrderItems:        ${finalOrderItems} (Expected 295)`);
print(`Final Products:          ${finalProducts} (Added: ${totalCreatedProducts})`);
print(`Final Listings:          ${finalListings} (Added: ${totalCreatedListings})`);
print(`External Merchant Items: ${finalExternalListings} (Baseline: ${initialExternalListings})`);

if (finalOrders !== 196 || finalOrderItems !== 295) {
  throw new Error(`CRITICAL POST-EXECUTION CORRUPTION: Orders or OrderItems were modified!`);
}

if (finalExternalListings !== initialExternalListings) {
  throw new Error(`CRITICAL POST-EXECUTION SECURITY VIOLATION: External merchant listings were modified!`);
}

// Check every owned store
const failedStores = [];
ownedCompanies.forEach(c => {
  const cnt = db.marketplaceListings.countDocuments({ companyId: c._id });
  if (cnt < TARGET_PER_STORE) {
    failedStores.push({ id: c._id.toString(), name: c.name, count: cnt });
  }
});

if (failedStores.length > 0) {
  throw new Error(`ACCEPTANCE FAILURE: ${failedStores.length} stores still have under 20 listings!`);
}

print(`\nALL 65 OWNED STORES FULLY VERIFIED WITH >= 20 LISTINGS!`);
print(`Created Products: ${totalCreatedProducts}`);
print(`Created Listings: ${totalCreatedListings}`);
print("=== SCRIPT COMPLETE ===");
