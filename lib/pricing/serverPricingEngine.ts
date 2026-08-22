export interface PricingItemInput {
  listingId: string;

  name: string;

  quantity: number;

  sellingPrice: number;

  finalPrice?: number | null;

  discount?: number | null;

  tax?: number | null;

  shippingCost?: number | null;

  availableQuantity?: number | null;

  selectedOptions?: Array<{
    category: string;
    name: string;
    extraPrice?: number;
  }>;

  pricingTiers?: any[];

  duration?: string | null;

  hourlyRate?: number | null;

  minimumHours?: number | null;

  transactionType?: any;

  date?: string | null;

  timeSlot?: string | null;

  serviceNotes?: string | null;
}

export interface PricingResultItem {
  listingId: string;

  quantity: number;

  unitPrice: number;

  subtotal: number;

  discount: number;

  tax: number;

  shipping: number;

  lineTotal: number;
}

export interface PricingResult {
  items: PricingResultItem[];

  subtotal: number;

  discount: number;

  tax: number;

  shipping: number;

  total: number;

  currency: string;
}

export async function calculateOrderPricing(input: {
  companyId: string;

  orderType: "PRODUCT" | "SERVICE";

  items: PricingItemInput[];

  promoCode?: string | null;

  shippingMethod?: string | null;

  paymentOption: string;

  shippingAddress?: Record<string, unknown> | null;
}): Promise<PricingResult> {
  // Your server-side pricing implementation
}

export interface CalculateOrderPricingInput {
  companyId?: string;

  items: Array<{
    marketplaceListingId: string;

    quantity: number;

    selectedOptions?: Array<{
      category: string;
      name: string;
      extraPrice?: number;
    }>;

    date?: string;

    timeSlot?: string;
  }>;

  promoCode?: string;

  shippingMethod?: string;

  metadata?: Record<string, unknown>;
}

export interface CalculatedOrderItem {
  marketplaceListingId: string;

  productId?: string;

  quantity: number;

  unitPrice: number;

  lineTotal: number;

  discount: number;

  tax: number;
}

export interface CalculatedOrderPricing {
  items: CalculatedOrderItem[];

  subtotal: number;

  discount: number;

  tax: number;

  shipping: number;

  total: number;
}

export async function calculateOrderPricing(
  input: CalculateOrderPricingInput,
): Promise<CalculatedOrderPricing> {
  // Your existing server-side pricing implementation.
  throw new Error("calculateOrderPricing implementation required");
}