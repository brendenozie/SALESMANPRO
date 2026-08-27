"use strict";
// lib/pricing/errors.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoCodeError = exports.InvalidCompanyError = exports.InvalidOptionError = exports.InvalidQuantityError = exports.ListingUnavailableError = exports.ListingNotFoundError = exports.PricingError = void 0;
class PricingError extends Error {
    code;
    status;
    constructor(message, code = "PRICING_ERROR", status = 400) {
        super(message);
        this.name = "PricingError";
        this.code = code;
        this.status = status;
    }
}
exports.PricingError = PricingError;
class ListingNotFoundError extends PricingError {
    constructor(listingId) {
        super(`Marketplace listing ${listingId} was not found.`, "LISTING_NOT_FOUND", 404);
    }
}
exports.ListingNotFoundError = ListingNotFoundError;
class ListingUnavailableError extends PricingError {
    constructor(listingId) {
        super(`The requested listing is currently unavailable.`, "LISTING_UNAVAILABLE", 409);
    }
}
exports.ListingUnavailableError = ListingUnavailableError;
class InvalidQuantityError extends PricingError {
    constructor() {
        super("Quantity must be a positive whole number.", "INVALID_QUANTITY", 400);
    }
}
exports.InvalidQuantityError = InvalidQuantityError;
class InvalidOptionError extends PricingError {
    constructor(message) {
        super(message, "INVALID_OPTION", 400);
    }
}
exports.InvalidOptionError = InvalidOptionError;
class InvalidCompanyError extends PricingError {
    constructor() {
        super("The listing does not belong to the requested company.", "INVALID_COMPANY", 403);
    }
}
exports.InvalidCompanyError = InvalidCompanyError;
class PromoCodeError extends PricingError {
    constructor(message) {
        super(message, "INVALID_PROMO_CODE", 400);
    }
}
exports.PromoCodeError = PromoCodeError;
