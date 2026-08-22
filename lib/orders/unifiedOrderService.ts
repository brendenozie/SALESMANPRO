import prisma from "@/server/db/prismadb";
import {
  calculateOrderPricing,
  type PricingItemInput,
  type PricingResult,
} from "@/lib/pricing/serverPricingEngine";

export type UnifiedOrderType = "PRODUCT" | "SERVICE";

export type UnifiedOrderItemInput = {
  marketplaceListingId: string;

  quantity: number;

  /**
   * These are NOT trusted for pricing.
   * They are accepted only for compatibility with
   * existing clients.
   */
  price?: number;
  totalPrice?: number;

  date?: string | null;
  timeSlot?: string | null;

  serviceNotes?: string | null;

  selectedOptions?: Array<{
    category: string;
    name: string;
    extraPrice?: number;
  }>;
};

export interface CreateUnifiedOrderInput {
  orderType: UnifiedOrderType;

  companyId: string;

  consumerId?: string | null;

  name: string;
  email: string;
  phone: string;

  mpesaPhone?: string | null;

  paymentOption:
    | "cod"
    | "pickupatshop"
    | "mpesa"
    | "card"
    | "paystack"
    | "ghuba"
    | "stripe"
    | "paypal"
    | "cash"
    | "split"
    | "pending";

  items: UnifiedOrderItemInput[];

  shippingAddress?: Record<string, unknown> | null;
  shippingMethod?: string | null;

  promoCode?: string | null;

  notes?: string | null;

  paymentData?: Record<string, unknown> | null;

  idempotencyKey?: string | null;

  trackingNumber?: string | null;

  delivery?: boolean;
}

export interface UnifiedOrderResult {
  order: any;

  pricing: PricingResult;

  trackingNumber: string;

  orderType: UnifiedOrderType;
}

/**
 * Generate a human-readable tracking number.
 */
function generateTrackingNumber() {
  const date = new Date();

  const datePart = date.toISOString().slice(2, 10).replace(/-/g, "");

  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `TRK-${datePart}-${randomPart}`;
}

/**
 * Validate that the requested company exists.
 */
async function validateCompany(companyId: string) {
  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!company) {
    throw new Error("Store/company not found.");
  }

  return company;
}

/**
 * Validate listings and build trusted pricing inputs.
 *
 * IMPORTANT:
 * Client supplied price values are deliberately ignored.
 */
async function buildTrustedPricingItems(
  items: UnifiedOrderItemInput[],
): Promise<PricingItemInput[]> {
  if (!items.length) {
    throw new Error("Order must contain at least one item.");
  }

  const listingIds = [
    ...new Set(items.map((item) => item.marketplaceListingId)),
  ];

  const listings = await prisma.marketplaceListings.findMany({
    where: {
      id: {
        in: listingIds,
      },
    },

    select: {
      id: true,
      name: true,
      sellingPrice: true,
      finalPrice: true,
      discount: true,
      tax: true,
      shippingCost: true,
      quantity: true,

      isAvailable: true,
      status: true,

      companyId: true,

      listingTransactionType: true,

      duration: true,
      hourlyRate: true,
      minimumHours: true,

      pricingTiers: true,
    },
  });

  const listingMap = new Map(listings.map((listing) => [listing.id, listing]));

  return items.map((item) => {
    const listing = listingMap.get(item.marketplaceListingId);

    if (!listing) {
      throw new Error(`Listing ${item.marketplaceListingId} was not found.`);
    }

    if (!listing.isAvailable) {
      throw new Error(`${listing.name} is currently unavailable.`);
    }

    if (listing.status !== "ACTIVE") {
      throw new Error(
        `${listing.name} is not currently available for purchase.`,
      );
    }

    return {
      listingId: listing.id,

      name: listing.name,

      quantity: item.quantity,

      /**
       * Trusted database values.
       */
      sellingPrice: listing.sellingPrice,

      finalPrice: listing.finalPrice,

      discount: listing.discount,

      tax: listing.tax,

      shippingCost: listing.shippingCost,

      availableQuantity: listing.quantity,

      selectedOptions: item.selectedOptions ?? [],

      pricingTiers: listing.pricingTiers ?? [],

      /**
       * Service metadata.
       */
      duration: listing.duration,

      hourlyRate: listing.hourlyRate,

      minimumHours: listing.minimumHours,

      transactionType: listing.listingTransactionType,

      date: item.date ?? null,

      timeSlot: item.timeSlot ?? null,

      serviceNotes: item.serviceNotes ?? null,
    };
  });
}

/**
 * Main unified order creation function.
 */
export async function createUnifiedOrder(
  input: CreateUnifiedOrderInput,
): Promise<UnifiedOrderResult> {
  const company = await validateCompany(input.companyId);

  /**
   * Idempotency protection.
   */
  if (input.idempotencyKey) {
    const existing = await prisma.customerOrder.findFirst({
      where: {
        idempotencyKey: input.idempotencyKey,
      },
    });

    if (existing) {
      throw new Error("An order with this idempotency key already exists.");
    }
  }

  /**
   * Validate all listings and replace
   * client pricing with database pricing.
   */
  const trustedItems = await buildTrustedPricingItems(input.items);

  /**
   * SERVER-SIDE PRICING
   */
  const pricing = await calculateOrderPricing({
    companyId: company.id,

    orderType: input.orderType,

    items: trustedItems,

    promoCode: input.promoCode ?? null,

    shippingMethod: input.shippingMethod ?? null,

    paymentOption: input.paymentOption,

    shippingAddress: input.shippingAddress ?? null,
  });

  /**
   * Stock validation.
   */
  for (const item of trustedItems) {
    if (
      item.availableQuantity !== undefined &&
      item.availableQuantity !== null &&
      item.quantity > item.availableQuantity
    ) {
      throw new Error(
        `Insufficient stock for ${item.name}. Available: ${item.availableQuantity}.`,
      );
    }
  }

  const trackingNumber = input.trackingNumber ?? generateTrackingNumber();

  /**
   * Create the actual CustomerOrder.
   */
  const order = await prisma.customerOrder.create({
    data: {
      companyId: input.companyId,

      consumerId: input.consumerId ?? undefined,

      name: input.name,

      email: input.email,

      phone: input.phone,

      mpesaPhone: input.mpesaPhone ?? undefined,

      paymentOption: input.paymentOption,

      paymentMethod: input.paymentOption,

      paymentStatus: "PENDING",

      status: "PENDING",

      orderSource: "WEBSITE",

      trackingNumber,

      shippingAddress: input.shippingAddress ?? undefined,

      shippingMethod: input.shippingMethod ?? undefined,

      delivery: input.delivery ?? false,

      deliveryStatus: "Order Placed",

      notes: input.notes ?? undefined,

      promoCode: input.promoCode ?? undefined,

      idempotencyKey: input.idempotencyKey ?? undefined,

      totalPrice: pricing.subtotal,

      totalTax: pricing.tax,

      totalDiscount: pricing.discount,

      totalShipping: pricing.shipping,

      totalFinalPrice: pricing.total,

      items: {
        create: pricing.items.map((pricedItem) => {
          const original = input.items.find(
            (i) => i.marketplaceListingId === pricedItem.listingId,
          );

          return {
            marketplaceListingId: pricedItem.listingId,

            quantity: pricedItem.quantity,

            price: pricedItem.unitPrice,

            totalPrice: pricedItem.lineTotal,

            discount: pricedItem.discount,

            tax: pricedItem.tax,

            selectedOptions: original?.selectedOptions ?? undefined,

            serviceNotes: original?.serviceNotes ?? undefined,

            date: original?.date ?? undefined,

            timeSlot: original?.timeSlot ?? undefined,

            status: "PENDING",
          };
        }),
      },
    },

    include: {
      items: {
        include: {
          marketplaceListing: true,
        },
      },
    },
  });

  return {
    order,

    pricing,

    trackingNumber,

    orderType: input.orderType,
  };
}
