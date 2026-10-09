/**
 * execute-catalog-expansion-batch2.js
 * Production Catalog Expansion Batch 2 — Store-by-Store Product Population
 * 
 * Strict Ownership Boundary: Company.userId === ObjectId("67c5b0182e2372b5f2366dbe")
 */

const targetUserId = ObjectId("67c5b0182e2372b5f2366dbe");

print("=== STARTING CATALOG EXPANSION BATCH 2 SCRIPT ===");
const startTime = new Date();

// 1. Initial Baseline Assertions
const initialOrders = db.CustomerOrder.countDocuments();
const initialOrderItems = db.OrderItem.countDocuments();
const initialProducts = db.Product.countDocuments();
const initialListings = db.marketplaceListings.countDocuments();
const initialActive = db.marketplaceListings.countDocuments({ showOnGhuba: true, isAvailable: true });

if (initialOrders !== 196 || initialOrderItems !== 295) {
  throw new Error(`CRITICAL INVARIANCE FAILURE: Orders (${initialOrders}) or OrderItems (${initialOrderItems}) do not match baseline (196 / 295)! Aborting.`);
}
if (initialProducts !== 27 || initialListings !== 71) {
  throw new Error(`BASELINE STATE MISMATCH: Expected 27 products and 71 listings from Batch 1, found ${initialProducts} products and ${initialListings} listings! Aborting.`);
}

// 2. Strict Allowlist of Owned Companies
const ownedCompanies = db.Company.find({ userId: targetUserId }, { _id: 1, name: 1, slug: 1 }).toArray();
const ownedCompanyIdSet = new Set(ownedCompanies.map(c => c._id.toString()));
const companyNameMap = {};
ownedCompanies.forEach(c => { companyNameMap[c._id.toString()] = c.name; });

print(`Verified ${ownedCompanyIdSet.size} owned companies in allowlist for userId ${targetUserId}.`);

function assertCompanyOwned(companyId) {
  const cIdStr = companyId.toString();
  if (!ownedCompanyIdSet.has(cIdStr)) {
    throw new Error(`SECURITY VIOLATION: Company ID ${cIdStr} is not owned by target user! Aborting.`);
  }
}

const auditLog = {
  timestamp: startTime.toISOString(),
  batch: 2,
  targetUserId: targetUserId.toString(),
  initialCounts: {
    orders: initialOrders,
    orderItems: initialOrderItems,
    products: initialProducts,
    listings: initialListings,
    activeListings: initialActive
  },
  createdProducts: [],
  createdListings: [],
  errors: []
};

// 3. Batch 2 Candidate Additions Across 6 High-Priority Owned Retail Stores
const batch2Candidates = [
  // 1. Honey Duka (699fefdbccfde3cbdf107c7b)
  {
    storeCompanyId: ObjectId("699fefdbccfde3cbdf107c7b"),
    categoryId: ObjectId("64e3a4e2d91b1b2a5e807030"),
    categoryName: "Honey Store",
    subCategory: {
      id: "64e3a4e2d91b1b2a5e807032",
      name: "Raw & Organic Honey",
      slug: "raw-organic-honey"
    },
    subCategoryName: "Raw & Organic Honey",
    brand: "Kitui Pure Honey",
    name: "Pure Natural Raw Acacia Honey (500g)",
    description: "100% pure unprocessed Kenyan acacia honey harvested from dryland wild blossoms. Rich amber texture with high enzyme and antioxidant content.",
    size: ["500g"],
    costPrice: 450,
    sellingPrice: 650,
    stock: 40,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1761641677232-pexels-marta-dzedyshko-1042863-2067569.jpg"]
  },
  {
    storeCompanyId: ObjectId("699fefdbccfde3cbdf107c7b"),
    categoryId: ObjectId("64e3a4e2d91b1b2a5e807030"),
    categoryName: "Honey Store",
    subCategory: {
      id: "64e3a4e2d91b1b2a5e807034",
      name: "Honey Comb",
      slug: "honey-comb"
    },
    subCategoryName: "Honey Comb",
    brand: "Kitui Pure Honey",
    name: "Organic Natural Raw Honeycomb Block (400g)",
    description: "Freshly cut natural edible honeycomb wax submerged in raw unprocessed blossom honey. Naturally sealed by bees with zero additives or heat processing.",
    size: ["400g"],
    costPrice: 600,
    sellingPrice: 850,
    stock: 25,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1761641677233-pexels-alinevianafoto-2465877.jpg"]
  },

  // 2. Baby Duka (699fea3fccfde3cbdf107c77)
  {
    storeCompanyId: ObjectId("699fea3fccfde3cbdf107c77"),
    categoryId: ObjectId("64e3a4e2d91b1b2a5e807061"),
    categoryName: "Baby Store",
    subCategory: {
      id: "64e3a4e2d91b1b2a5e807063",
      name: "Diapers & Care",
      slug: "diapers-care"
    },
    subCategoryName: "Diapers & Care",
    brand: "Pampers",
    name: "Pampers Premium Protection Diaper Pants Size 3 (56 Count)",
    description: "Ultra-absorbent breathable baby diaper pants featuring 360-degree comfort flex waistband and 12-hour leak-guard protection. Suitable for 6-11kg babies.",
    size: ["Size 3 (56 Pants)"],
    costPrice: 1600,
    sellingPrice: 2100,
    stock: 35,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1779983928821-pexels-ketut-subiyanto-4720807.jpg"]
  },
  {
    storeCompanyId: ObjectId("699fea3fccfde3cbdf107c77"),
    categoryId: ObjectId("64e3a4e2d91b1b2a5e807061"),
    categoryName: "Baby Store",
    subCategory: {
      id: "64e3a4e2d91b1b2a5e807068",
      name: "Baby Care & Health",
      slug: "baby-care-health"
    },
    subCategoryName: "Baby Care & Health",
    brand: "Johnson's Baby",
    name: "Gentle Head-to-Toe Baby Wash & Shampoo (500ml)",
    description: "Pediatrician-tested No More Tears hypoallergenic baby cleansing formula. Gently cleanses sensitive infant skin and fine hair without irritation.",
    size: ["500ml"],
    costPrice: 650,
    sellingPrice: 850,
    stock: 40,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772222037583-pexels-babydov-7789062.jpg"]
  },

  // 3. Watch Duka (699fef6accfde3cbdf107c7a)
  {
    storeCompanyId: ObjectId("699fef6accfde3cbdf107c7a"),
    categoryId: ObjectId("64e3a4e2d91b1b2a5e807041"),
    categoryName: "Watch Store",
    subCategory: {
      id: "64e3a4e2d91b1b2a5e807042",
      name: "Classic Watches",
      slug: "classic-watches"
    },
    subCategoryName: "Classic Watches",
    brand: "Casio",
    name: "Classic Stainless Steel Quartz Men's Dress Watch",
    description: "Precision Japanese quartz movement with polished stainless steel case and link bracelet. Mineral glass crystal, date window display, and 50m water resistance.",
    size: ["40mm Dial"],
    costPrice: 3200,
    sellingPrice: 4500,
    stock: 20,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772312388704-stefen-tan-KYw1eUx1J7Y-unsplash.jpg"]
  },
  {
    storeCompanyId: ObjectId("699fef6accfde3cbdf107c7a"),
    categoryId: ObjectId("64e3a4e2d91b1b2a5e807041"),
    categoryName: "Watch Store",
    subCategory: {
      id: "64e3a4e2d91b1b2a5e807040",
      name: "Smart Watches",
      slug: "smart-watches"
    },
    subCategoryName: "Smart Watches",
    brand: "Huawei",
    name: "Waterproof Bluetooth Fitness Smart Watch with Heart Rate Monitor",
    description: "1.43-inch AMOLED touch display with SpO2 and continuous heart rate tracking, 100+ workout modes, Bluetooth phone calls, and 14-day battery life.",
    size: ["46mm"],
    costPrice: 4800,
    sellingPrice: 6500,
    stock: 15,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772312388804-kitai-zhvaeh-R9rA-unsplash.jpg"]
  },

  // 4. Pets Duka (699fea6eccfde3cbdf107c79)
  {
    storeCompanyId: ObjectId("699fea6eccfde3cbdf107c79"),
    categoryId: ObjectId("64e3a4e2d91b1b2a5e807071"),
    categoryName: "Pets Store",
    subCategory: {
      id: "64e3a4e2d91b1b2a5e807172",
      name: "Dog Food",
      slug: "dog-food"
    },
    subCategoryName: "Dog Food",
    brand: "Pedigree",
    name: "Complete Adult Dog Dry Food - Beef & Vegetable (10kg)",
    description: "Nutritionally balanced dry kibble formulated with real beef protein, omega-6 fatty acids, zinc for healthy coat, and dietary fibers for optimal digestion.",
    size: ["10kg"],
    costPrice: 3200,
    sellingPrice: 4200,
    stock: 20,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1780466319431-pexels-yvon-gallant-81432586-8941515.jpg"]
  },
  {
    storeCompanyId: ObjectId("699fea6eccfde3cbdf107c79"),
    categoryId: ObjectId("64e3a4e2d91b1b2a5e807071"),
    categoryName: "Pets Store",
    subCategory: {
      id: "64e3a4e2d91b1b2a5e807177",
      name: "Pet Toys",
      slug: "pet-toys"
    },
    subCategoryName: "Pet Toys",
    brand: "KONG",
    name: "Durable Rubber Chew & Fetch Dog Toy (Large)",
    description: "Ultra-strong natural rubber interactive dog toy. Features erratic bounce for fetch games and can be stuffed with peanut butter or treats to alleviate boredom.",
    size: ["Large"],
    costPrice: 700,
    sellingPrice: 1000,
    stock: 30,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772312388807-kari-shea-1SAnrIxw5OY-unsplash.jpg"]
  },

  // 5. Earphones Duka (699ff3a4ccfde3cbdf107c80)
  {
    storeCompanyId: ObjectId("699ff3a4ccfde3cbdf107c80"),
    categoryId: ObjectId("65d2a3e2d91b1b2a5e80a611"),
    categoryName: "Earphones Store",
    subCategory: {
      id: "65d2a3e2d91b1b2a5e80a621",
      name: "Wireless Earbuds",
      slug: "wireless-earbuds"
    },
    subCategoryName: "Wireless Earbuds",
    brand: "Oraimo",
    name: "True Wireless Stereo Earbuds with Charging Case",
    description: "Bluetooth 5.3 low-latency wireless earbuds with environmental noise cancellation for calls, IPX4 splash resistance, and up to 36 hours total playtime.",
    size: ["In-Ear"],
    costPrice: 1800,
    sellingPrice: 2500,
    stock: 30,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1782163103393-pexels-sejio402-29336327.jpg"]
  },
  {
    storeCompanyId: ObjectId("699ff3a4ccfde3cbdf107c80"),
    categoryId: ObjectId("65d2a3e2d91b1b2a5e80a611"),
    categoryName: "Earphones Store",
    subCategory: {
      id: "65d2a3e2d91b1b2a5e80a624",
      name: "Sports Earphones",
      slug: "sports-earphones"
    },
    subCategoryName: "Sports Earphones",
    brand: "JBL",
    name: "Deep Bass Over-Ear Wireless Bluetooth Headphones",
    description: "JBL Pure Bass 40mm dynamic sound drivers with lightweight foldable design, hands-free call management, and 30-hour rechargeable battery.",
    size: ["Over-Ear"],
    costPrice: 3500,
    sellingPrice: 4800,
    stock: 15,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772222037581-still-life-wireless-cyberpunk-headphones_23-2151072202.jpg"]
  },

  // 6. Hardware Store (69d54251b5abc7c341772e52)
  {
    storeCompanyId: ObjectId("69d54251b5abc7c341772e52"),
    categoryId: ObjectId("1122aabbccddeeff00112233"),
    categoryName: "Hardware Store",
    subCategory: {
      id: "aabb00112233445566778899",
      name: "Power Tools",
      slug: "power-tools"
    },
    subCategoryName: "Power Tools",
    brand: "Bosch",
    name: "Heavy Duty 800W Rotary Hammer Drill with SDS-Plus Bits",
    description: "Powerful 800W professional rotary hammer drill delivering 2.7J impact energy. Multi-function selector for drilling, hammer drilling, and chiseling in concrete and masonry.",
    size: ["26mm Concrete"],
    costPrice: 6500,
    sellingPrice: 8500,
    stock: 12,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772312389195-sam-pak-X6QffKLwyoQ-unsplash.jpg"]
  },
  {
    storeCompanyId: ObjectId("69d54251b5abc7c341772e52"),
    categoryId: ObjectId("1122aabbccddeeff00112233"),
    categoryName: "Hardware Store",
    subCategory: {
      id: "bbcc00112233445566778899",
      name: "Hand Tools",
      slug: "hand-tools"
    },
    subCategoryName: "Hand Tools",
    brand: "TotalTools",
    name: "Professional 24-Piece Combination Spanner & Socket Tool Set",
    description: "Drop-forged chrome vanadium steel wrench and socket set with mirror polish finish. Precision heat-treated with heavy-duty blow-molded carrying case.",
    size: ["24-Piece Set"],
    costPrice: 2800,
    sellingPrice: 3800,
    stock: 20,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1782163210269-pexels-tima-miroshnichenko-6263105.jpg"]
  }
];

print(`Found ${batch2Candidates.length} candidate additions for Batch 2.`);

batch2Candidates.forEach((item) => {
  assertCompanyOwned(item.storeCompanyId);
  const companyName = companyNameMap[item.storeCompanyId.toString()] || item.storeCompanyId.toString();

  // Deduplication check: check if product with same name exists in that company
  const existingProd = db.Product.findOne({
    companyId: item.storeCompanyId,
    name: item.name
  });

  if (existingProd) {
    print(`SKIPPING: Product "${item.name}" already exists in company ${companyName}.`);
    return;
  }

  const profitMargin = Number((((item.sellingPrice - item.costPrice) / item.costPrice) * 100).toFixed(2));
  const newProdId = new ObjectId();
  const now = new Date();

  // 1. Insert Product Document
  const prodDoc = {
    _id: newProdId,
    name: item.name,
    description: item.description,
    longDescription: null,
    category: item.categoryName,
    productCategoryId: item.categoryId,
    subCategoryName: item.subCategoryName,
    subCategory: item.subCategory,
    brand: item.brand,
    companyId: item.storeCompanyId,
    costPrice: item.costPrice,
    sellingPrice: item.sellingPrice,
    finalPrice: item.sellingPrice,
    profitMargin: profitMargin,
    quantity: { high: 0, low: item.stock, unsigned: false },
    stock: item.stock,
    images: item.images,
    videos: [],
    ebooks: [],
    tags: ["verified", item.subCategory.slug],
    model: item.brand || null,
    color: [],
    size: item.size || [],
    weight: [],
    condition: "New",
    dimensions: null,
    material: [],
    pricingTiers: [],
    isOnOffer: false,
    isFlashDeal: false,
    isDiscounted: false,
    isAvailable: true,
    isNewArrival: true,
    isFeatured: false,
    contact: "07003456778",
    contactName: "Brenden Odhiambo",
    email: "brendenozie@gmail.com",
    delivery: false,
    paymentOption: "AT SHOP",
    showOnGhuba: false, // Strict control: Draft status pending merchant activation
    status: "ACTIVE",
    active: true,
    listingMarketStatus: "AVAILABLE",
    listingSystemStatus: "DRAFT",
    listingTransactionType: "SALE",
    tax: 0,
    shippingCost: 0,
    createdAt: now,
    updatedAt: now
  };

  db.Product.insertOne(prodDoc);

  auditLog.createdProducts.push({
    id: newProdId.toString(),
    companyId: item.storeCompanyId.toString(),
    companyName: companyName,
    name: item.name,
    category: item.categoryName,
    subCategory: item.subCategoryName,
    brand: item.brand,
    sellingPrice: item.sellingPrice,
    stock: item.stock
  });

  // 2. Insert Marketplace Listing Document (Linked to Product)
  const newListingId = new ObjectId();
  const listingDoc = {
    _id: newListingId,
    companyId: item.storeCompanyId,
    sellerId: null,
    productId: newProdId,
    productCategoryId: item.categoryId,
    category: item.categoryName,
    subCategoryName: item.subCategoryName,
    subCategory: item.subCategory,
    brand: item.brand,
    name: item.name,
    description: item.description,
    longDescription: null,
    model: item.brand || null,
    color: [],
    size: item.size || [],
    weight: [],
    condition: "New",
    dimensions: null,
    material: [],
    quantity: { high: 0, low: item.stock, unsigned: false },
    images: item.images,
    videos: [],
    ebooks: [],
    profitMargin: profitMargin,
    buyingPrice: item.costPrice,
    costPrice: item.costPrice,
    sellingPrice: item.sellingPrice,
    finalPrice: item.sellingPrice,
    discount: { high: 0, low: 0, unsigned: false },
    tax: 0,
    shippingCost: 0,
    pricingTiers: [],
    duration: null,
    isAvailable: true,
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: true,
    isDiscounted: false,
    isFeatured: false,
    contact: "07003456778",
    email: "brendenozie@gmail.com",
    contactName: "Brenden Odhiambo",
    amenities: [],
    delivery: false,
    paymentOption: "AT SHOP",
    showOnGhuba: false, // Strict control: Draft status pending merchant activation
    status: "ACTIVE",
    location: {},
    locationName: "Nairobi",
    latitude: -1.286389,
    longitude: 36.817223,
    createdAt: now,
    updatedAt: now
  };

  db.marketplaceListings.insertOne(listingDoc);

  auditLog.createdListings.push({
    id: newListingId.toString(),
    productId: newProdId.toString(),
    companyId: item.storeCompanyId.toString(),
    companyName: companyName,
    name: item.name,
    category: item.categoryName,
    subCategory: item.subCategoryName,
    brand: item.brand,
    sellingPrice: item.sellingPrice,
    stock: item.stock
  });

  print(`Created Product (${newProdId}) and Listing (${newListingId}) for "${item.name}" in "${companyName}".`);
});

// ==========================================
// POST-EXECUTION VERIFICATION & INVARIANCES
// ==========================================
print("\n--- RUNNING POST-EXECUTION VERIFICATION ---");

const finalOrders = db.CustomerOrder.countDocuments();
const finalOrderItems = db.OrderItem.countDocuments();
const finalProducts = db.Product.countDocuments();
const finalListings = db.marketplaceListings.countDocuments();
const finalActiveListings = db.marketplaceListings.countDocuments({ showOnGhuba: true, isAvailable: true });

// Assert order invariants
if (finalOrders !== 196 || finalOrderItems !== 295) {
  throw new Error(`CRITICAL POST-EXECUTION FAILURE: Orders (${finalOrders}) or OrderItems (${finalOrderItems}) were corrupted! Must be 196/295!`);
}

// Assert no external company listings were created
const externalListingsCount = db.marketplaceListings.countDocuments({
  companyId: { $nin: Array.from(ownedCompanyIdSet).map(id => ObjectId(id)) }
});
if (externalListingsCount !== 5) {
  throw new Error(`CRITICAL SECURITY FAILURE: External listings count changed from 5 to ${externalListingsCount}!`);
}

auditLog.finalCounts = {
  orders: finalOrders,
  orderItems: finalOrderItems,
  products: finalProducts,
  listings: finalListings,
  activeListings: finalActiveListings
};

auditLog.deltas = {
  newProducts: finalProducts - initialProducts,
  newListings: finalListings - initialListings,
  orderDelta: finalOrders - initialOrders,
  orderItemDelta: finalOrderItems - initialOrderItems
};

const endTime = new Date();
auditLog.durationMs = endTime - startTime;

print("=== POST-EXECUTION SUMMARY BATCH 2 ===");
print(JSON.stringify(auditLog, null, 2));
