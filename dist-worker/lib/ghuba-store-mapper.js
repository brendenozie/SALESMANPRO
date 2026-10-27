"use strict";
/**
 * lib/ghuba-store-mapper.ts
 *
 * Deterministic mapping service between Ghuba marketplace retail categories
 * and SalesmanPro E-commerce variants and canonical website builder templates.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveGhubaStoreVariant = void 0;
function resolveGhubaStoreVariant(categoryInput) {
    const norm = (categoryInput || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    if (norm.includes("fashion") ||
        norm.includes("apparel") ||
        norm.includes("clothing") ||
        norm.includes("boutique")) {
        return {
            category: "E-commerce",
            variant: "fashion",
            templateKey: "fashion@v1",
        };
    }
    if (norm.includes("shoe") ||
        norm.includes("footwear") ||
        norm.includes("sneaker") ||
        norm.includes("kick")) {
        return {
            category: "E-commerce",
            variant: "shoes-store",
            templateKey: "ecommerce-shoes@v1",
        };
    }
    // Specific audio/earphones
    if (norm.includes("earphone") || norm.includes("headphone") || norm.includes("audio")) {
        return {
            category: "E-commerce",
            variant: "earphones-store",
            templateKey: "ecommerce-earphones@v1",
        };
    }
    // General Electronics, Gadgets, Phones, Computers
    if (norm.includes("electronic") ||
        norm.includes("gadget") ||
        norm.includes("phone") ||
        norm.includes("tech") ||
        norm.includes("computer") ||
        norm.includes("laptop")) {
        return {
            category: "E-commerce",
            variant: "ecommerce",
            templateKey: "ecommerce-default@v1",
        };
    }
    if (norm.includes("grocer") ||
        norm.includes("food") ||
        norm.includes("snack") ||
        norm.includes("fresh") ||
        norm.includes("market")) {
        return {
            category: "E-commerce",
            variant: "groceries-store",
            templateKey: "ecommerce-groceries@v1",
        };
    }
    if (norm.includes("decor") ||
        norm.includes("furniture") ||
        norm.includes("living") ||
        norm.includes("home")) {
        return {
            category: "E-commerce",
            variant: "furniture-store",
            templateKey: "furniture@v1",
        };
    }
    // Beauty, Cosmetics, Skincare (uses clean modern e-commerce storefront)
    if (norm.includes("beauty") ||
        norm.includes("cosmetic") ||
        norm.includes("skincare") ||
        norm.includes("makeup")) {
        return {
            category: "E-commerce",
            variant: "ecommerce",
            templateKey: "ecommerce-default@v1",
        };
    }
    if (norm.includes("baby") ||
        norm.includes("kid") ||
        norm.includes("toy") ||
        norm.includes("child")) {
        return {
            category: "E-commerce",
            variant: "baby-store",
            templateKey: "ecommerce-baby@v1",
        };
    }
    // Hardware & Tools
    if (norm.includes("hardware") || norm.includes("tool")) {
        return {
            category: "E-commerce",
            variant: "hardware-store",
            templateKey: "ecommerce-hardware@v1",
        };
    }
    // Bicycles & Cycling
    if (norm.includes("bicycle") || norm.includes("cycling") || norm === "bike" || norm.includes("bike-store")) {
        return {
            category: "E-commerce",
            variant: "bike-store",
            templateKey: "ecommerce-bike@v1",
        };
    }
    // Motorcycles & Motorbikes
    if (norm.includes("motorcycle") || norm.includes("motorbike")) {
        return {
            category: "E-commerce",
            variant: "motorcycle-store",
            templateKey: "ecommerce-motorcycle@v1",
        };
    }
    // Car Dealership / Vehicles
    if (norm.includes("dealership") || norm.includes("car-dealer") || norm.includes("vehicle-sales")) {
        return {
            category: "Automotive",
            variant: "automotive",
            templateKey: "automotive@v1",
        };
    }
    // General Automotive, Motor & Car Accessories
    if (norm.includes("auto") ||
        norm.includes("motor") ||
        norm.includes("car") ||
        norm.includes("vehicle")) {
        return {
            category: "E-commerce",
            variant: "automotive-store",
            templateKey: "ecommerce-accessories@v1",
        };
    }
    if (norm.includes("cake") ||
        norm.includes("bake") ||
        norm.includes("pastry") ||
        norm.includes("treat") ||
        norm.includes("dining") ||
        norm.includes("cafe")) {
        return {
            category: "E-commerce",
            variant: "cake-store",
            templateKey: "ecommerce-cake@v1",
        };
    }
    if (norm.includes("pet")) {
        return {
            category: "E-commerce",
            variant: "pets-store",
            templateKey: "ecommerce-pets@v1",
        };
    }
    if (norm.includes("book") || norm.includes("stationery")) {
        return {
            category: "E-commerce",
            variant: "book-store",
            templateKey: "ecommerce-book@v1",
        };
    }
    if (norm.includes("art") ||
        norm.includes("craft") ||
        norm.includes("gift") ||
        norm.includes("jewel") ||
        norm.includes("luxury")) {
        return {
            category: "E-commerce",
            variant: "accessories-store",
            templateKey: "ecommerce-accessories@v1",
        };
    }
    // Default clean fallback: E-commerce modern storefront
    return {
        category: "E-commerce",
        variant: "ecommerce",
        templateKey: "ecommerce-default@v1",
    };
}
exports.resolveGhubaStoreVariant = resolveGhubaStoreVariant;
