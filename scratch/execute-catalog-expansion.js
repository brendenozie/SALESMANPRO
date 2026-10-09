/**
 * execute-catalog-expansion.js
 * Production Catalog Expansion & Store-by-Store Product Population
 * 
 * Strict Ownership Boundary: Company.userId === ObjectId("67c5b0182e2372b5f2366dbe")
 */

const targetUserId = ObjectId("67c5b0182e2372b5f2366dbe");

print("=== STARTING CATALOG EXPANSION SCRIPT ===");
const startTime = new Date();

// 1. Initial Verification & Ownership Boundary Assertions
const initialOrders = db.CustomerOrder.countDocuments();
const initialOrderItems = db.OrderItem.countDocuments();
const initialProducts = db.Product.countDocuments();
const initialListings = db.marketplaceListings.countDocuments();

if (initialOrders !== 196 || initialOrderItems !== 295) {
  throw new Error(`CRITICAL INVARIANCE FAILURE: Orders (${initialOrders}) or OrderItems (${initialOrderItems}) do not match expected baseline (196 / 295)! Aborting.`);
}

// Build strict allowlist of owned companies
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
  targetUserId: targetUserId.toString(),
  initialCounts: {
    orders: initialOrders,
    orderItems: initialOrderItems,
    products: initialProducts,
    listings: initialListings
  },
  batchA: [],
  batchB: [],
  createdProducts: [],
  createdListings: [],
  updatedProducts: [],
  updatedListings: [],
  errors: []
};

// ==========================================
// BATCH A: ENRICHMENT & RELATIONSHIP LINKAGE
// ==========================================
print("\n--- EXECUTING BATCH A: Existing Inventory & Unlinked Products ---");

// A1: Enrich Panadol Product & Create Missing Listing
const panadolCompId = ObjectId("683581bba1bdf6ca3624b535"); // Healthcare & Clinics
assertCompanyOwned(panadolCompId);
const panadolProdId = ObjectId("68dd3fc26bf18ce921f6f0f6");

const existingPanadolProd = db.Product.findOne({ _id: panadolProdId });
if (existingPanadolProd) {
  const panadolCategory = "Health And Beauty";
  const panadolCategoryId = ObjectId("e4763c9e49ba6dd252c3e893");
  const panadolSubcat = {
    id: "676bb5ed0de34d386c10d93d",
    name: "Supplements",
    slug: "supplements"
  };

  const beforePanadolProd = {
    category: existingPanadolProd.category,
    subCategoryName: existingPanadolProd.subCategoryName,
    productCategoryId: existingPanadolProd.productCategoryId,
    costPrice: existingPanadolProd.costPrice,
    sellingPrice: existingPanadolProd.sellingPrice,
    images: existingPanadolProd.images
  };

  db.Product.updateOne(
    { _id: panadolProdId, companyId: panadolCompId },
    {
      $set: {
        name: "Panadol Extra Pain Relief (16 Tablets)",
        description: "Fast-acting paracetamol and caffeine formulation for relief of headache, fever, toothache, and body aches.",
        category: panadolCategory,
        productCategoryId: panadolCategoryId,
        subCategoryName: "Supplements",
        subCategory: panadolSubcat,
        brand: "Panadol",
        costPrice: 120,
        sellingPrice: 160,
        finalPrice: 160,
        profitMargin: 33.33,
        quantity: { high: 0, low: 50, unsigned: false },
        stock: 50,
        images: [
          "https://dozi4r4ug9739.cloudfront.net/images/1772312005666-towfiqu-barbhuiya-q-RyWM8uYwY-unsplash.jpg",
          "https://dozi4r4ug9739.cloudfront.net/images/1772312005667-tetiana-bykovets-Ht7ZhGt2UXg-unsplash.jpg"
        ],
        isAvailable: true,
        showOnGhuba: false, // Draft pending merchant activation
        updatedAt: new Date()
      }
    }
  );

  auditLog.updatedProducts.push({
    id: panadolProdId.toString(),
    companyId: panadolCompId.toString(),
    companyName: companyNameMap[panadolCompId.toString()],
    name: "Panadol Extra Pain Relief (16 Tablets)",
    action: "ENRICH_EXISTING_PRODUCT",
    before: beforePanadolProd
  });

  // Check if listing already exists
  let panadolListing = db.marketplaceListings.findOne({ productId: panadolProdId });
  if (!panadolListing) {
    const newPanadolListingId = new ObjectId();
    const panadolListingDoc = {
      _id: newPanadolListingId,
      companyId: panadolCompId,
      sellerId: null,
      productId: panadolProdId,
      productCategoryId: panadolCategoryId,
      category: panadolCategory,
      subCategoryName: "Supplements",
      subCategory: panadolSubcat,
      brand: "Panadol",
      name: "Panadol Extra Pain Relief (16 Tablets)",
      description: "Fast-acting paracetamol and caffeine formulation for relief of headache, fever, toothache, and body aches.",
      longDescription: null,
      model: "Standard Pack",
      color: [],
      size: ["16 Tablets"],
      weight: [],
      material: [],
      quantity: { high: 0, low: 50, unsigned: false },
      images: [
        "https://dozi4r4ug9739.cloudfront.net/images/1772312005666-towfiqu-barbhuiya-q-RyWM8uYwY-unsplash.jpg",
        "https://dozi4r4ug9739.cloudfront.net/images/1772312005667-tetiana-bykovets-Ht7ZhGt2UXg-unsplash.jpg"
      ],
      videos: [],
      ebooks: [],
      profitMargin: 33.33,
      buyingPrice: 120,
      costPrice: 120,
      sellingPrice: 160,
      finalPrice: 160,
      discount: { high: 0, low: 0, unsigned: false },
      tax: 0,
      shippingCost: 0,
      pricingTiers: [],
      isAvailable: true,
      isOnOffer: false,
      isFlashDeal: false,
      isNewArrival: false,
      isDiscounted: false,
      isFeatured: false,
      contact: "07003456778",
      email: "brendenozie@gmail.com",
      contactName: "Brenden Odhiambo",
      delivery: false,
      paymentOption: "AT SHOP",
      showOnGhuba: false, // Draft status
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.marketplaceListings.insertOne(panadolListingDoc);
    auditLog.createdListings.push({
      id: newPanadolListingId.toString(),
      productId: panadolProdId.toString(),
      companyId: panadolCompId.toString(),
      companyName: companyNameMap[panadolCompId.toString()],
      name: panadolListingDoc.name,
      action: "CREATE_MISSING_LISTING"
    });
    print(`Created missing listing for Panadol: ${newPanadolListingId}`);
  }
}

// A2: Link Salad 2 Listing to existing Salad 2 Product
const dukaYanguCompId = ObjectId("6825c2c7969ab9f16f620f67");
assertCompanyOwned(dukaYanguCompId);
const saladListingId = ObjectId("6928480726d014ca98b8d7d4");
const saladProdId = ObjectId("692850af26d014ca98b8d7d5");

const existingSaladListing = db.marketplaceListings.findOne({ _id: saladListingId, companyId: dukaYanguCompId });
if (existingSaladListing && !existingSaladListing.productId) {
  db.marketplaceListings.updateOne(
    { _id: saladListingId, companyId: dukaYanguCompId },
    {
      $set: {
        productId: saladProdId,
        productCategoryId: ObjectId("7c3765bf72361083d820071f"),
        category: "Groceries",
        subCategoryName: "Spices & Seasonings",
        updatedAt: new Date()
      }
    }
  );
  auditLog.updatedListings.push({
    id: saladListingId.toString(),
    companyId: dukaYanguCompId.toString(),
    name: "Salad 2",
    action: "LINK_LISTING_TO_PRODUCT",
    linkedProductId: saladProdId.toString()
  });
  print(`Linked Salad 2 listing ${saladListingId} to Product ${saladProdId}`);
}

// A3: Calibrate DAP Fertilizer in Agrovet
const agrovetCompId = ObjectId("699c7f464d23c222dcedfa12");
assertCompanyOwned(agrovetCompId);
const dapProdId = ObjectId("6a2be6c41642861cd4ad660c");
const dapListingId = ObjectId("6a2be7f01642861cd4ad660d");

const existingDapProd = db.Product.findOne({ _id: dapProdId, companyId: agrovetCompId });
if (existingDapProd) {
  const dapSubcat = {
    id: "64a8c9e2d91b1b2a5e80c202",
    name: "Fertilizers",
    slug: "fertilizers"
  };
  db.Product.updateOne(
    { _id: dapProdId, companyId: agrovetCompId },
    {
      $set: {
        name: "Yara Diammonium Phosphate (DAP) Fertilizer - 50kg",
        description: "High-quality planting fertilizer providing essential Nitrogen (18%) and Phosphate (46%) for vigorous root development and early crop establishment.",
        category: "Agrovet",
        productCategoryId: ObjectId("64a8c9e2d91b1b2a5e80c101"),
        subCategoryName: "Fertilizers",
        subCategory: dapSubcat,
        brand: "Yara",
        costPrice: 3200,
        sellingPrice: 3500,
        finalPrice: 3500,
        profitMargin: 9.38,
        quantity: { high: 0, low: 30, unsigned: false },
        stock: 30,
        showOnGhuba: false, // Draft
        updatedAt: new Date()
      }
    }
  );
  db.marketplaceListings.updateOne(
    { _id: dapListingId, companyId: agrovetCompId },
    {
      $set: {
        name: "Yara Diammonium Phosphate (DAP) Fertilizer - 50kg",
        description: "High-quality planting fertilizer providing essential Nitrogen (18%) and Phosphate (46%) for vigorous root development and early crop establishment.",
        category: "Agrovet",
        productCategoryId: ObjectId("64a8c9e2d91b1b2a5e80c101"),
        subCategoryName: "Fertilizers",
        subCategory: dapSubcat,
        brand: "Yara",
        buyingPrice: 3200,
        costPrice: 3200,
        sellingPrice: 3500,
        finalPrice: 3500,
        profitMargin: 9.38,
        quantity: { high: 0, low: 30, unsigned: false },
        showOnGhuba: false, // Draft
        updatedAt: new Date()
      }
    }
  );
  auditLog.updatedProducts.push({
    id: dapProdId.toString(),
    companyId: agrovetCompId.toString(),
    name: "Yara Diammonium Phosphate (DAP) Fertilizer - 50kg",
    action: "CALIBRATE_PRODUCT_PRICING_AND_TAXONOMY"
  });
  auditLog.updatedListings.push({
    id: dapListingId.toString(),
    companyId: agrovetCompId.toString(),
    name: "Yara Diammonium Phosphate (DAP) Fertilizer - 50kg",
    action: "CALIBRATE_LISTING_PRICING_AND_TAXONOMY"
  });
  print(`Calibrated DAP Fertilizer Product ${dapProdId} and Listing ${dapListingId}`);
}

// ==========================================
// BATCH B: VERIFIED STORE ASSORTMENT EXPANSION
// ==========================================
print("\n--- EXECUTING BATCH B: Store-by-Store Catalog Expansion ---");

const candidateAdditions = [
  // 1. Peanut Duka (699fefeaccfde3cbdf107c7c)
  {
    storeCompanyId: ObjectId("699fefeaccfde3cbdf107c7c"),
    categoryId: ObjectId("64e3a4e2d91b1b2a5e809001"),
    categoryName: "Peanuts Store",
    subCategory: {
      id: "64e3a4e2d91b1b2a5e809003",
      name: "Roasted Peanuts",
      slug: "roasted-peanuts"
    },
    subCategoryName: "Roasted Peanuts",
    brand: "Nutty Naturals",
    name: "Fresh Roasted Salted Peanuts (250g)",
    description: "Crunchy oven-roasted peanuts seasoned with natural sea salt. Packed fresh in airtight moisture-lock pouches for optimal crunch.",
    size: ["250g"],
    costPrice: 150,
    sellingPrice: 200,
    stock: 50,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772278646360-sam-moghadam-SRzVKw8l_tA-unsplash.jpg"]
  },
  {
    storeCompanyId: ObjectId("699fefeaccfde3cbdf107c7c"),
    categoryId: ObjectId("64e3a4e2d91b1b2a5e809001"),
    categoryName: "Peanuts Store",
    subCategory: {
      id: "64e3a4e2d91b1b2a5e809005",
      name: "Peanut Butter",
      slug: "peanut-butter"
    },
    subCategoryName: "Peanut Butter",
    brand: "Farm Fresh",
    name: "Pure Natural Creamy Peanut Butter (400g)",
    description: "100% natural roasted peanut spread with no added hydrogenated oils, palm oil, or artificial preservatives. Rich in protein and healthy fats.",
    size: ["400g"],
    costPrice: 280,
    sellingPrice: 350,
    stock: 30,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772278646361-ziphaus-Sm7ebvMgi-E-unsplash.jpg"]
  },
  {
    storeCompanyId: ObjectId("699fefeaccfde3cbdf107c7c"),
    categoryId: ObjectId("64e3a4e2d91b1b2a5e809001"),
    categoryName: "Peanuts Store",
    subCategory: {
      id: "64e3a4e2d91b1b2a5e809002",
      name: "Raw Peanuts",
      slug: "raw-peanuts"
    },
    subCategoryName: "Raw Peanuts",
    brand: "Organic Harvest",
    name: "Raw Shelled Red Groundnuts (1kg)",
    description: "Grade-A sun-dried red shelled groundnuts. Ideal for roasting, home peanut butter making, baking, and traditional cooking.",
    size: ["1kg"],
    costPrice: 220,
    sellingPrice: 280,
    stock: 40,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772278646363-victor-g-N04FIfHhv_k-unsplash.jpg"]
  },

  // 2. Glasses Duka (699ff330ccfde3cbdf107c7d)
  {
    storeCompanyId: ObjectId("699ff330ccfde3cbdf107c7d"),
    categoryId: ObjectId("64e3a5e2d91b1b2a5e80c711"),
    categoryName: "Glasses & Spectacles Store",
    subCategory: {
      id: "64e4a4e3d91b1b2a5e6c7023",
      name: "Blue Light Glasses",
      slug: "blue-light-glasses"
    },
    subCategoryName: "Blue Light Glasses",
    brand: "Cyxus",
    name: "Anti-Blue Light Computer Glasses - TR90 Matte Black Frame",
    description: "Ultra-lightweight TR90 ergonomic frame with anti-reflective blue-blocking lenses. Protects eyes against digital eye strain and fatigue from computer screens.",
    size: ["Universal"],
    costPrice: 1200,
    sellingPrice: 1800,
    stock: 25,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772312106481-zeelool-glasses-aShmUdodJ3w-unsplash.jpg"]
  },
  {
    storeCompanyId: ObjectId("699ff330ccfde3cbdf107c7d"),
    categoryId: ObjectId("64e3a5e2d91b1b2a5e80c711"),
    categoryName: "Glasses & Spectacles Store",
    subCategory: {
      id: "64e4a4e3d91b1b2a5e6c7022",
      name: "Sunglasses",
      slug: "sunglasses"
    },
    subCategoryName: "Sunglasses",
    brand: "Ray-Ban",
    name: "Classic Polarized Unisex Sunglasses UV400 Protection",
    description: "Timeless wayfarer silhouette with high-definition polarized TAC lenses. 100% UV400 ultraviolet protection against harsh glare and outdoor sun exposure.",
    size: ["Standard"],
    costPrice: 2500,
    sellingPrice: 3500,
    stock: 15,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772312106526-omid-armin-Zt99Ho5Hq3s-unsplash.jpg"]
  },
  {
    storeCompanyId: ObjectId("699ff330ccfde3cbdf107c7d"),
    categoryId: ObjectId("64e3a5e2d91b1b2a5e80c711"),
    categoryName: "Glasses & Spectacles Store",
    subCategory: {
      id: "64e4a4e3d91b1b2a5e6c7025",
      name: "Reading Glasses",
      slug: "reading-glasses"
    },
    subCategoryName: "Reading Glasses",
    brand: "Foster Grant",
    name: "Lightweight Flexible TR90 Reading Glasses (+2.00)",
    description: "Ergonomic reading spectacles featuring flexible spring hinges and distortion-free optical acrylic lenses. Power +2.00 diopters.",
    size: ["+2.00 Diopter"],
    costPrice: 800,
    sellingPrice: 1200,
    stock: 20,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772312106527-angus-gray-bSjqyqukCjY-unsplash.jpg"]
  },

  // 3. Gaming Duka (699ff34bccfde3cbdf107c7e)
  {
    storeCompanyId: ObjectId("699ff34bccfde3cbdf107c7e"),
    categoryId: ObjectId("54c1e2d91b1b2a5e80e50112"),
    categoryName: "Gaming Store",
    subCategory: {
      id: "64c1e2d91b1b2a5e80e50203",
      name: "Gaming Accessories",
      slug: "gaming-accessories"
    },
    subCategoryName: "Gaming Accessories",
    brand: "Logitech G",
    name: "RGB Surround Sound Gaming Headset with Noise-Cancelling Mic",
    description: "Immersive 50mm dynamic drivers with positional audio clarity, breathable memory-foam ear cushions, and flexible flip-to-mute cardioid microphone.",
    size: ["Over-Ear"],
    costPrice: 2800,
    sellingPrice: 3800,
    stock: 15,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772222037581-still-life-wireless-cyberpunk-headphones_23-2151072202.jpg"]
  },
  {
    storeCompanyId: ObjectId("699ff34bccfde3cbdf107c7e"),
    categoryId: ObjectId("54c1e2d91b1b2a5e80e50112"),
    categoryName: "Gaming Store",
    subCategory: {
      id: "64c1e2d91b1b2a5e80e50203",
      name: "Gaming Accessories",
      slug: "gaming-accessories"
    },
    subCategoryName: "Gaming Accessories",
    brand: "Razer",
    name: "Wireless Ergonomic Gaming Controller for PC & Android",
    description: "Dual vibration feedback motors, precision analog thumbsticks, textured rubber grips, and low-latency 2.4GHz wireless connectivity.",
    size: ["Standard"],
    costPrice: 3200,
    sellingPrice: 4500,
    stock: 12,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80"]
  },

  // 4. Shoes Store (68b597b7de9bdd2ba7479f34)
  {
    storeCompanyId: ObjectId("68b597b7de9bdd2ba7479f34"),
    categoryId: ObjectId("93e002c712ad248bb0ade319"),
    categoryName: "Fashion",
    subCategory: {
      id: "a60ba1a7a56c9e00252baebe",
      name: "Shoes",
      slug: "shoes"
    },
    subCategoryName: "Shoes",
    brand: "Puma",
    name: "Men's Lightweight Breathable Running Sneakers (Sizes 40-45)",
    description: "Engineered mesh upper for superior ventilation with high-rebound EVA midsole cushioning. Durable rubber outsole for multi-surface grip.",
    size: ["40", "41", "42", "43", "44", "45"],
    costPrice: 2800,
    sellingPrice: 3800,
    stock: 20,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772223357547-maksim-larin-NOpsC3nWTzY-unsplash.jpg"]
  },
  {
    storeCompanyId: ObjectId("68b597b7de9bdd2ba7479f34"),
    categoryId: ObjectId("93e002c712ad248bb0ade319"),
    categoryName: "Fashion",
    subCategory: {
      id: "a60ba1a7a56c9e00252baebe",
      name: "Shoes",
      slug: "shoes"
    },
    subCategoryName: "Shoes",
    brand: "Nike",
    name: "Women's Air Cushion Athletic Walking Shoes (Sizes 37-41)",
    description: "Shock-absorbing air sole unit with contoured arch support. Breathable knit upper designed for everyday walking, fitness, and casual wear.",
    size: ["37", "38", "39", "40", "41"],
    costPrice: 3200,
    sellingPrice: 4200,
    stock: 18,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772223357549-usama-akram-kP6knT7tjn4-unsplash.jpg"]
  },

  // 5. Agrovet (699c7f464d23c222dcedfa12)
  {
    storeCompanyId: ObjectId("699c7f464d23c222dcedfa12"),
    categoryId: ObjectId("64a8c9e2d91b1b2a5e80c101"),
    categoryName: "Agrovet",
    subCategory: {
      id: "64a8c9e2d91b1b2a5e80c201",
      name: "Seeds",
      slug: "seeds"
    },
    subCategoryName: "Seeds",
    brand: "Kenya Seed Company",
    name: "Certified Hybrid Maize Seed H614 (2kg)",
    description: "Official Kenya Seed Company certified highland hybrid maize seed. High-yielding variety (30-40 bags/acre), highly tolerant to common rust and lodging.",
    size: ["2kg"],
    costPrice: 450,
    sellingPrice: 550,
    stock: 50,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772278646360-sam-moghadam-SRzVKw8l_tA-unsplash.jpg"]
  },
  {
    storeCompanyId: ObjectId("699c7f464d23c222dcedfa12"),
    categoryId: ObjectId("64a8c9e2d91b1b2a5e80c101"),
    categoryName: "Agrovet",
    subCategory: {
      id: "64a8c9e2d91b1b2a5e80c20a",
      name: "Livestock Medicine",
      slug: "livestock-medicine"
    },
    subCategoryName: "Livestock Medicine",
    brand: "Norbrook",
    name: "Albendazole 10% Broad Spectrum Livestock Dewormer (500ml)",
    description: "Oral drench anthelmintic for control and treatment of roundworms, tapeworms, lungworms, and liver flukes in cattle, sheep, and goats.",
    size: ["500ml"],
    costPrice: 650,
    sellingPrice: 850,
    stock: 25,
    images: ["https://dozi4r4ug9739.cloudfront.net/images/1772312005666-towfiqu-barbhuiya-q-RyWM8uYwY-unsplash.jpg"]
  }
];

print(`Found ${candidateAdditions.length} candidate additions for Batch B.`);

candidateAdditions.forEach((item, index) => {
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

print("=== POST-EXECUTION SUMMARY ===");
print(JSON.stringify(auditLog, null, 2));

// Save execution manifest to /var/www/salesmanpro/catalog_expansion_execution_manifest.json
// (mongosh print will output this to stdout for log capture)
