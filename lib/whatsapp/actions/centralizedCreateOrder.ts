import prisma from "@/server/db/prismadb";
import { OrderSource, OrderStatus, PaymentStatus } from "@prisma/client";
import crypto from "crypto";

import { calculateOrderPricing } from "@/lib/pricing/serverPricingEngine";

export type OrderPaymentOption =
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

export type OrderType = "PRODUCT" | "SERVICE" | "RENTAL" | "BOOKING" | "OTHER";

export interface CreateOrderItemInput {
  marketplaceListingId: string;

  quantity: number;

  /**
   * Client supplied price is accepted only as informational input.
   * Server pricing remains authoritative.
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

  appointmentId?: string;

  productId?: string;
}

export interface CreateOrderInput {
  companyId?: string | null;

  consumerId?: string | null;

  orderType?: OrderType;

  source?: "WEBSITE" | "IN_PERSON" | "MOBILE" | "WHATSAPP" | "AI";

  name: string;

  email: string;

  phone: string;

  mpesaPhone?: string | null;

  paymentOption: OrderPaymentOption;

  items: CreateOrderItemInput[];

  shippingAddress?: Record<string, unknown> | null;

  shippingMethod?: string | null;

  promoCode?: string | null;

  notes?: string | null;

  trackingNumber?: string | null;

  idempotencyKey?: string | null;

  /**
   * Optional metadata used by WhatsApp, POS,
   * service booking and other channels.
   */
  metadata?: Record<string, unknown>;
}

function generateTrackingNumber() {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");

  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `TRK-${datePart}-${randomPart}`;
}

function normalizePaymentOption(paymentOption: OrderPaymentOption): string {
  return paymentOption.toUpperCase();
}

export async function createOrder(input: CreateOrderInput) {
  if (!input.items.length) {
    throw new Error("Order must contain at least one item.");
  }

  if (!input.name?.trim()) {
    throw new Error("Customer name is required.");
  }

  if (!input.phone?.trim()) {
    throw new Error("Customer phone is required.");
  }

  if (!input.email?.trim()) {
    throw new Error("Customer email is required.");
  }

  /**
   * ---------------------------------------------------------
   * IDEMPOTENCY
   * ---------------------------------------------------------
   */

  if (input.idempotencyKey) {
    const existing = await prisma.customerOrder.findFirst({
      where: {
        idempotencyKey: input.idempotencyKey,
      },
      include: {
        items: true,
      },
    });

    if (existing) {
      return {
        order: existing,
        pricing: {
          subtotal: existing.totalPrice ?? 0,
          discount: existing.totalDiscount ?? 0,
          tax: existing.totalTax ?? 0,
          shipping: existing.totalShipping ?? 0,
          total: existing.totalFinalPrice ?? 0,
        },
        payment: {
          option: existing.paymentMethod,
          status: existing.paymentStatus,
        },
        trackingNumber: existing.trackingNumber,
        alreadyExists: true,
      };
    }
  }

  /**
   * ---------------------------------------------------------
   * SERVER-SIDE PRICING
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   *
   * Never trust:
   *
   * item.price
   * item.totalPrice
   * incoming.totalPrice
   *
   * from WhatsApp/browser/mobile.
   *
   * The pricing engine retrieves authoritative listing data.
   */

  const pricing = await calculateOrderPricing({
    companyId: input.companyId ?? undefined,

    items: input.items.map((item) => ({
      marketplaceListingId: item.marketplaceListingId,
      quantity: item.quantity,
      selectedOptions: item.selectedOptions ?? [],
      date: item.date ?? undefined,
      timeSlot: item.timeSlot ?? undefined,
    })),

    promoCode: input.promoCode ?? undefined,

    shippingMethod: input.shippingMethod ?? undefined,

    metadata: input.metadata,
  });

  const trackingNumber = input.trackingNumber ?? generateTrackingNumber();

  /**
   * ---------------------------------------------------------
   * PAYMENT STATUS
   * ---------------------------------------------------------
   */

  let paymentStatus: "PENDING" | "COMPLETED" | "FAILED" = "PENDING";

  if (input.paymentOption === "cash" || input.paymentOption === "split") {
    paymentStatus = "COMPLETED";
  }

  /**
   * ---------------------------------------------------------
   * ORDER STATUS
   * ---------------------------------------------------------
   */

  let orderStatus: "PENDING" | "PROCESSING" | "PAID" = "PENDING";

  if (paymentStatus === "COMPLETED") {
    orderStatus = "PAID";
  }

  /**
   * ---------------------------------------------------------
   * CREATE ORDER
   * ---------------------------------------------------------
   */

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.customerOrder.create({
      data: {
        companyId: input.companyId ?? undefined,

        consumerId: input.consumerId ?? undefined,

        name: input.name.trim(),

        email: input.email.trim().toLowerCase(),

        phone: input.phone.trim(),

        mpesaPhone: input.mpesaPhone ?? undefined,

        paymentOption: input.paymentOption,

        paymentMethod: normalizePaymentOption(input.paymentOption),

        paymentStatus,

        status: orderStatus,

        orderSource:
          input.source === "IN_PERSON"
            ? "IN_PERSON"
            : input.source === "MOBILE"
              ? "MOBILE"
              : "WEBSITE",

        trackingNumber,

        shippingAddress: input.shippingAddress ?? undefined,

        shippingMethod: input.shippingMethod ?? undefined,

        notes: input.notes ?? undefined,

        idempotencyKey: input.idempotencyKey ?? undefined,

        delivery: false,

        deliveryStatus:
          paymentStatus === "COMPLETED" ? "Processing" : "Order Placed",

        totalPrice: pricing.subtotal,

        totalDiscount: pricing.discount,

        totalTax: pricing.tax,

        totalShipping: pricing.shipping,

        totalFinalPrice: pricing.total,

        items: {
          create: pricing.items.map((item) => {
            const original = input.items.find(
              (sourceItem) =>
                sourceItem.marketplaceListingId === item.marketplaceListingId,
            );

            return {
              marketplaceListingId: item.marketplaceListingId,

              productId: item.productId ?? undefined,

              quantity: item.quantity,

              price: item.unitPrice,

              totalPrice: item.lineTotal,

              discount: item.discount,

              tax: item.tax,

              selectedOptions: original?.selectedOptions ?? undefined,

              serviceNotes: original?.serviceNotes ?? undefined,

              date: original?.date ?? undefined,

              timeSlot: original?.timeSlot ?? undefined,

              appointmentId: original?.appointmentId ?? undefined,

              status: paymentStatus === "COMPLETED" ? "PAID" : "PENDING",
            };
          }),
        },
      },

      include: {
        items: {
          include: {
            marketplaceListing: true,
            product: true,
          },
        },
      },
    });

    return createdOrder;
  });

  return {
    order,

    pricing,

    trackingNumber,

    payment: {
      option: input.paymentOption,
      status: paymentStatus,
    },

    orderType: input.orderType ?? "PRODUCT",

    alreadyExists: false,
  };
}

/**
 * Unified Order Creation Service
 *
 * Used by:
 * - Website checkout
 * - Marketplace checkout
 * - Service booking
 * - Mobile app
 * - POS
 * - WhatsApp AI
 * - Future AI agents
 *
 * IMPORTANT:
 * This service is responsible for creating the canonical
 * CustomerOrder + OrderItem records.
 *
 * Payment gateway processing should happen AFTER this service.
 */

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export type CreateOrderItemInput = {
  marketplaceListingId: string;

  quantity: number;

  /**
   * Client supplied price is retained only as informational input.
   * The server determines the authoritative price from the listing.
   */
  price?: number;

  totalPrice?: number;

  discount?: number;

  tax?: number;

  selectedOptions?: Array<{
    category: string;
    name: string;
    extraPrice?: number;
  }>;

  serviceNotes?: string;

  date?: string | null;

  timeSlot?: string | null;

  productId?: string;

  appointmentId?: string;

  riderId?: string;
};

export type CreateOrderInput = {
  companyId?: string | null;

  consumerId?: string | null;

  name: string;

  email: string;

  phone: string;

  mpesaPhone?: string | null;

  items: CreateOrderItemInput[];

  paymentOption?: string;

  paymentStatus?: PaymentStatus;

  orderStatus?: OrderStatus;

  orderSource?: OrderSource;

  shippingAddress?: unknown;

  billingAddress?: unknown;

  shippingMethod?: string | null;

  delivery?: boolean;

  deliveryStatus?: string | null;

  deliveryFee?: number;

  trackingNumber?: string | null;

  promoCode?: string | null;

  notes?: string | null;

  specialInstructions?: string | null;

  giftMessage?: string | null;

  isGift?: boolean;

  giftWrap?: boolean;

  deliveryDate?: Date | null;

  deliveryTimeSlot?: string | null;

  deliveryInstructions?: string | null;

  /**
   * Optional external reference.
   *
   * Particularly useful for:
   * - WhatsApp message IDs
   * - AI conversation IDs
   * - POS transaction IDs
   * - Mobile checkout IDs
   */
  externalReference?: string | null;

  /**
   * Metadata from:
   * - WhatsApp
   * - AI
   * - POS
   * - Mobile
   * - Website
   */
  metadata?: Record<string, unknown>;

  /**
   * Idempotency protection.
   */
  idempotencyKey?: string | null;

  /**
   * These values are accepted for backwards compatibility with
   * the existing APIs but are NOT trusted as authoritative totals.
   */
  totalPrice?: number;

  totalFinalPrice?: number;
};

/* -------------------------------------------------------------------------- */
/* RESULT TYPES                                                               */
/* -------------------------------------------------------------------------- */

export type CreateOrderResult = {
  order: any;

  pricing: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
    itemCount: number;
  };

  trackingNumber: string;

  created: boolean;
};

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_ORDER_STATUS: OrderStatus = OrderStatus.PENDING;

const DEFAULT_PAYMENT_STATUS: PaymentStatus = PaymentStatus.PENDING;

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function safeNumber(value: unknown, fallback = 0): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function generateTrackingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();

  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `TRK-${timestamp}-${random}`;
}

function normalizePhone(phone: string): string {
  return phone.trim().replace(/[^\d+]/g, "");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeString(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  const normalized = value.trim();

  return normalized.length ? normalized : undefined;
}

/* -------------------------------------------------------------------------- */
/* OPTION PRICING                                                             */
/* -------------------------------------------------------------------------- */

function calculateOptionExtras(
  options: CreateOrderItemInput["selectedOptions"],
): number {
  if (!Array.isArray(options)) {
    return 0;
  }

  return options.reduce((total, option) => {
    return total + Math.max(0, safeNumber(option?.extraPrice));
  }, 0);
}

/* -------------------------------------------------------------------------- */
/* LISTING PRICE                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Determines the authoritative marketplace price.
 *
 * Priority:
 *
 * 1. finalPrice
 * 2. sellingPrice
 *
 * The price sent by the browser/WhatsApp client is NEVER authoritative.
 */
function getListingUnitPrice(listing: {
  finalPrice: number | null;
  sellingPrice: number;
}): number {
  const finalPrice = safeNumber(listing.finalPrice);

  if (finalPrice > 0) {
    return finalPrice;
  }

  return Math.max(0, safeNumber(listing.sellingPrice));
}

/* -------------------------------------------------------------------------- */
/* MAIN SERVICE                                                               */
/* -------------------------------------------------------------------------- */

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  /* ---------------------------------------------------------------------- */
  /* BASIC VALIDATION                                                        */
  /* ---------------------------------------------------------------------- */

  if (!input.name?.trim()) {
    throw new Error("Customer name is required.");
  }

  if (!input.email?.trim()) {
    throw new Error("Customer email is required.");
  }

  if (!input.phone?.trim()) {
    throw new Error("Customer phone number is required.");
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("Order must contain at least one item.");
  }

  const companyId = normalizeString(input.companyId);

  const consumerId = normalizeString(input.consumerId);

  const email = normalizeEmail(input.email);

  const phone = normalizePhone(input.phone);

  const mpesaPhone = input.mpesaPhone
    ? normalizePhone(input.mpesaPhone)
    : undefined;

  /* ---------------------------------------------------------------------- */
  /* IDEMPOTENCY                                                             */
  /* ---------------------------------------------------------------------- */

  if (input.idempotencyKey) {
    const existingOrder = await prisma.customerOrder.findFirst({
      where: {
        idempotencyKey: input.idempotencyKey,
      },
      include: {
        items: true,
      },
    });

    if (existingOrder) {
      return {
        order: existingOrder,
        pricing: {
          subtotal: safeNumber(existingOrder.totalPrice),
          discount: safeNumber(existingOrder.totalDiscount),
          tax: safeNumber(existingOrder.totalTax),
          shipping: safeNumber(existingOrder.totalShipping),
          total: safeNumber(existingOrder.totalFinalPrice),
          itemCount: existingOrder.items.length,
        },
        trackingNumber:
          existingOrder.trackingNumber ?? generateTrackingNumber(),
        created: false,
      };
    }
  }

  /* ---------------------------------------------------------------------- */
  /* LOAD LISTINGS                                                           */
  /* ---------------------------------------------------------------------- */

  const listingIds = [
    ...new Set(input.items.map((item) => item.marketplaceListingId)),
  ];

  const listings = await prisma.marketplaceListings.findMany({
    where: {
      id: {
        in: listingIds,
      },

      ...(companyId
        ? {
            companyId,
          }
        : {}),
    },

    select: {
      id: true,

      companyId: true,

      name: true,

      sellingPrice: true,

      finalPrice: true,

      discount: true,

      tax: true,

      shippingCost: true,

      quantity: true,

      isAvailable: true,

      status: true,

      showOnGhuba: true,

      ghubaStatus: true,

      delivery: true,
    },
  });

  /* ---------------------------------------------------------------------- */
  /* VERIFY LISTINGS                                                         */
  /* ---------------------------------------------------------------------- */

  const listingMap = new Map(listings.map((listing) => [listing.id, listing]));

  for (const item of input.items) {
    const listing = listingMap.get(item.marketplaceListingId);

    if (!listing) {
      throw new Error(
        `Marketplace listing ${item.marketplaceListingId} was not found.`,
      );
    }

    if (!listing.isAvailable) {
      throw new Error(`${listing.name} is currently unavailable.`);
    }

    if (
      listing.status !== undefined &&
      listing.status !== null &&
      String(listing.status).toUpperCase() !== "ACTIVE"
    ) {
      throw new Error(
        `${listing.name} is not currently available for ordering.`,
      );
    }

    if (listing.companyId && companyId && listing.companyId !== companyId) {
      throw new Error(`Listing ${listing.name} does not belong to this store.`);
    }

    const quantity = Math.floor(safeNumber(item.quantity));

    if (quantity <= 0) {
      throw new Error(`Invalid quantity for ${listing.name}.`);
    }

    if (
      listing.quantity !== null &&
      listing.quantity !== undefined &&
      listing.quantity >= 0 &&
      quantity > listing.quantity
    ) {
      throw new Error(
        `Insufficient stock for ${listing.name}. Available: ${listing.quantity}.`,
      );
    }
  }

  /* ---------------------------------------------------------------------- */
  /* SERVER-SIDE PRICING                                                     */
  /* ---------------------------------------------------------------------- */

  let subtotal = 0;

  let totalDiscount = 0;

  let totalTax = 0;

  let totalShipping = 0;

  const preparedItems: Array<{
    listing: (typeof listings)[number];

    input: CreateOrderItemInput;

    quantity: number;

    unitPrice: number;

    optionExtra: number;

    lineSubtotal: number;

    lineDiscount: number;

    lineTax: number;

    lineShipping: number;

    lineTotal: number;
  }> = [];

  for (const item of input.items) {
    const listing = listingMap.get(item.marketplaceListingId)!;

    const quantity = Math.floor(safeNumber(item.quantity, 1));

    const basePrice = getListingUnitPrice(listing);

    const optionExtra = calculateOptionExtras(item.selectedOptions);

    const unitPrice = roundMoney(basePrice + optionExtra);

    const lineSubtotal = roundMoney(unitPrice * quantity);

    /**
     * Listing discount is treated as informational if finalPrice
     * has already been used.
     *
     * This prevents double-discounting.
     */
    let lineDiscount = 0;

    if (listing.finalPrice === null || listing.finalPrice === undefined) {
      const discountPercent = Math.max(
        0,
        Math.min(100, safeNumber(listing.discount)),
      );

      lineDiscount = roundMoney(lineSubtotal * (discountPercent / 100));
    }

    const discountedSubtotal = Math.max(0, lineSubtotal - lineDiscount);

    const taxRate = Math.max(0, safeNumber(listing.tax));

    const lineTax = roundMoney(discountedSubtotal * taxRate);

    const lineShipping = roundMoney(
      Math.max(0, safeNumber(listing.shippingCost)) * quantity,
    );

    const lineTotal = roundMoney(discountedSubtotal + lineTax + lineShipping);

    subtotal += lineSubtotal;

    totalDiscount += lineDiscount;

    totalTax += lineTax;

    totalShipping += lineShipping;

    preparedItems.push({
      listing,
      input: item,
      quantity,
      unitPrice,
      optionExtra,
      lineSubtotal,
      lineDiscount,
      lineTax,
      lineShipping,
      lineTotal,
    });
  }

  subtotal = roundMoney(subtotal);

  totalDiscount = roundMoney(totalDiscount);

  totalTax = roundMoney(totalTax);

  totalShipping = roundMoney(totalShipping);

  const totalFinalPrice = roundMoney(
    subtotal - totalDiscount + totalTax + totalShipping,
  );

  /* ---------------------------------------------------------------------- */
  /* TRACKING NUMBER                                                         */
  /* ---------------------------------------------------------------------- */

  const trackingNumber =
    normalizeString(input.trackingNumber) ?? generateTrackingNumber();

  /* ---------------------------------------------------------------------- */
  /* ORDER SOURCE                                                            */
  /* ---------------------------------------------------------------------- */

  const orderSource = input.orderSource ?? OrderSource.WEBSITE;

  /* ---------------------------------------------------------------------- */
  /* PAYMENT OPTION                                                          */
  /* ---------------------------------------------------------------------- */

  const paymentOption = normalizeString(input.paymentOption) ?? "cod";

  /* ---------------------------------------------------------------------- */
  /* COMPANY RESOLUTION                                                      */
  /* ---------------------------------------------------------------------- */

  let resolvedCompanyId = companyId;

  if (!resolvedCompanyId) {
    const listingCompanyIds = [
      ...new Set(
        preparedItems.map((item) => item.listing.companyId).filter(Boolean),
      ),
    ];

    if (listingCompanyIds.length === 1) {
      resolvedCompanyId = listingCompanyIds[0]!;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* TRANSACTION                                                             */
  /* ---------------------------------------------------------------------- */

  const order = await prisma.$transaction(
    async (tx) => {
      /* ------------------------------------------------------------------ */
      /* SECOND IDEMPOTENCY CHECK                                           */
      /* ------------------------------------------------------------------ */

      if (input.idempotencyKey) {
        const duplicate = await tx.customerOrder.findFirst({
          where: {
            idempotencyKey: input.idempotencyKey,
          },
          include: {
            items: true,
          },
        });

        if (duplicate) {
          return duplicate;
        }
      }

      /* ------------------------------------------------------------------ */
      /* CREATE ORDER                                                        */
      /* ------------------------------------------------------------------ */

      const createdOrder = await tx.customerOrder.create({
        data: {
          consumerId: consumerId ?? undefined,

          name: input.name.trim(),

          email,

          phone,

          mpesaPhone,

          paymentOption,

          paymentMethod: paymentOption,

          paymentStatus: input.paymentStatus ?? DEFAULT_PAYMENT_STATUS,

          status: input.orderStatus ?? DEFAULT_ORDER_STATUS,

          orderSource,

          trackingNumber,

          shippingAddress: input.shippingAddress as any,

          billingAddress: input.billingAddress as any,

          shippingMethod: input.shippingMethod,

          delivery: input.delivery ?? false,

          deliveryStatus: input.deliveryStatus ?? "Pending",

          deliveryFee: input.deliveryFee ?? totalShipping,

          notes: input.notes ?? undefined,

          specialInstructions: input.specialInstructions ?? undefined,

          giftMessage: input.giftMessage ?? undefined,

          isGift: input.isGift ?? false,

          giftWrap: input.giftWrap ?? false,

          deliveryDate: input.deliveryDate ?? undefined,

          deliveryTimeSlot: input.deliveryTimeSlot ?? undefined,

          deliveryInstructions: input.deliveryInstructions ?? undefined,

          promoCode: input.promoCode ?? undefined,

          companyId: resolvedCompanyId ?? undefined,

          totalPrice: subtotal,

          totalDiscount,

          totalTax,

          totalShipping,

          totalFinalPrice,

          idempotencyKey: input.idempotencyKey ?? undefined,

          items: {
            create: preparedItems.map(
              ({
                listing,
                input: item,
                quantity,
                unitPrice,
                lineDiscount,
                lineTax,
                lineTotal,
              }) => ({
                marketplaceListingId: listing.id,

                quantity,

                price: unitPrice,

                totalPrice: lineTotal,

                discount: lineDiscount,

                tax: lineTax,

                serviceNotes: item.serviceNotes ?? undefined,

                selectedOptions: item.selectedOptions
                  ? (item.selectedOptions as any)
                  : undefined,

                date: item.date ?? undefined,

                timeSlot: item.timeSlot ?? undefined,

                riderId: item.riderId ?? undefined,

                ...(item.productId
                  ? {
                      productId: item.productId,
                    }
                  : {}),

                ...(item.appointmentId
                  ? {
                      appointmentId: item.appointmentId,
                    }
                  : {}),
              }),
            ),
          },
        },

        include: {
          items: true,
        },
      });

      /* ------------------------------------------------------------------ */
      /* OPTIONAL STOCK DECREMENT                                            */
      /* ------------------------------------------------------------------ */

      for (const prepared of preparedItems) {
        if (
          prepared.listing.quantity !== null &&
          prepared.listing.quantity !== undefined &&
          prepared.listing.quantity >= 0
        ) {
          await tx.marketplaceListings.update({
            where: {
              id: prepared.listing.id,
            },

            data: {
              quantity: {
                decrement: prepared.quantity,
              },
            },
          });
        }
      }

      return createdOrder;
    },
    {
      maxWait: 10_000,

      timeout: 20_000,
    },
  );

  /* ---------------------------------------------------------------------- */
  /* RETURN                                                                  */
  /* ---------------------------------------------------------------------- */

  return {
    order,

    pricing: {
      subtotal,

      discount: totalDiscount,

      tax: totalTax,

      shipping: totalShipping,

      total: totalFinalPrice,

      itemCount: preparedItems.length,
    },

    trackingNumber,

    created: true,
  };
}

export default createOrder;
