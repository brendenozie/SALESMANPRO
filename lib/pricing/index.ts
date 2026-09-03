// lib/pricing/index.ts

import prisma from "@/server/db/prismadb";

import {
  PricingError,
  ListingNotFoundError,
  ListingUnavailableError,
  InvalidQuantityError,
  InvalidOptionError,
  InvalidCompanyError,
  PromoCodeError,
} from "./errors";

import type {
  PricingMode,
  PricingOption,
  PricingItemInput,
  PricingRequest,
  PricingResult,
  PricingItemResult,
} from "./types";

export * from "./types";
export * from "./errors";

type ListingRecord = {
  id: string;
  companyId: string | null;

  name: string;

  sellingPrice: number;
  finalPrice: number | null;

  buyingPrice: number;

  discount: number | null;
  tax: number | null;

  shippingCost: number | null;

  quantity: number;

  isAvailable: boolean;

  isOnOffer: boolean;
  isFlashDeal: boolean;
  isDiscounted: boolean;

  delivery: boolean;

  paymentOption: string;

  duration: string | null;

  hourlyRate: number | null;
  minimumHours: number | null;

  listingTransactionType: string;
  listingMarketStatus: string;
  listingSystemStatus: string;

  pricingTiers: unknown[];

  option: unknown[];

  startDealDate: Date | null;
  endDealDate: Date | null;

  availabilityStart: Date | null;
  availabilityEnd: Date | null;
};

const DEFAULT_CURRENCY = "KES";

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function positiveNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(0, parsed);
}

function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) {
    throw new InvalidQuantityError();
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InvalidQuantityError();
  }

  return quantity;
}

function normalizeOptions(options?: PricingOption[]): PricingOption[] {
  if (!options) {
    return [];
  }

  return options.map((option) => ({
    category: String(option.category ?? "").trim(),
    name: String(option.name ?? "").trim(),
    extraPrice: positiveNumber(option.extraPrice),
  }));
}

function derivePricingMode(listing: ListingRecord): PricingMode {
  const transactionType = String(
    listing.listingTransactionType ?? "",
  ).toUpperCase();

  const duration = String(listing.duration ?? "").toLowerCase();

  if (
    transactionType.includes("RENT") ||
    duration.includes("hour") ||
    duration.includes("day")
  ) {
    return "RENTAL";
  }

  if (
    transactionType.includes("SERVICE") ||
    listing.hourlyRate !== null ||
    listing.minimumHours !== null
  ) {
    return "SERVICE";
  }

  if (transactionType.includes("BOOK")) {
    return "BOOKING";
  }

  if (transactionType.includes("PROPERTY")) {
    return "PROPERTY";
  }

  if (
    transactionType.includes("VEHICLE") ||
    transactionType.includes("AUTOMOTIVE")
  ) {
    return "VEHICLE";
  }

  if (transactionType.includes("DIGITAL")) {
    return "DIGITAL";
  }

  return "PRODUCT";
}

function isDealActive(listing: ListingRecord): boolean {
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

function calculateBaseUnitPrice(
  listing: ListingRecord,
  mode: PricingMode,
): number {
  if (
    (mode === "SERVICE" || mode === "RENTAL") &&
    listing.hourlyRate !== null &&
    listing.hourlyRate > 0
  ) {
    return listing.hourlyRate;
  }

  if (
    listing.finalPrice !== null &&
    listing.finalPrice > 0 &&
    isDealActive(listing)
  ) {
    return listing.finalPrice;
  }

  return positiveNumber(listing.sellingPrice);
}

function calculatePercentageDiscount(
  amount: number,
  percentage: number,
): number {
  if (percentage <= 0) {
    return 0;
  }

  return roundMoney((amount * Math.min(100, percentage)) / 100);
}

function calculateOptionsTotal(options: PricingOption[]): number {
  return roundMoney(
    options.reduce((sum, option) => sum + positiveNumber(option.extraPrice), 0),
  );
}

function validateSelectedOptions(
  listing: ListingRecord,
  selectedOptions: PricingOption[],
): void {
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
    throw new InvalidOptionError(
      `The listing "${listing.name}" does not have configurable options.`,
    );
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

      const option = rawOption as Record<string, unknown>;

      const optionCategory = String(option.category ?? "").toLowerCase();

      const optionName = String(option.name ?? "").toLowerCase();

      if (optionCategory === category && optionName === name) {
        found = true;

        authoritativeExtraPrice = positiveNumber(option.extraPrice);

        break;
      }
    }

    if (!found) {
      throw new InvalidOptionError(
        `Option "${selected.category}: ${selected.name}" is not available for "${listing.name}".`,
      );
    }

    /**
     * Replace the untrusted client value.
     */
    selected.extraPrice = authoritativeExtraPrice;
  }
}

function calculateServiceDuration(
  listing: ListingRecord,
  item: PricingItemInput,
): number {
  if (item.durationHours !== undefined && item.durationHours !== null) {
    if (!Number.isFinite(item.durationHours) || item.durationHours <= 0) {
      throw new PricingError(
        "Invalid service/rental duration.",
        "INVALID_DURATION",
        400,
      );
    }

    return item.durationHours;
  }

  if (listing.minimumHours !== null && listing.minimumHours > 0) {
    return listing.minimumHours;
  }

  return 1;
}

function calculateTierPrice(
  listing: ListingRecord,
  quantity: number,
  defaultUnitPrice: number,
): number {
  if (!Array.isArray(listing.pricingTiers)) {
    return defaultUnitPrice;
  }

  let selectedPrice = defaultUnitPrice;

  for (const rawTier of listing.pricingTiers) {
    if (!rawTier || typeof rawTier !== "object") {
      continue;
    }

    const tier = rawTier as Record<string, unknown>;

    const min = Number(tier.minQuantity ?? tier.min ?? 0);

    const max = Number(tier.maxQuantity ?? tier.max ?? Infinity);

    const price = Number(tier.price ?? tier.unitPrice ?? tier.sellingPrice);

    if (
      Number.isFinite(min) &&
      quantity >= min &&
      quantity <= max &&
      Number.isFinite(price) &&
      price >= 0
    ) {
      selectedPrice = price;
    }
  }

  return selectedPrice;
}

async function getListings(
  companyId: string,
  items: PricingItemInput[],
): Promise<ListingRecord[]> {
  const ids = [...new Set(items.map((item) => item.marketplaceListingId))];

  const listings = await prisma.marketplaceListings.findMany({
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

  const byId = new Map(
    listings.map((listing) => [listing.id, listing as ListingRecord]),
  );

  for (const item of items) {
    const listing = byId.get(item.marketplaceListingId);

    if (!listing) {
      throw new ListingNotFoundError(item.marketplaceListingId);
    }

    if (listing.companyId && listing.companyId !== companyId) {
      throw new InvalidCompanyError();
    }
  }

  return items.map((item) => {
    const listing = byId.get(item.marketplaceListingId);

    if (!listing) {
      throw new ListingNotFoundError(item.marketplaceListingId);
    }

    return listing;
  });
}

function validateListingAvailability(
  listing: ListingRecord,
  quantity: number,
  mode: PricingMode,
): void {
  if (!listing.isAvailable) {
    throw new ListingUnavailableError(listing.id);
  }

  if (
    listing.listingMarketStatus !== "AVAILABLE" &&
    listing.listingMarketStatus !== "ACTIVE"
  ) {
    throw new ListingUnavailableError(listing.id);
  }

  if (
    mode === "PRODUCT" &&
    listing.quantity >= 0 &&
    quantity > listing.quantity
  ) {
    throw new PricingError(
      `"${listing.name}" only has ${listing.quantity} units available.`,
      "INSUFFICIENT_STOCK",
      409,
    );
  }
}

async function getCompanyShippingSettings(companyId: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        ShippingSettings: true,
      },
    });
    return company?.ShippingSettings ?? null;
  } catch (e) {
    return null;
  }
}

function calculateItemShipping(
  listing: ListingRecord,
  shippingMethod?: string | null,
): number {
  if (!listing.delivery) {
    return 0;
  }

  if (
    !shippingMethod ||
    shippingMethod === "pickup" ||
    shippingMethod === "pickupatshop"
  ) {
    return 0;
  }

  return roundMoney(positiveNumber(listing.shippingCost));
}

function calculateTax(taxableAmount: number, taxPercentage: number): number {
  if (taxPercentage <= 0) {
    return 0;
  }

  return roundMoney((taxableAmount * Math.min(100, taxPercentage)) / 100);
}

/**
 * Promo support.
 *
 * Current Prisma schema does not have a dedicated PromoCode table.
 * If a promoCode is supplied, we record it on the order without crashing checkout.
 */
async function calculatePromoDiscount(
  _companyId: string,
  promoCode: string | null | undefined,
  _subtotalAfterItemDiscount: number,
): Promise<number> {
  if (!promoCode) {
    return 0;
  }
  // Store promo codes are logged on order metadata. If no active rule exists, discount is 0.
  return 0;
}

function getPaymentOptions(listing: ListingRecord): string[] {
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

export async function calculateOrderPricing(
  request: PricingRequest,
): Promise<PricingResult> {
  if (!request.companyId) {
    throw new PricingError("Company ID is required.", "COMPANY_REQUIRED", 400);
  }

  if (!request.items?.length) {
    throw new PricingError(
      "At least one item is required.",
      "ITEMS_REQUIRED",
      400,
    );
  }

  const normalizedItems = request.items.map((item) => ({
    ...item,
    quantity: normalizeQuantity(item.quantity),
    selectedOptions: normalizeOptions(item.selectedOptions),
  }));

  const listings = await getListings(request.companyId, normalizedItems);

  const listingMap = new Map(listings.map((listing) => [listing.id, listing]));
  const shippingSettings = await getCompanyShippingSettings(request.companyId);

  const resultItems: PricingItemResult[] = [];

  let subtotal = 0;
  let itemDiscount = 0;
  let rawItemShipping = 0;
  let tax = 0;

  let requiresBooking = false;
  let requiresDelivery = false;

  for (const item of normalizedItems) {
    const listing = listingMap.get(item.marketplaceListingId);

    if (!listing) {
      throw new ListingNotFoundError(item.marketplaceListingId);
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
      lineDiscount = calculatePercentageDiscount(
        lineSubtotal,
        listing.discount,
      );
    }

    const taxableAmount = Math.max(0, lineSubtotal - lineDiscount);

    const lineTax = calculateTax(taxableAmount, positiveNumber(listing.tax));

    const lineShipping = calculateItemShipping(listing, request.shippingMethod);

    const lineTotal = roundMoney(taxableAmount + lineTax + lineShipping);

    if (listing.delivery) {
      requiresDelivery = true;
    }

    subtotal += lineSubtotal;
    itemDiscount += lineDiscount;
    tax += lineTax;
    rawItemShipping += lineShipping;

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

  // Determine authoritative shipping: store settings take precedence if configured
  let shipping = 0;
  const isPickup =
    request.shippingMethod === "pickup" ||
    request.shippingMethod === "pickupatshop";

  if (!isPickup && requiresDelivery) {
    if (shippingSettings) {
      const isExpress = request.shippingMethod === "express" || request.shippingMethod === "Express";
      const configuredRate = isExpress
        ? positiveNumber(shippingSettings.expressRate)
        : positiveNumber(shippingSettings.standardRate);

      if (configuredRate > 0) {
        shipping = roundMoney(configuredRate);
      } else {
        shipping = roundMoney(rawItemShipping);
      }
    } else {
      shipping = roundMoney(rawItemShipping);
    }
  }

  const subtotalAfterItemDiscount = roundMoney(
    Math.max(0, subtotal - itemDiscount),
  );

  const promoDiscount = await calculatePromoDiscount(
    request.companyId,
    request.promoCode,
    subtotalAfterItemDiscount,
  );

  const totalDiscount = roundMoney(itemDiscount + promoDiscount);

  const total = roundMoney(
    Math.max(0, subtotal - totalDiscount + tax + shipping),
  );

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
