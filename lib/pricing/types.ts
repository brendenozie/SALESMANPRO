// lib/pricing/types.ts

export type PricingMode =
  | "PRODUCT"
  | "SERVICE"
  | "RENTAL"
  | "BOOKING"
  | "PROPERTY"
  | "VEHICLE"
  | "DIGITAL";

export type PricingOption = {
  category: string;
  name: string;
  extraPrice?: number;
};

export type PricingItemInput = {
  marketplaceListingId: string;
  quantity: number;

  /**
   * Optional client-supplied date/time.
   * The server does NOT trust client pricing.
   */
  date?: string | null;
  timeSlot?: string | null;

  selectedOptions?: PricingOption[];

  /**
   * Used for service-specific instructions.
   * Never used to override server price.
   */
  serviceNotes?: string | null;

  /**
   * Optional rental/service duration.
   * Server may derive this from listing configuration.
   */
  durationHours?: number | null;
};

export type PricingRequest = {
  companyId: string;
  items: PricingItemInput[];

  promoCode?: string | null;

  /**
   * Delivery/shipping selection.
   */
  shippingMethod?: string | null;

  /**
   * Optional address used by a future delivery-rate engine.
   */
  shippingAddress?: Record<string, unknown> | null;

  /**
   * Optional mode hint from the caller.
   * Server still derives actual behavior from listing data.
   */
  mode?: PricingMode;
};

export type PricingItemResult = {
  marketplaceListingId: string;

  name: string;

  quantity: number;

  unitPrice: number;

  optionsTotal: number;

  unitPriceWithOptions: number;

  subtotal: number;

  discount: number;

  tax: number;

  shipping: number;

  total: number;

  selectedOptions: PricingOption[];

  pricingMode: PricingMode;
};

export type PricingResult = {
  currency: string;

  items: PricingItemResult[];

  subtotal: number;

  itemDiscount: number;

  promoDiscount: number;

  totalDiscount: number;

  shipping: number;

  tax: number;

  total: number;

  /**
   * Useful for WhatsApp AI and checkout.
   */
  requiresBooking: boolean;

  requiresDelivery: boolean;

  paymentOptions: string[];

  promoCode?: string | null;

  calculatedAt: string;
};
