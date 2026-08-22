import crypto from "crypto";
import prisma from "@/server/db/prismadb";

import { createOrder as createOrderRecord } from "@/lib/orders/createOrder";
import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";

import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";
import { initiatePaystackPayment } from "@/lib/paymentsv2/paystack";
import { initiatePaystackPayment as initiateGhubaPayment } from "@/lib/payments/paystack";
import { initiateStripePaymentIntent } from "@/lib/paymentsv2/stripe";
import { createPaypalOrder } from "@/lib/paymentsv2/paypal";
import { calculateOrderPricing } from "@/lib/pricing";

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

export interface NormalizedOrderItem {
  marketplaceListingId: string;

  quantity: number;
  price: number;
  totalPrice: number;

  date?: string | null;
  timeSlot?: string | null;

  selectedOptions?: Array<{
    category: string;
    name: string;
    extraPrice?: number;
  }>;

  serviceNotes?: string | null;

  productId?: string | null;
}

export interface NormalizedOrderInput {
  companyId?: string | null;
  consumerId?: string | null;

  name: string;
  email: string;
  phone: string;

  mpesaPhone?: string | null;

  paymentOption: OrderPaymentOption;

  items: NormalizedOrderItem[];

  totalPrice: number;
  totalFinalPrice?: number;

  shippingAddress?: Record<string, unknown> | null;
  shippingMethod?: string | null;

  paymentData?: Record<string, unknown> | null;

  trackingNumber?: string | null;

  idempotencyKey?: string | null;

  /**
   * WEBSITE | MOBILE | IN_PERSON | WHATSAPP
   */
  orderSource?: "WEBSITE" | "MOBILE" | "IN_PERSON" | "WHATSAPP";

  /**
   * Whether this order is a service booking.
   */
  isServiceOrder?: boolean;
}

export interface ProcessedOrderResult {
  order: any;

  trackingNumber: string;

  paymentResponse: any;

  authorizationUrl: string | null;

  paymentStatus: string;

  orderStatus: string;

  isServiceOrder: boolean;
}

const EXTERNAL_PAYMENT_OPTIONS = new Set<OrderPaymentOption>([
  "mpesa",
  "paystack",
  "ghuba",
  "stripe",
  "paypal",
  "card",
]);

const IMMEDIATE_PAYMENT_OPTIONS = new Set<OrderPaymentOption>([
  "cash",
  "split",
]);

const DEFERRED_PAYMENT_OPTIONS = new Set<OrderPaymentOption>([
  "pending",
  "cod",
  "pickupatshop",
]);

function generateTrackingNumber(): string {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");

  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `TRK-${datePart}-${randomPart}`;
}

function getPaymentStatusForOption(
  paymentOption: OrderPaymentOption,
): "PENDING" | "COMPLETED" {
  if (IMMEDIATE_PAYMENT_OPTIONS.has(paymentOption)) {
    return "COMPLETED";
  }

  return "PENDING";
}

function getOrderStatusForOption(
  paymentOption: OrderPaymentOption,
): "PENDING" | "PAID" {
  if (IMMEDIATE_PAYMENT_OPTIONS.has(paymentOption)) {
    return "PAID";
  }

  return "PENDING";
}

function sanitizePaymentData(
  paymentData?: Record<string, unknown> | null,
): Record<string, unknown> {
  if (!paymentData) {
    return {};
  }

  /**
   * Never persist sensitive card credentials.
   *
   * The checkout/payment gateway should tokenize card data
   * before reaching this layer.
   */
  const blockedKeys = new Set([
    "cardNumber",
    "card_number",
    "cardExpiry",
    "card_expiry",
    "cvv",
    "cvc",
    "securityCode",
    "cardCvv",
  ]);

  return Object.fromEntries(
    Object.entries(paymentData).filter(([key]) => !blockedKeys.has(key)),
  );
}

async function verifyListingOwnership(
  companyId: string | null | undefined,
  items: NormalizedOrderItem[],
) {
  const listingIds = [
    ...new Set(items.map((item) => item.marketplaceListingId).filter(Boolean)),
  ];

  if (!listingIds.length) {
    throw new Error("At least one marketplace listing is required.");
  }

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
      isAvailable: true,
      status: true,
      showOnGhuba: true,
      ghubaStatus: true,
      listingMarketStatus: true,
    },
  });

  if (listings.length !== listingIds.length) {
    const found = new Set(listings.map((item) => item.id));

    const missing = listingIds.filter((id) => !found.has(id));

    throw new Error(
      `One or more listings could not be found: ${missing.join(", ")}`,
    );
  }

  for (const listing of listings) {
    if (!listing.isAvailable) {
      throw new Error(`Listing "${listing.name}" is currently unavailable.`);
    }

    if (listing.status !== "ACTIVE") {
      throw new Error(`Listing "${listing.name}" is not currently active.`);
    }
  }

  ////////////////////////////////////////////////////////////////////

  return listings;
}

function validateTotals(input: NormalizedOrderInput) {
  const calculatedTotal = input.items.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );

  /**
   * We allow a tiny floating-point tolerance.
   */
  const difference = Math.abs(calculatedTotal - input.totalPrice);

  if (difference > 0.01) {
    throw new Error(
      `Order total mismatch. Expected ${calculatedTotal.toFixed(
        2,
      )}, received ${input.totalPrice.toFixed(2)}.`,
    );
  }
}

async function processPayment(orderDb: any, input: NormalizedOrderInput) {
  const paymentOption = input.paymentOption;

  /**
   * --------------------------------------------------------
   * NO EXTERNAL GATEWAY
   * --------------------------------------------------------
   */
  if (DEFERRED_PAYMENT_OPTIONS.has(paymentOption)) {
    await prisma.customerOrder.update({
      where: {
        id: orderDb.id,
      },
      data: {
        paymentStatus: "PENDING",
        status: "PENDING",
      },
    });

    return {
      paymentResponse: {
        success: true,
        message:
          paymentOption === "cod"
            ? "Order placed for payment on delivery."
            : paymentOption === "pickupatshop"
              ? "Order placed for payment on pickup."
              : "Order recorded as a pending/deferred payment.",
      },

      paymentStatus: "PENDING",
      orderStatus: "PENDING",
      authorizationUrl: null,
    };
  }

  /**
   * --------------------------------------------------------
   * POS PAYMENT
   * --------------------------------------------------------
   */
  if (IMMEDIATE_PAYMENT_OPTIONS.has(paymentOption)) {
    const breakdown = input.paymentData?.paymentBreakdown ?? [];

    await prisma.customerOrder.update({
      where: {
        id: orderDb.id,
      },
      data: {
        paymentStatus: "COMPLETED",
        status: "PAID",
      },
    });

    return {
      paymentResponse: {
        success: true,
        message:
          paymentOption === "cash"
            ? "Cash payment processed successfully."
            : "Split payment processed successfully.",
        breakdown,
      },

      paymentStatus: "COMPLETED",
      orderStatus: "PAID",
      authorizationUrl: null,
    };
  }

  /**
   * --------------------------------------------------------
   * EXTERNAL GATEWAYS
   * --------------------------------------------------------
   */
  if (!EXTERNAL_PAYMENT_OPTIONS.has(paymentOption)) {
    throw new Error(`Unsupported payment option: ${paymentOption}`);
  }

  const cfg = await getCompanyPaymentConfig(input.companyId ?? undefined);

  if (!cfg?.credentials) {
    throw new Error("Payment gateway configuration is missing for this store.");
  }

  let paymentResponse: any;

  switch (paymentOption) {
    case "mpesa": {
      const phoneNumber =
        input.paymentData?.mpesaPhone ?? input.mpesaPhone ?? input.phone;

      if (!phoneNumber) {
        throw new Error("M-Pesa phone number is required.");
      }

      paymentResponse = await initiateMpesaPayment(
        orderDb,
        String(phoneNumber),
        cfg.credentials,
      );

      break;
    }

    case "paystack": {
      paymentResponse = await initiatePaystackPayment(
        orderDb,
        input.email,
        cfg.credentials,
        "",
      );

      break;
    }

    case "ghuba": {
      paymentResponse = await initiateGhubaPayment(orderDb, input.email);

      break;
    }

    case "stripe": {
      paymentResponse = await initiateStripePaymentIntent(
        orderDb,
        cfg.credentials,
      );

      break;
    }

    case "paypal": {
      paymentResponse = await createPaypalOrder(orderDb, cfg.credentials);

      break;
    }

    /**
     * `card` is intentionally not processed directly here.
     *
     * Card payments should resolve to a configured provider,
     * rather than allowing raw card details to enter this layer.
     */
    case "card": {
      throw new Error(
        "Direct card processing is not supported. Use Paystack or Stripe.",
      );
    }

    default:
      throw new Error(`Unsupported payment option: ${paymentOption}`);
  }

  const authorizationUrl =
    paymentResponse?.data?.authorization_url ??
    paymentResponse?.authorization_url ??
    paymentResponse?.data?.approval_url ??
    paymentResponse?.approval_url ??
    null;

  return {
    paymentResponse,

    paymentStatus: paymentResponse?.success === false ? "PENDING" : "PENDING",

    orderStatus: "PENDING",

    authorizationUrl,
  };
}

export async function processOrder(
  input: NormalizedOrderInput,
): Promise<ProcessedOrderResult> {
  /**
   * --------------------------------------------------------
   * BASIC VALIDATION
   * --------------------------------------------------------
   */
  if (!input.name?.trim()) {
    throw new Error("Customer name is required.");
  }

  if (!input.email?.trim()) {
    throw new Error("Customer email is required.");
  }

  if (!input.phone?.trim()) {
    throw new Error("Customer phone is required.");
  }

  if (!input.items?.length) {
    throw new Error("Order must contain at least one item.");
  }

  if (input.totalPrice <= 0) {
    throw new Error("Order total must be greater than zero.");
  }

  /**
   * --------------------------------------------------------
   * VALIDATE LISTINGS
   * --------------------------------------------------------
   */
  await verifyListingOwnership(input.companyId, input.items);

  /**
   * --------------------------------------------------------
   * VALIDATE TOTAL
   * --------------------------------------------------------
   */
  validateTotals(input);
  

  /**
   * --------------------------------------------------------
   * IDEMPOTENCY
   * --------------------------------------------------------
   */
  if (input.idempotencyKey) {
    const existingOrder = await prisma.customerOrder.findFirst({
      where: {
        idempotencyKey: input.idempotencyKey,
      },
    });

    if (existingOrder) {
      throw new Error("An order with this idempotency key already exists.");
    }
  }

  const trackingNumber = input.trackingNumber ?? generateTrackingNumber();

  const paymentData = sanitizePaymentData(input.paymentData);

  /**
   * --------------------------------------------------------
   * CREATE ORDER
   * --------------------------------------------------------
   */
  const orderDb = await createOrderRecord({
    companyId: input.companyId ?? undefined,

    consumerId: input.consumerId ?? undefined,

    items: input.items,

    totalPrice: input.totalPrice,

    totalFinalPrice: input.totalFinalPrice ?? input.totalPrice,

    mpesaPhone: input.mpesaPhone ?? undefined,

    paymentOption: input.paymentOption,

    shippingAddress: input.shippingAddress ?? undefined,

    shippingMethod: input.shippingMethod ?? undefined,

    name: input.name,

    email: input.email,

    phone: input.phone,

    promoCode:
      typeof paymentData.promoCode === "string"
        ? paymentData.promoCode
        : undefined,

    trackingNumber,

    deliveryStatus: input.isServiceOrder
      ? "Appointment Requested"
      : "Order Placed",

    delivery: false,

    notes:
      typeof paymentData.notes === "string" ? paymentData.notes : undefined,

    idempotencyKey: input.idempotencyKey ?? undefined,
  });

  /**
   * --------------------------------------------------------
   * PROCESS PAYMENT
   * --------------------------------------------------------
   */
  try {
    const payment = await processPayment(orderDb, input);

    /**
     * Reload the final order state.
     */
    const finalOrder = await prisma.customerOrder.findUnique({
      where: {
        id: orderDb.id,
      },
    });

    return {
      order: finalOrder ?? orderDb,

      trackingNumber,

      paymentResponse: payment.paymentResponse,

      authorizationUrl: payment.authorizationUrl,

      paymentStatus: payment.paymentStatus,

      orderStatus: payment.orderStatus,

      isServiceOrder: Boolean(input.isServiceOrder),
    };
  } catch (error) {
    /**
     * The order exists, but payment initialization failed.
     *
     * Do not delete the order. It is useful for retry,
     * auditing and customer support.
     */
    console.error("[ORDER_PAYMENT_PROCESSING_ERROR]", {
      orderId: orderDb.id,
      paymentOption: input.paymentOption,
      error,
    });

    await prisma.customerOrder.update({
      where: {
        id: orderDb.id,
      },
      data: {
        paymentStatus: "PENDING",
        status: "PENDING",
      },
    });

    throw error;
  }
}
