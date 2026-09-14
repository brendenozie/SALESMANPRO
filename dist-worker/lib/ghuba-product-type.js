"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCapabilities = exports.resolveProductType = void 0;
const CATEGORY_STEPS_1 = require("@/constant/CATEGORY_STEPS");
// ----------------------------------------------------------------------
// 0. Build normalized lookup dictionary from CATEGORY_STEPS
// ----------------------------------------------------------------------
const CATEGORY_STEPS_MAP = new Map();
Object.entries(CATEGORY_STEPS_1.CATEGORY_STEPS).forEach(([key, steps]) => {
    CATEGORY_STEPS_MAP.set(key.trim().toLowerCase(), steps);
});
// Helper to look up steps by category name (handles slug/hyphen/store variations)
function getStepsForCategory(name) {
    if (!name || typeof name !== "string")
        return null;
    const cleaned = name.trim().toLowerCase();
    // Exact match
    if (CATEGORY_STEPS_MAP.has(cleaned)) {
        return CATEGORY_STEPS_MAP.get(cleaned);
    }
    // Try replacing hyphens and underscores with spaces
    const unslugged = cleaned.replace(/[-_]/g, " ").trim();
    if (CATEGORY_STEPS_MAP.has(unslugged)) {
        return CATEGORY_STEPS_MAP.get(unslugged);
    }
    // If the category explicitly indicates a "Service" (e.g., "Automotive Services", "Cleaning Services")
    if (unslugged.endsWith(" services") || unslugged.endsWith(" service")) {
        // Check if CATEGORY_STEPS has a direct match
        if (CATEGORY_STEPS_MAP.has(unslugged)) {
            return CATEGORY_STEPS_MAP.get(unslugged);
        }
        // Return standard Service steps
        return CATEGORY_STEPS_1.CATEGORY_STEPS["Services"] || [1, 2, 7, 15, 16, 17, 8, 9, 10, 12, 11];
    }
    // If the category explicitly indicates a "Store" / "Shop" (e.g., "Automotive Store", "Hardware Store")
    if (unslugged.endsWith(" store") || unslugged.endsWith(" shop")) {
        if (CATEGORY_STEPS_MAP.has(unslugged)) {
            return CATEGORY_STEPS_MAP.get(unslugged);
        }
        // Retail store steps: standard ecommerce [1, 2, 3, 7, 8, 9, 10, 12, 11]
        return [1, 2, 3, 7, 8, 9, 10, 12, 11];
    }
    // Search for matching key in CATEGORY_STEPS_MAP
    for (const [key, steps] of CATEGORY_STEPS_MAP.entries()) {
        if (key === unslugged || key.startsWith(unslugged) || unslugged.startsWith(key)) {
            return steps;
        }
    }
    return null;
}
// ----------------------------------------------------------------------
// 1. Explicit E-commerce / Retail override keywords (always allow Add to Cart)
// ----------------------------------------------------------------------
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
    "earphones", "speakers", "cables", "chargers", "cases", "covers", "monitors",
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
// ----------------------------------------------------------------------
// 2. Automotive Accessories, Parts, Fluids & Care (always allow Add to Cart)
// ----------------------------------------------------------------------
const AUTO_ACCESSORY_KEYWORDS = [
    "accessories", "accessory", "spare parts", "auto parts", "car parts",
    "performance parts", "car care", "charging stations", "charger", "tires", "tyres",
    "wheels", "rims", "car stereo", "car navigation", "car gps", "car interior",
    "car exterior", "car alarm", "vehicle security", "car security",
    "tracking systems", "motor oil", "engine oil",
    "lubricants", "coolant", "brake fluid", "transmission fluid", "batteries", "car battery",
    "power systems", "led bulbs", "headlights", "taillights", "fog lights",
    "dash cams", "dash cam", "obd", "diagnostic tools", "jumper cables",
    "wiper blades", "washers", "steering cover",
    "seat covers", "floor mats", "wraps", "decals",
    "stickers", "towing equipment", "trailers", "mufflers",
    "radiators", "shock absorbers", "shocks", "struts", "engine mounts",
    "oil filter", "air filter", "fuel filter", "cabin filter",
    "brake pads", "brake discs", "rotors", "spark plugs", "clutch plate", "fan belt",
    "timing belt", "air freshener", "car wax", "car polish", "car shampoo",
    "key fob", "keychain", "tire inflator", "pressure gauge"
];
// ----------------------------------------------------------------------
// 3. Service / Labor Action Keywords (Higher precedence than individual product words)
// For example: "Oil Change Service" is a SERVICE, not a bottle of oil.
// ----------------------------------------------------------------------
const EXPLICIT_SERVICE_ACTION_KEYWORDS = [
    "service", "services", "repair", "repairs", "maintenance", "installation",
    "diagnostic", "inspection", "car wash", "auto detailing", "wheel alignment",
    "oil change", "breakdown", "towing service", "mechanic", "hvac", "tune up"
];
// ----------------------------------------------------------------------
// 4. Property Keywords (Real estate, land, housing, commercial space)
// ----------------------------------------------------------------------
const PROPERTY_KEYWORDS = [
    "real estate", "property", "houses", "house", "land", "plot", "plots",
    "apartments", "apartment", "serviced apartments", "vacation rentals",
    "commercial property", "commercial", "office space", "offices", "office",
    "warehouses", "warehouse", "gated communities", "residential property",
    "villas", "villa", "townhouses", "townhouse", "bungalows", "bungalow",
    "penthouses", "penthouse", "hostels", "hostel", "shared housing",
    "event spaces", "event space", "farms", "farm"
];
// ----------------------------------------------------------------------
// 5. Pure Vehicle Keywords (Physical whole vehicles)
// ----------------------------------------------------------------------
const VEHICLE_BODY_KEYWORDS = [
    "sedan", "sedans", "suv", "suvs", "hatchback", "hatchbacks", "pickup truck",
    "pickup trucks", "coupe", "convertible", "wagon", "station wagon", "minivan",
    "van", "vans", "bus", "buses", "lorry", "lorries", "truck", "trucks",
    "motorcycle", "motorcycles", "motorbike", "motorbikes", "scooter", "scooters",
    "quad bike", "commercial vehicle", "commercial vehicles",
    "used car", "used cars", "new car", "new cars", "salvage vehicle",
    "electric vehicle", "electric vehicles", "classic car", "vintage car",
    "luxury cars", "off-road vehicles", "sports cars"
];
// ----------------------------------------------------------------------
// 6. Service & Booking Keywords
// ----------------------------------------------------------------------
const SERVICE_KEYWORDS = [
    "cleaning", "drycleaning", "dry cleaning", "laundry", "plumbing", "electrical",
    "landscaping", "gardener", "catering", "caterer", "transportation", "logistics",
    "it services", "web development", "beauty services", "barbershop", "barber",
    "hair salon", "salon", "spa", "massage", "tutoring", "tutor", "tutors",
    "event planning", "event planner", "tour packages", "safari tour", "travel & experiences",
    "hotel booking", "consulting", "consultant", "coaching", "coach",
    "therapist", "therapy", "counselor", "counseling", "security services",
    "security guard", "vip protection", "wellness", "fitness & wellness",
    "gym membership", "personal trainer", "mechanic", "car repair", "repair service",
    "appliance repair", "pest control", "carpentry", "painting service", "courier",
    "car wash", "auto repair", "car detailing", "wheel alignment", "inspection service",
    "car insurance services", "car rental & leasing"
];
/**
 * Normalizes all available category, subcategory, name, and tag texts from a product/listing.
 */
function extractSearchableText(product) {
    if (!product)
        return "";
    const parts = [];
    // Main Category
    if (typeof product.category === "string") {
        parts.push(product.category);
    }
    else if (product.category && typeof product.category === "object") {
        if (product.category.name)
            parts.push(String(product.category.name));
        if (product.category.displayName)
            parts.push(String(product.category.displayName));
    }
    if (product.productCategory?.name)
        parts.push(String(product.productCategory.name));
    // Subcategory Name
    if (product.subCategoryName)
        parts.push(String(product.subCategoryName));
    // Subcategory object / JSON
    if (product.subCategory) {
        let sub = product.subCategory;
        if (typeof sub === "string") {
            try {
                sub = JSON.parse(sub);
            }
            catch {
                parts.push(sub);
            }
        }
        if (typeof sub === "object" && sub !== null) {
            if (sub.name)
                parts.push(String(sub.name));
            if (sub.displayName)
                parts.push(String(sub.displayName));
            if (sub.slug)
                parts.push(String(sub.slug).replace(/[-_]/g, " "));
        }
    }
    // Listing Name / Title
    if (product.name)
        parts.push(String(product.name));
    if (product.title)
        parts.push(String(product.title));
    // Tags
    if (Array.isArray(product.tags)) {
        parts.push(product.tags.join(" "));
    }
    return parts.join(" ").toLowerCase();
}
/**
 * Validates whether a bedrooms value represents a genuine real-estate listing
 */
function hasValidBedrooms(bedrooms) {
    if (!bedrooms)
        return false;
    if (typeof bedrooms === "number" && bedrooms > 0)
        return true;
    if (!Array.isArray(bedrooms) || bedrooms.length === 0)
        return false;
    return bedrooms.some((b) => {
        if (!b)
            return false;
        if (typeof b === "object" && !Array.isArray(b)) {
            return Boolean(b.type || b.price || b.size || b.count || b.name);
        }
        if (typeof b === "string" && b.trim().length > 0 && b !== "0")
            return true;
        return false;
    });
}
/**
 * Resolves the ProductType directly from the CATEGORY_STEPS configuration.
 * Prioritizes subcategories over umbrella parent categories (e.g. "Automotive").
 */
function resolveFromCategorySteps(product) {
    if (!product)
        return null;
    // PRIORITY 1: Subcategory (the most specific definition)
    const subCandidates = [];
    if (product.subCategoryName)
        subCandidates.push(product.subCategoryName);
    if (product.subCategory) {
        if (typeof product.subCategory === "string") {
            try {
                const parsed = JSON.parse(product.subCategory);
                if (parsed?.name)
                    subCandidates.push(parsed.name);
                if (parsed?.displayName)
                    subCandidates.push(parsed.displayName);
            }
            catch {
                subCandidates.push(product.subCategory);
            }
        }
        else if (typeof product.subCategory === "object") {
            if (product.subCategory.name)
                subCandidates.push(product.subCategory.name);
            if (product.subCategory.displayName)
                subCandidates.push(product.subCategory.displayName);
        }
    }
    // PRIORITY 2: Main Category
    const mainCandidates = [];
    if (typeof product.category === "string")
        mainCandidates.push(product.category);
    if (product.category?.name)
        mainCandidates.push(product.category.name);
    if (product.category?.displayName)
        mainCandidates.push(product.category.displayName);
    if (product.productCategory?.name)
        mainCandidates.push(product.productCategory.name);
    // Helper to interpret steps array
    const interpretSteps = (candidateName, steps) => {
        const candidateLower = candidateName.toLowerCase();
        // If candidate specifically mentions service / repair / maintenance / wash / detailing
        if (candidateLower.includes("service") ||
            candidateLower.includes("repair") ||
            candidateLower.includes("maintenance") ||
            candidateLower.includes("wash") ||
            candidateLower.includes("detailing") ||
            candidateLower.includes("inspection")) {
            return "SERVICE";
        }
        // Auto Accessories / Spare Parts check
        const isAutoAccessorySteps = steps.includes(9) &&
            !steps.includes(4) &&
            !steps.includes(5) &&
            !steps.includes(14);
        if (isAutoAccessorySteps ||
            candidateLower.includes("accessories") ||
            candidateLower.includes("parts") ||
            candidateLower.includes("care") ||
            candidateLower.includes("batteries") ||
            candidateLower.includes("tires") ||
            candidateLower.includes("wheels")) {
            return "ECOMMERCE";
        }
        // Services & Booking (Step 16: ServiceSpecifics, Step 17: BookingSlot, Step 15: PricingTiers)
        if (steps.includes(16) || steps.includes(17) || (steps.includes(15) && !steps.includes(9))) {
            return "SERVICE";
        }
        // Property (Step 19: PropertyTypeDetails, Step 13: AmenitiesStep)
        if (steps.includes(19) || steps.includes(13)) {
            return "PROPERTY";
        }
        // Whole Vehicles (Step 4: EnginePerformance, Step 5: OwnershipPricing, Step 14: VehicleAmenitiesStep)
        if (steps.includes(4) || steps.includes(5) || steps.includes(14)) {
            return "AUTO";
        }
        // E-Commerce
        if (steps.includes(7) || steps.includes(9) || steps.includes(10)) {
            return "ECOMMERCE";
        }
        return null;
    };
    // 1. Evaluate Subcategory FIRST
    for (const sub of subCandidates) {
        // Also check if subcategory name directly indicates a service or accessory
        const subLower = sub.toLowerCase();
        if (subLower.includes("repair") ||
            subLower.includes("maintenance") ||
            subLower.includes("wash") ||
            subLower.includes("detailing") ||
            subLower.includes("alignment") ||
            subLower.includes("service")) {
            return "SERVICE";
        }
        if (subLower.includes("accessories") ||
            subLower.includes("parts") ||
            subLower.includes("tires") ||
            subLower.includes("wheels") ||
            subLower.includes("batteries") ||
            subLower.includes("care")) {
            return "ECOMMERCE";
        }
        const steps = getStepsForCategory(sub);
        if (steps && Array.isArray(steps)) {
            const result = interpretSteps(sub, steps);
            if (result)
                return result;
        }
    }
    // 2. Evaluate Main Category SECOND
    for (const main of mainCandidates) {
        const mainLower = main.toLowerCase();
        // Check if main category explicitly indicates "Services" vs "Store"
        if (mainLower.includes("service")) {
            return "SERVICE";
        }
        if (mainLower.includes("store") || mainLower.includes("shop")) {
            return "ECOMMERCE";
        }
        // Broad umbrella categories like "Automotive" or "Cars" with NO subcategory
        // should not prematurely classify before checking product name/specs!
        if (mainLower === "automotive" || mainLower === "cars" || mainLower === "vehicles") {
            // Don't decide yet; allow attribute & keyword checks on the product name/specs to decide
            continue;
        }
        const steps = getStepsForCategory(main);
        if (steps && Array.isArray(steps)) {
            const result = interpretSteps(main, steps);
            if (result)
                return result;
        }
    }
    return null;
}
/**
 * Resolves the functional ProductType for any Ghuba product or marketplace listing.
 * Guarantees that:
 * - Umbrella categories like "Automotive" differentiate accurately based on subcategory:
 *   - "Sedans" / "SUVs" -> "AUTO"
 *   - "Car Accessories" / "Batteries" -> "ECOMMERCE"
 *   - "Car Repair" / "Car Wash" -> "SERVICE"
 * - Categories ending in "Services" default to "SERVICE".
 * - Categories ending in "Store" default to "ECOMMERCE".
 */
function resolveProductType(product) {
    if (!product)
        return "ECOMMERCE";
    const text = extractSearchableText(product);
    // -------------------------------------------------------------
    // STEP 1: SERVICE LABOR ACTION INTERCEPTION
    // If the listing title/subcategory specifically mentions a performed service
    // like "oil change service", "car wash", "repair", "wheel alignment",
    // it is a SERVICE (even if it mentions oil, wax, or brakes).
    // -------------------------------------------------------------
    const isServiceAction = EXPLICIT_SERVICE_ACTION_KEYWORDS.some((kw) => text.includes(kw));
    if (isServiceAction) {
        // Confirm it's not a pure physical tool like "diagnostic tool" or "repair kit"
        if (!text.includes("kit") && !text.includes("tool") && !text.includes("manual")) {
            return "SERVICE";
        }
    }
    // -------------------------------------------------------------
    // STEP 2: INTERCEPT AUTOMOTIVE ACCESSORIES & PARTS
    // If an item mentions accessory or part keywords, it is ECOMMERCE (Add to Cart).
    // -------------------------------------------------------------
    const isAutoAccessory = AUTO_ACCESSORY_KEYWORDS.some((kw) => text.includes(kw));
    if (isAutoAccessory) {
        return "ECOMMERCE";
    }
    // -------------------------------------------------------------
    // STEP 3: INTERCEPT EXPLICIT E-COMMERCE / RETAIL OVERRIDES
    // Hardware, farm inputs, cakes/groceries, fashion, gadgets, etc.
    // -------------------------------------------------------------
    const isExplicitEcommerce = EXPLICIT_ECOMMERCE_KEYWORDS.some((kw) => text.includes(kw));
    if (isExplicitEcommerce) {
        return "ECOMMERCE";
    }
    // -------------------------------------------------------------
    // STEP 4: CONSULT CATEGORY_STEPS (Subcategory first, then Main Category)
    // -------------------------------------------------------------
    const typeFromCategorySteps = resolveFromCategorySteps(product);
    if (typeFromCategorySteps) {
        return typeFromCategorySteps;
    }
    // -------------------------------------------------------------
    // STEP 5: ATTRIBUTE-BASED INFERENCE (From populated product fields)
    // -------------------------------------------------------------
    // Services attribute check
    const hasServiceFields = Boolean(product.hourlyRate) ||
        Boolean(product.minimumHours) ||
        Boolean(product.serviceSchedule) ||
        Boolean(product.minNoticePeriod) ||
        Boolean(product.maxBookingAhead);
    if (hasServiceFields) {
        return "SERVICE";
    }
    // Property attribute check
    const hasBedrooms = hasValidBedrooms(product.bedrooms);
    const hasPropertyFields = Boolean(product.propertyTypeId) ||
        hasBedrooms ||
        Boolean(product.bathrooms);
    if (hasPropertyFields && !text.includes("paint") && !text.includes("fixture") && !text.includes("hardware")) {
        return "PROPERTY";
    }
    // Whole vehicle attribute check
    const hasValidVin = typeof product.vin === "string" && product.vin.trim().length >= 10;
    if (hasValidVin) {
        return "AUTO";
    }
    if (product.make && product.model && (product.year || product.mileage || product.transmission || product.engineSize)) {
        return "AUTO";
    }
    // -------------------------------------------------------------
    // STEP 6: KEYWORD-BASED FALLBACK INFERENCE
    // -------------------------------------------------------------
    // Property keywords
    const isPropertyCategory = PROPERTY_KEYWORDS.some((kw) => {
        const regex = new RegExp(`\\b${kw}\\b`, "i");
        return regex.test(text);
    });
    if (isPropertyCategory && !text.includes("paint") && !text.includes("fixture") && !text.includes("hardware")) {
        return "PROPERTY";
    }
    // Vehicle keywords
    const isVehicleBody = VEHICLE_BODY_KEYWORDS.some((kw) => {
        const regex = new RegExp(`\\b${kw}\\b`, "i");
        return regex.test(text);
    });
    if (isVehicleBody) {
        return "AUTO";
    }
    // Service keywords
    const isServiceKeyword = SERVICE_KEYWORDS.some((kw) => {
        const regex = new RegExp(`\\b${kw}\\b`, "i");
        return regex.test(text);
    });
    if (isServiceKeyword || (Boolean(product.duration) && text.includes("service"))) {
        return "SERVICE";
    }
    // -------------------------------------------------------------
    // STEP 7: DEFAULT TO ECOMMERCE (Standard Add to Cart)
    // All other retail items, hardware, groceries, crafts default to Add to Cart.
    // -------------------------------------------------------------
    return "ECOMMERCE";
}
exports.resolveProductType = resolveProductType;
/**
 * Wraps any product/listing with capabilities derived from its unified ProductType.
 */
function withCapabilities(listing, type) {
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
exports.withCapabilities = withCapabilities;
