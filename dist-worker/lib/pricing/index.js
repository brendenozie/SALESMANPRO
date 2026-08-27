"use strict";
// lib/pricing/index.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOrderPricing = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const errors_1 = require("./errors");
__exportStar(require("./types"), exports);
__exportStar(require("./errors"), exports);
const DEFAULT_CURRENCY = "KES";
function roundMoney(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
function positiveNumber(value, fallback = 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return Math.max(0, parsed);
}
function normalizeQuantity(quantity) {
    if (!Number.isFinite(quantity)) {
        throw new errors_1.InvalidQuantityError();
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new errors_1.InvalidQuantityError();
    }
    return quantity;
}
function normalizeOptions(options) {
    if (!options) {
        return [];
    }
    return options.map((option) => ({
        category: String(option.category ?? "").trim(),
        name: String(option.name ?? "").trim(),
        extraPrice: positiveNumber(option.extraPrice),
    }));
}
function derivePricingMode(listing) {
    const transactionType = String(listing.listingTransactionType ?? "").toUpperCase();
    const duration = String(listing.duration ?? "").toLowerCase();
    if (transactionType.includes("RENT") ||
        duration.includes("hour") ||
        duration.includes("day")) {
        return "RENTAL";
    }
    if (transactionType.includes("SERVICE") ||
        listing.hourlyRate !== null ||
        listing.minimumHours !== null) {
        return "SERVICE";
    }
    if (transactionType.includes("BOOK")) {
        return "BOOKING";
    }
    if (transactionType.includes("PROPERTY")) {
        return "PROPERTY";
    }
    if (transactionType.includes("VEHICLE") ||
        transactionType.includes("AUTOMOTIVE")) {
        return "VEHICLE";
    }
    if (transactionType.includes("DIGITAL")) {
        return "DIGITAL";
    }
    return "PRODUCT";
}
function isDealActive(listing) {
    const now = new Date();
    if (!listing.isOnOffer && !listing.isFlashDeal && !listing.isDiscounted) {
        return false;
    }
    if (listing.startDealDate && now < listing.startDealDate) {
        return false;
    }
    if (listing.endDealDate && now > listing.endDealDate) {
        return false;
    }
    return true;
}
function calculateBaseUnitPrice(listing, mode) {
    if ((mode === "SERVICE" || mode === "RENTAL") &&
        listing.hourlyRate !== null &&
        listing.hourlyRate > 0) {
        return listing.hourlyRate;
    }
    if (listing.finalPrice !== null &&
        listing.finalPrice > 0 &&
        isDealActive(listing)) {
        return listing.finalPrice;
    }
    return positiveNumber(listing.sellingPrice);
}
function calculatePercentageDiscount(amount, percentage) {
    if (percentage <= 0) {
        return 0;
    }
    return roundMoney((amount * Math.min(100, percentage)) / 100);
}
function calculateOptionsTotal(options) {
    return roundMoney(options.reduce((sum, option) => sum + positiveNumber(option.extraPrice), 0));
}
function validateSelectedOptions(listing, selectedOptions) {
    if (!selectedOptions.length) {
        return;
    }
    const configuredOptions = Array.isArray(listing.option) ? listing.option : [];
    /**
     * If the listing has no configured options, we do not
     * blindly trust client-provided extraPrice.
     *
     * This prevents WhatsApp/client payloads from saying:
     *
     * extraPrice: 100000
     *
     * and manipulating the order.
     */
    if (!configuredOptions.length) {
        throw new errors_1.InvalidOptionError(`The listing "${listing.name}" does not have configurable options.`);
    }
    for (const selected of selectedOptions) {
        const category = selected.category.toLowerCase();
        const name = selected.name.toLowerCase();
        let found = false;
        let authoritativeExtraPrice = 0;
        for (const rawOption of configuredOptions) {
            if (!rawOption || typeof rawOption !== "object") {
                continue;
            }
            const option = rawOption;
            const optionCategory = String(option.category ?? "").toLowerCase();
            const optionName = String(option.name ?? "").toLowerCase();
            if (optionCategory === category && optionName === name) {
                found = true;
                authoritativeExtraPrice = positiveNumber(option.extraPrice);
                break;
            }
        }
        if (!found) {
            throw new errors_1.InvalidOptionError(`Option "${selected.category}: ${selected.name}" is not available for "${listing.name}".`);
        }
        /**
         * Replace the untrusted client value.
         */
        selected.extraPrice = authoritativeExtraPrice;
    }
}
function calculateServiceDuration(listing, item) {
    if (item.durationHours !== undefined && item.durationHours !== null) {
        if (!Number.isFinite(item.durationHours) || item.durationHours <= 0) {
            throw new errors_1.PricingError("Invalid service/rental duration.", "INVALID_DURATION", 400);
        }
        return item.durationHours;
    }
    if (listing.minimumHours !== null && listing.minimumHours > 0) {
        return listing.minimumHours;
    }
    return 1;
}
function calculateTierPrice(listing, quantity, defaultUnitPrice) {
    if (!Array.isArray(listing.pricingTiers)) {
        return defaultUnitPrice;
    }
    let selectedPrice = defaultUnitPrice;
    for (const rawTier of listing.pricingTiers) {
        if (!rawTier || typeof rawTier !== "object") {
            continue;
        }
        const tier = rawTier;
        const min = Number(tier.minQuantity ?? tier.min ?? 0);
        const max = Number(tier.maxQuantity ?? tier.max ?? Infinity);
        const price = Number(tier.price ?? tier.unitPrice ?? tier.sellingPrice);
        if (Number.isFinite(min) &&
            quantity >= min &&
            quantity <= max &&
            Number.isFinite(price) &&
            price >= 0) {
            selectedPrice = price;
        }
    }
    return selectedPrice;
}
async function getListings(companyId, items) {
    const ids = [...new Set(items.map((item) => item.marketplaceListingId))];
    const listings = await prismadb_1.default.marketplaceListings.findMany({
        where: {
            id: {
                in: ids,
            },
        },
        select: {
            id: true,
            companyId: true,
            name: true,
            sellingPrice: true,
            finalPrice: true,
            buyingPrice: true,
            discount: true,
            tax: true,
            shippingCost: true,
            quantity: true,
            isAvailable: true,
            isOnOffer: true,
            isFlashDeal: true,
            isDiscounted: true,
            delivery: true,
            duration: true,
            hourlyRate: true,
            minimumHours: true,
            listingTransactionType: true,
            listingMarketStatus: true,
            listingSystemStatus: true,
            pricingTiers: true,
            paymentOption: true,
            option: true,
            startDealDate: true,
            endDealDate: true,
            availabilityStart: true,
            availabilityEnd: true,
        },
    });
    const byId = new Map(listings.map((listing) => [listing.id, listing]));
    for (const item of items) {
        const listing = byId.get(item.marketplaceListingId);
        if (!listing) {
            throw new errors_1.ListingNotFoundError(item.marketplaceListingId);
        }
        if (listing.companyId && listing.companyId !== companyId) {
            throw new errors_1.InvalidCompanyError();
        }
    }
    return items.map((item) => {
        const listing = byId.get(item.marketplaceListingId);
        if (!listing) {
            throw new errors_1.ListingNotFoundError(item.marketplaceListingId);
        }
        return listing;
    });
}
function validateListingAvailability(listing, quantity, mode) {
    if (!listing.isAvailable) {
        throw new errors_1.ListingUnavailableError(listing.id);
    }
    if (listing.listingMarketStatus !== "AVAILABLE" &&
        listing.listingMarketStatus !== "ACTIVE") {
        throw new errors_1.ListingUnavailableError(listing.id);
    }
    if (mode === "PRODUCT" &&
        listing.quantity >= 0 &&
        quantity > listing.quantity) {
        throw new errors_1.PricingError(`"${listing.name}" only has ${listing.quantity} units available.`, "INSUFFICIENT_STOCK", 409);
    }
}
function calculateShipping(listing, shippingMethod) {
    if (!listing.delivery) {
        return 0;
    }
    if (!shippingMethod ||
        shippingMethod === "pickup" ||
        shippingMethod === "pickupatshop") {
        return 0;
    }
    return roundMoney(positiveNumber(listing.shippingCost));
}
function calculateTax(taxableAmount, taxPercentage) {
    if (taxPercentage <= 0) {
        return 0;
    }
    return roundMoney((taxableAmount * Math.min(100, taxPercentage)) / 100);
}
/**
 * Promo support.
 *
 * Your current Prisma models supplied in the conversation
 * do not include a PromoCode model, so this intentionally
 * does not query a nonexistent model.
 *
 * Once your promotion model is supplied, this function is
 * the single place to connect it.
 */
async function calculatePromoDiscount(_companyId, _promoCode, _subtotalAfterItemDiscount) {
    if (!_promoCode) {
        return 0;
    }
    /**
     * IMPORTANT:
     *
     * Do not accept arbitrary promo codes here.
     *
     * Until the promotion model exists, reject them instead
     * of silently giving a discount.
     */
    throw new errors_1.PromoCodeError("Promo codes are not currently configured for this store.");
}
function getPaymentOptions(listing) {
    /**
     * This can later be driven directly from Company/
     * PaymentSettings.
     *
     * For now these are the payment methods understood
     * by your existing order APIs.
     */
    const options = [
        "mpesa",
        "paystack",
        "stripe",
        "paypal",
        "cash",
        "cod",
        "pickupatshop",
    ];
    if (listing.paymentOption) {
        options.unshift(listing.paymentOption);
    }
    return [...new Set(options)];
}
async function calculateOrderPricing(request) {
    if (!request.companyId) {
        throw new errors_1.PricingError("Company ID is required.", "COMPANY_REQUIRED", 400);
    }
    if (!request.items?.length) {
        throw new errors_1.PricingError("At least one item is required.", "ITEMS_REQUIRED", 400);
    }
    const normalizedItems = request.items.map((item) => ({
        ...item,
        quantity: normalizeQuantity(item.quantity),
        selectedOptions: normalizeOptions(item.selectedOptions),
    }));
    const listings = await getListings(request.companyId, normalizedItems);
    const listingMap = new Map(listings.map((listing) => [listing.id, listing]));
    const resultItems = [];
    let subtotal = 0;
    let itemDiscount = 0;
    let shipping = 0;
    let tax = 0;
    let requiresBooking = false;
    let requiresDelivery = false;
    for (const item of normalizedItems) {
        const listing = listingMap.get(item.marketplaceListingId);
        if (!listing) {
            throw new errors_1.ListingNotFoundError(item.marketplaceListingId);
        }
        const mode = derivePricingMode(listing);
        validateListingAvailability(listing, item.quantity, mode);
        validateSelectedOptions(listing, item.selectedOptions ?? []);
        const optionsTotal = calculateOptionsTotal(item.selectedOptions ?? []);
        let baseUnitPrice = calculateBaseUnitPrice(listing, mode);
        if (mode === "SERVICE" || mode === "RENTAL") {
            const duration = calculateServiceDuration(listing, item);
            baseUnitPrice = baseUnitPrice * duration;
            requiresBooking = true;
        }
        baseUnitPrice = calculateTierPrice(listing, item.quantity, baseUnitPrice);
        const unitPriceWithOptions = roundMoney(baseUnitPrice + optionsTotal);
        const lineSubtotal = roundMoney(unitPriceWithOptions * item.quantity);
        let lineDiscount = 0;
        if (isDealActive(listing) && listing.discount && listing.discount > 0) {
            lineDiscount = calculatePercentageDiscount(lineSubtotal, listing.discount);
        }
        const taxableAmount = Math.max(0, lineSubtotal - lineDiscount);
        const lineTax = calculateTax(taxableAmount, positiveNumber(listing.tax));
        const lineShipping = calculateShipping(listing, request.shippingMethod);
        const lineTotal = roundMoney(taxableAmount + lineTax + lineShipping);
        if (listing.delivery) {
            requiresDelivery = true;
        }
        subtotal += lineSubtotal;
        itemDiscount += lineDiscount;
        tax += lineTax;
        shipping += lineShipping;
        resultItems.push({
            marketplaceListingId: listing.id,
            name: listing.name,
            quantity: item.quantity,
            unitPrice: roundMoney(baseUnitPrice),
            optionsTotal,
            unitPriceWithOptions,
            subtotal: lineSubtotal,
            discount: lineDiscount,
            tax: lineTax,
            shipping: lineShipping,
            total: lineTotal,
            selectedOptions: item.selectedOptions ?? [],
            pricingMode: mode,
        });
    }
    subtotal = roundMoney(subtotal);
    itemDiscount = roundMoney(itemDiscount);
    tax = roundMoney(tax);
    shipping = roundMoney(shipping);
    const subtotalAfterItemDiscount = roundMoney(Math.max(0, subtotal - itemDiscount));
    const promoDiscount = await calculatePromoDiscount(request.companyId, request.promoCode, subtotalAfterItemDiscount);
    const totalDiscount = roundMoney(itemDiscount + promoDiscount);
    const total = roundMoney(Math.max(0, subtotal - totalDiscount + tax + shipping));
    return {
        currency: DEFAULT_CURRENCY,
        items: resultItems,
        subtotal,
        itemDiscount,
        promoDiscount,
        totalDiscount,
        shipping,
        tax,
        total,
        requiresBooking,
        requiresDelivery,
        paymentOptions: getPaymentOptions(listings[0]),
        promoCode: request.promoCode ?? null,
        calculatedAt: new Date().toISOString(),
    };
}
exports.calculateOrderPricing = calculateOrderPricing;
