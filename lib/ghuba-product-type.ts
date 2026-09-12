export type ProductType = "PROPERTY" | "AUTO" | "SERVICE" | "ECOMMERCE";

export interface ProductCapabilities {
  canAddToCart: boolean;
  canBookSession: boolean;
  canInquire: boolean;
  isPhysicalAsset: boolean;
}

export interface ProductWithCapabilities {
  capabilities: ProductCapabilities;
  [key: string]: any;
}

// 1. Explicit E-commerce / Retail override keywords (always allow Add to Cart)
const EXPLICIT_ECOMMERCE_KEYWORDS = [
  // Agriculture & Farm Inputs
  "seeds", "fertilizers", "fertiliser", "animal feeds", "veterinary", "farm tools", "equipment",
  "pest control", "irrigation", "greenhouse", "agricultural", "livestock", "medicine",
  "farm machinery", "agribusiness", "farming", "agroforestry", "hydroponics",
  "aquaponics", "agro-processing", "agro-inputs", "ppe", "agro", "pesticides", "herbicides",

  // Hardware, Building & DIY
  "hardware", "cement", "nails", "screws", "fasteners", "hammer", "drill", "tools",
  "paint", "fixtures", "fittings", "tiles", "timber", "steel", "pipes", "plumbing fittings",
  "electrical fittings", "cables", "sockets", "switches", "hand tools", "power tools",
  "building materials", "roofing", "plywood", "adhesives", "sandpaper", "welding",

  // Food, Groceries, Bakery & Cakes
  "cake", "cakes", "bakery", "pastries", "bread", "snacks", "groceries", "food",
  "dairy", "eggs", "meat", "poultry", "fish", "produce", "fruits", "vegetables",
  "beverages", "drinks", "sweets", "confectionery", "spices", "cooking",

  // Fashion, Footwear, Wearables & Lifestyle
  "fashion", "clothing", "apparel", "shoes", "sneakers", "boots", "sandals", "slippers",
  "footwear", "watches", "jewelry", "jewellery", "eyewear", "glasses", "sunglasses",
  "bags", "handbags", "backpacks", "wallets", "belts", "caps", "hats",

  // Electronics & Gadgets
  "electronics", "phones", "smartphones", "tablets", "laptops", "computers", "headphones",
  "earphones", "speakers", "audio", "cables", "chargers", "cases", "covers", "monitors",
  "tvs", "television", "cameras", "printers", "smart home", "gaming", "consoles",

  // Health, Beauty & Personal Care
  "makeup", "cosmetics", "skincare", "perfume", "fragrance", "lotion", "soap",
  "haircare", "beauty", "toiletries", "wellness", "supplements", "vitamins",

  // Baby, Toys & Pets
  "baby", "toys", "diapers", "strollers", "baby clothes", "pet supplies", "pet food",

  // Books, Stationery & Gifts
  "books", "textbooks", "novels", "stationery", "pens", "notebooks", "gifts", "gift cards",
  "flowers", "plants", "decor", "home decor", "furniture", "appliances", "home appliances",
  "digital goods", "e-books", "ebooks", "software license"
];

// 2. Automotive Accessories, Parts, Fluids & Care (always allow Add to Cart)
const AUTO_ACCESSORY_KEYWORDS = [
  "accessories", "accessory", "parts", "spare parts", "auto parts", "car parts",
  "performance parts", "car care", "charging stations", "charger", "tires", "tyres",
  "wheels", "rims", "audio", "stereo", "speakers", "navigation", "gps", "interior",
  "exterior", "safety", "emergency", "fluids", "oils", "motor oil", "engine oil",
  "lubricants", "coolant", "brake fluid", "transmission fluid", "batteries", "car battery",
  "power systems", "lighting", "bulbs", "led bulbs", "headlights", "taillights", "fog lights",
  "dash cams", "dash cam", "cameras", "security", "tracking", "tracker", "car alarm",
  "alarm", "diagnostic", "obd", "electronics", "tools", "jack", "jumper cables",
  "camper", "sunroof", "wipers", "wiper blades", "washers", "steering", "steering cover",
  "pedals", "seat covers", "seat cover", "mats", "floor mats", "wraps", "decals",
  "stickers", "towing", "trailers", "exhaust", "mufflers", "transmission", "drivetrain",
  "cooling", "radiators", "suspension", "shock absorbers", "shocks", "struts", "engine",
  "filters", "oil filter", "air filter", "fuel filter", "cabin filter", "brakes",
  "brake pads", "brake discs", "rotors", "spark plugs", "plugs", "clutch", "fan belt",
  "timing belt", "air freshener", "wax", "polish", "car shampoo", "detailing",
  "key fob", "keychain", "tire inflator", "pressure gauge"
];

// 3. Property Keywords (Only for actual real estate / land / housing units)
const PROPERTY_KEYWORDS = [
  "real estate", "property", "houses for sale", "houses for rent", "house for sale",
  "house for rent", "land for sale", "land for lease", "plots", "plot for sale",
  "apartments for rent", "apartments for sale", "serviced apartments", "vacation rentals",
  "commercial property", "office space", "warehouses", "gated communities",
  "residential property", "villas", "townhouses", "bungalows", "penthouses"
];

// 4. Pure Vehicle Keywords (Physical whole vehicles, not parts or accessories)
const VEHICLE_BODY_KEYWORDS = [
  "sedan", "suv", "hatchback", "pickup truck", "coupe", "convertible",
  "wagon", "station wagon", "minivan", "van", "bus", "lorry", "truck",
  "motorcycle", "motorbike", "scooter", "quad bike", "commercial vehicle",
  "used car", "used cars", "new car", "new cars", "salvage vehicle",
  "electric vehicle", "classic car", "vintage car"
];

// 5. Service & Booking Keywords
const SERVICE_KEYWORDS = [
  "cleaning service", "drycleaning", "plumbing service", "electrical service",
  "landscaping service", "catering service", "transportation service", "it services",
  "beauty services", "barbershop booking", "hair salon", "tutoring service",
  "event planning", "tutors", "tour packages", "safari tour", "flight tickets",
  "hotel booking", "consulting session", "coaching session", "therapy session",
  "security guard", "vip protection", "wellness booking"
];

/**
 * Normalizes all available category, subcategory, name, and tag texts from a product/listing.
 */
function extractSearchableText(product: any): string {
  if (!product) return "";

  const parts: string[] = [];

  // Main Category
  if (product.category) parts.push(String(product.category));
  if (product.productCategory?.name) parts.push(String(product.productCategory.name));

  // Subcategory Name
  if (product.subCategoryName) parts.push(String(product.subCategoryName));

  // Subcategory object / JSON
  if (product.subCategory) {
    let sub = product.subCategory;
    if (typeof sub === "string") {
      try {
        sub = JSON.parse(sub);
      } catch {
        parts.push(sub);
      }
    }
    if (typeof sub === "object" && sub !== null) {
      if (sub.name) parts.push(String(sub.name));
      if (sub.displayName) parts.push(String(sub.displayName));
      if (sub.slug) parts.push(String(sub.slug).replace(/[-_]/g, " "));
    }
  }

  // Listing Name / Title
  if (product.name) parts.push(String(product.name));
  if (product.title) parts.push(String(product.title));

  // Tags
  if (Array.isArray(product.tags)) {
    parts.push(product.tags.join(" "));
  }

  return parts.join(" ").toLowerCase();
}

/**
 * Validates whether a bedrooms value represents a genuine real-estate listing
 * and not an empty array [] or dummy array like [[[[[]]]]] or [0].
 */
function hasValidBedrooms(bedrooms: any): boolean {
  if (!bedrooms || !Array.isArray(bedrooms) || bedrooms.length === 0) return false;
  return bedrooms.some((b: any) => {
    if (!b) return false;
    if (typeof b === "object" && !Array.isArray(b)) {
      return Boolean(b.type || b.price || b.size || b.count || b.name);
    }
    if (typeof b === "string" && b.trim().length > 0 && b !== "0") return true;
    return false;
  });
}

/**
 * Resolves the functional ProductType for any Ghuba product or marketplace listing.
 * Guarantees that:
 * - Hardware, food/cakes, retail, apparel, and automotive accessories are always "ECOMMERCE" (Add to Cart).
 * - Physical properties (real estate) are "PROPERTY".
 * - Physical whole vehicles (cars, motorcycles, trucks) are "AUTO".
 * - Service bookings are "SERVICE".
 */
export function resolveProductType(product: any): ProductType {
  if (!product) return "ECOMMERCE";

  const text = extractSearchableText(product);

  // -------------------------------------------------------------
  // STEP 1: INTERCEPT AUTOMOTIVE ACCESSORIES & PARTS FIRST
  // If an item mentions accessory or part keywords, it is ECOMMERCE (Add to Cart),
  // even if its parent category is "Cars", "Automotive", or "Vehicles".
  // -------------------------------------------------------------
  const isAutoAccessory = AUTO_ACCESSORY_KEYWORDS.some((kw) => text.includes(kw));
  if (isAutoAccessory) {
    return "ECOMMERCE";
  }

  // -------------------------------------------------------------
  // STEP 2: INTERCEPT EXPLICIT E-COMMERCE / RETAIL OVERRIDES
  // Hardware, farm inputs, cakes/groceries, fashion, gadgets, etc.
  // -------------------------------------------------------------
  const isExplicitEcommerce = EXPLICIT_ECOMMERCE_KEYWORDS.some((kw) => text.includes(kw));
  if (isExplicitEcommerce) {
    return "ECOMMERCE";
  }

  // -------------------------------------------------------------
  // STEP 3: PROPERTY (Real Estate / Apartments / Land / Houses)
  // -------------------------------------------------------------
  const isPropertyCategory = PROPERTY_KEYWORDS.some((kw) => text.includes(kw));
  const hasBedrooms = hasValidBedrooms(product.bedrooms);

  if ((isPropertyCategory || hasBedrooms) && !text.includes("paint") && !text.includes("fixture") && !text.includes("hardware")) {
    return "PROPERTY";
  }

  // -------------------------------------------------------------
  // STEP 4: AUTOMOTIVE (Whole Physical Vehicles)
  // Only true physical vehicles, requiring:
  // - A legitimate vehicle category/body keyword, OR
  // - A valid VIN (10+ characters), OR
  // - Category is "Cars" / "Automotive" AND make + model are present (without accessory keywords).
  // -------------------------------------------------------------
  const hasValidVin = typeof product.vin === "string" && product.vin.trim().length >= 10;
  const isVehicleBody = VEHICLE_BODY_KEYWORDS.some((kw) => text.includes(kw));
  const isGeneralAutoCategory = text.includes("cars") || text.includes("automotive") || text.includes("motorcycle") || text.includes("vehicle");

  if (hasValidVin || isVehicleBody) {
    return "AUTO";
  }

  if (isGeneralAutoCategory) {
    // If it has physical vehicle attributes like make and model or year, and is not an accessory
    if (product.make && product.model && (product.year || product.mileage || product.transmission)) {
      return "AUTO";
    }
  }

  // -------------------------------------------------------------
  // STEP 5: SERVICES & BOOKINGS
  // -------------------------------------------------------------
  const isServiceKeyword = SERVICE_KEYWORDS.some((kw) => text.includes(kw));
  if (isServiceKeyword || (Boolean(product.duration) && text.includes("service"))) {
    return "SERVICE";
  }

  // -------------------------------------------------------------
  // STEP 6: DEFAULT TO ECOMMERCE (Standard Add to Cart)
  // All other retail items, hardware, groceries, crafts default to Add to Cart.
  // -------------------------------------------------------------
  return "ECOMMERCE";
}

/**
 * Wraps any product/listing with capabilities derived from its unified ProductType.
 */
export function withCapabilities(listing: any, type?: ProductType): ProductWithCapabilities {
  const resolvedType = type || resolveProductType(listing);
  return {
    ...listing,
    productType: resolvedType,
    capabilities: {
      canAddToCart: resolvedType === "ECOMMERCE",
      canBookSession: resolvedType === "PROPERTY" || resolvedType === "SERVICE",
      canInquire: resolvedType === "AUTO" || resolvedType === "PROPERTY" || resolvedType === "SERVICE",
      isPhysicalAsset: resolvedType === "PROPERTY" || resolvedType === "AUTO",
    },
  };
}
