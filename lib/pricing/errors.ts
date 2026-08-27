// lib/pricing/errors.ts

export class PricingError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code = "PRICING_ERROR", status = 400) {
    super(message);

    this.name = "PricingError";
    this.code = code;
    this.status = status;
  }
}

export class ListingNotFoundError extends PricingError {
  constructor(listingId: string) {
    super(
      `Marketplace listing ${listingId} was not found.`,
      "LISTING_NOT_FOUND",
      404,
    );
  }
}

export class ListingUnavailableError extends PricingError {
  constructor(listingId: string) {
    super(
      `The requested listing is currently unavailable.`,
      "LISTING_UNAVAILABLE",
      409,
    );
  }
}

export class InvalidQuantityError extends PricingError {
  constructor() {
    super("Quantity must be a positive whole number.", "INVALID_QUANTITY", 400);
  }
}

export class InvalidOptionError extends PricingError {
  constructor(message: string) {
    super(message, "INVALID_OPTION", 400);
  }
}

export class InvalidCompanyError extends PricingError {
  constructor() {
    super(
      "The listing does not belong to the requested company.",
      "INVALID_COMPANY",
      403,
    );
  }
}

export class PromoCodeError extends PricingError {
  constructor(message: string) {
    super(message, "INVALID_PROMO_CODE", 400);
  }
}
