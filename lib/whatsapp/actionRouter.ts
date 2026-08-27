<<<<<<< HEAD
import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import prisma from "@/server/db/prismadb";
import { createOrder as createUnifiedOrder } from "@/lib/orders/centralizedCreateOrder";
import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";
import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";
import { whatsappRepository } from "@/lib/whatsapp/repository";
=======
/**
 * lib/whatsapp/actionRouter.ts
 *
 * Centralized Action Router.
 * Validates action input with Zod, enforces strict tenant boundaries,
 * executes domain actions, records audit logs into AIAction, and sanitizes output.
 */

import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import prisma from "@/server/db/prismadb";
>>>>>>> c00ac535 (Fresh initialization and recovery)
import {
  whatsappActionSchema,
  type WhatsAppAction,
  type WhatsAppActionContext,
  type WhatsAppActionResult,
<<<<<<< HEAD
} from "@/lib/whatsapp/types";
import { calculateOrderPricing } from "@/lib/pricing";
import type { PricingResult } from "@/lib/pricing/types";

/**
 * ============================================================
 * ACTION ROUTER
 * ============================================================
 */
=======
} from "./types";

// Product Actions
import { searchProducts } from "./actions/products/searchProducts";
import { getProduct } from "./actions/products/getProduct";
import { getCategories } from "./actions/products/getCategories";
import { checkInventory } from "./actions/products/checkInventory";
import { getStoreInformation } from "./actions/products/getStoreInformation";

// Customer Actions
import { identifyCustomer } from "./actions/customer/identifyCustomer";
import { getCustomerOrders } from "./actions/customer/getCustomerOrders";
import { getCustomerProfile, updateCustomer } from "./actions/customer/getCustomerProfile";

// Pricing Actions
import { calculatePrice } from "./actions/pricing/calculatePrice";
import { calculateShipping, validateDiscount } from "./actions/pricing/calculateShipping";
import { calculateCheckoutTotal } from "./actions/pricing/calculateCheckoutTotal";

// Checkout Actions
import { createCheckout, getCheckout, confirmCheckout } from "./actions/checkout/createCheckout";

// Order Actions
import { createOrder } from "./actions/orders/createOrder";
import { getOrder, trackOrder, cancelOrder, requestOrderChange } from "./actions/orders/getOrder";

// Service Actions
import { searchServices } from "./actions/services/searchServices";
import {
  getServiceAvailability,
  bookService,
  confirmServiceBooking,
  cancelServiceBooking,
} from "./actions/services/getServiceAvailability";

// Payment Actions
import {
  initiateMpesa,
  getPaymentMethods,
  checkPaymentStatus,
} from "./actions/payments/initiateMpesa";

// Support Actions
import { escalateToHuman, createSupportRequest } from "./actions/support/escalateToHuman";
>>>>>>> c00ac535 (Fresh initialization and recovery)

export async function actionRouter(params: {
  action: unknown;
  context: WhatsAppActionContext;
}): Promise<WhatsAppActionResult> {
  const parsed = whatsappActionSchema.safeParse(params.action);

  if (!parsed.success) {
<<<<<<< HEAD
    return {
      success: false,
      action: "escalate_to_human",
      message:
        "I couldn't safely understand that request. Let me connect you with someone from the team.",
      shouldRespond: true,
      shouldEscalate: true,
=======
    console.warn("[ACTION_ROUTER_VALIDATION_FAILED]", parsed.error.format());
    return {
      success: false,
      action: "escalate_to_human",
      message: "I didn't quite catch that. Would you like me to connect you with our support team?",
      shouldRespond: true,
      shouldEscalate: false,
>>>>>>> c00ac535 (Fresh initialization and recovery)
    };
  }

  const action = parsed.data;
  let auditId: string | null = null;
<<<<<<< HEAD

  try {
=======
  const startTime = Date.now();

  try {
    // 1. Record pending AI Action in database for complete auditability
>>>>>>> c00ac535 (Fresh initialization and recovery)
    const audit = await prisma.aIAction.create({
      data: {
        companyId: params.context.companyId,
        conversationId: params.context.conversationId,
        action: action.action,
        status: "PENDING",
<<<<<<< HEAD
        input: sanitizeActionInput(action),
=======
        input: sanitizeData(action),
>>>>>>> c00ac535 (Fresh initialization and recovery)
        messageId: params.context.messageId,
        idempotencyKey: `${params.context.conversationId}:${params.context.messageId ?? crypto.randomUUID()}:${action.action}`,
        startedAt: new Date(),
      },
    });

    auditId = audit.id;
    let result: WhatsAppActionResult;

<<<<<<< HEAD
    switch (action.action) {
      case "search_products":
        result = await searchProducts(action, params.context);
        break;
      case "calculate_checkout":
        result = await calculateCheckout(action, params.context);
        break;
      case "create_order":
        result = await createOrder(action, params.context);
        break;
      case "initiate_mpesa":
        result = await initiateMpesa(action, params.context);
        break;
      case "get_order_status":
        result = await getOrderStatus(action, params.context);
        break;
      case "escalate_to_human":
        result = await escalateToHuman(action, params.context);
        break;
=======
    // 2. Dispatch to domain action handlers with strict tenant context
    switch (action.action) {
      // Products
      case "search_products":
        result = await searchProducts(action.arguments, params.context);
        break;
      case "get_product":
      case "get_listing":
        result = await getProduct(action.arguments as any, params.context);
        break;
      case "get_categories":
        result = await getCategories(action.arguments, params.context);
        break;
      case "check_inventory":
        result = await checkInventory(action.arguments, params.context);
        break;
      case "get_store_information":
        result = await getStoreInformation(action.arguments, params.context);
        break;

      // Customer
      case "identify_customer":
        result = await identifyCustomer(action.arguments, params.context);
        break;
      case "create_customer":
      case "update_customer":
        result = await updateCustomer(action.arguments, params.context);
        break;
      case "get_customer_orders":
        result = await getCustomerOrders(action.arguments, params.context);
        break;
      case "get_customer_profile":
        result = await getCustomerProfile(action.arguments, params.context);
        break;

      // Pricing
      case "calculate_price":
        result = await calculatePrice(action.arguments, params.context);
        break;
      case "calculate_shipping":
        result = await calculateShipping(action.arguments, params.context);
        break;
      case "validate_discount":
        result = await validateDiscount(action.arguments, params.context);
        break;
      case "calculate_checkout_total":
        result = await calculateCheckoutTotal(action.arguments, params.context);
        break;

      // Checkout
      case "create_checkout":
        result = await createCheckout(action.arguments, params.context);
        break;
      case "get_checkout":
        result = await getCheckout(action.arguments, params.context);
        break;
      case "update_checkout":
        result = await createCheckout(action.arguments as any, params.context);
        break;
      case "confirm_checkout":
        result = await confirmCheckout(action.arguments, params.context);
        break;

      // Orders
      case "create_order":
        result = await createOrder(action.arguments, params.context);
        break;
      case "get_order":
        result = await getOrder(action.arguments, params.context);
        break;
      case "track_order":
        result = await trackOrder(action.arguments, params.context);
        break;
      case "cancel_order":
        result = await cancelOrder(action.arguments, params.context);
        break;
      case "request_order_change":
        result = await requestOrderChange(action.arguments, params.context);
        break;

      // Services
      case "search_services":
        result = await searchServices(action.arguments, params.context);
        break;
      case "get_service":
      case "get_service_availability":
        result = await getServiceAvailability(action.arguments, params.context);
        break;
      case "create_service_booking":
        result = await bookService(action.arguments, params.context);
        break;
      case "confirm_service_booking":
        result = await confirmServiceBooking(action.arguments, params.context);
        break;
      case "cancel_service_booking":
        result = await cancelServiceBooking(action.arguments, params.context);
        break;

      // Payments
      case "get_payment_methods":
        result = await getPaymentMethods(action.arguments, params.context);
        break;
      case "initiate_payment":
      case "initiate_mpesa":
        result = await initiateMpesa(action.arguments as any, params.context);
        break;
      case "check_payment_status":
        result = await checkPaymentStatus(action.arguments, params.context);
        break;
      case "retry_payment":
        result = await initiateMpesa(action.arguments as any, params.context);
        break;

      // Support
      case "escalate_to_human":
        result = await escalateToHuman(action.arguments, params.context);
        break;
      case "create_support_request":
        result = await createSupportRequest(action.arguments, params.context);
        break;
      case "get_support_status":
        result = await getCustomerOrders({ limit: 1 }, params.context);
        break;

>>>>>>> c00ac535 (Fresh initialization and recovery)
      default:
        result = {
          success: false,
          action: (action as any).action,
<<<<<<< HEAD
          message: "I can't perform that action.",
        };
    }

=======
          message: "I am unable to perform that action at this time.",
        };
    }

    // 3. Complete audit log with sanitized output and duration
>>>>>>> c00ac535 (Fresh initialization and recovery)
    await prisma.aIAction.update({
      where: { id: auditId },
      data: {
        status: result.success ? "COMPLETED" : "FAILED",
<<<<<<< HEAD
        output: sanitizeActionOutput(result),
        completedAt: new Date(),
        error: result.success ? undefined : result.message,
=======
        output: sanitizeData(result),
        completedAt: new Date(),
        error: result.success ? undefined : result.message,
        orderId: (result.data?.orderId as string) ?? undefined,
>>>>>>> c00ac535 (Fresh initialization and recovery)
      },
    });

    return result;
  } catch (error) {
<<<<<<< HEAD
    console.error("[WHATSAPP_ACTION_ERROR]", {
=======
    console.error("[ACTION_ROUTER_EXECUTION_ERROR]", {
>>>>>>> c00ac535 (Fresh initialization and recovery)
      action: action.action,
      companyId: params.context.companyId,
      conversationId: params.context.conversationId,
      error,
<<<<<<< HEAD
=======
      durationMs: Date.now() - startTime,
>>>>>>> c00ac535 (Fresh initialization and recovery)
    });

    if (auditId) {
      await prisma.aIAction
        .update({
          where: { id: auditId },
          data: {
            status: "FAILED",
<<<<<<< HEAD
            error: error instanceof Error ? error.message : "Action failed.",
=======
            error: error instanceof Error ? error.message : "Internal action execution error.",
>>>>>>> c00ac535 (Fresh initialization and recovery)
            completedAt: new Date(),
          },
        })
        .catch(() => undefined);
    }

    return {
      success: false,
      action: action.action,
<<<<<<< HEAD
      message:
        "Sorry, I couldn't complete that request right now. Please try again.",
=======
      message: "I encountered an error processing your request. Please try again shortly.",
>>>>>>> c00ac535 (Fresh initialization and recovery)
    };
  }
}

/**
<<<<<<< HEAD
 * ============================================================
 * PRODUCT SEARCH
 * ============================================================
 */

async function searchProducts(
  action: Extract<WhatsAppAction, { action: "search_products" }>,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const args = action.arguments;

  const where: Record<string, unknown> = {
    companyId: context.companyId,
    status: "ACTIVE",
    isAvailable: true,
    whatsappEnabled: true,
  };

  if (args.query) {
    where.OR = [
      { name: { contains: args.query, mode: "insensitive" } },
      { description: { contains: args.query, mode: "insensitive" } },
      { brand: { contains: args.query, mode: "insensitive" } },
    ];
  }

  if (args.brand) {
    where.brand = { contains: args.brand, mode: "insensitive" };
  }

  if (args.minPrice !== undefined) {
    where.finalPrice = {
      ...((where.finalPrice as object) ?? {}),
      gte: args.minPrice,
    };
  }

  if (args.maxPrice !== undefined) {
    where.finalPrice = {
      ...((where.finalPrice as object) ?? {}),
      lte: args.maxPrice,
    };
  }

  const listings = await prisma.marketplaceListings.findMany({
    where: where as any,
    select: {
      id: true,
      name: true,
      description: true,
      brand: true,
      sellingPrice: true,
      finalPrice: true,
      discount: true,
      quantity: true,
      isAvailable: true,
      images: true,
      currency: true,
    },
    orderBy: { createdAt: "desc" },
    take: args.limit ?? 5,
  });

  if (!listings.length) {
    return {
      success: true,
      action: "search_products",
      message: "I couldn't find an available product matching that request.",
      data: { products: [] },
    };
  }

  return {
    success: true,
    action: "search_products",
    message: `I found ${listings.length} product${listings.length === 1 ? "" : "s"} for you.`,
    data: {
      products: listings.map((listing) => ({
        id: listing.id,
        name: listing.name,
        description: listing.description,
        brand: listing.brand,
        price: listing.finalPrice ?? listing.sellingPrice,
        originalPrice: listing.sellingPrice,
        discount: listing.discount,
        stock: listing.quantity,
        available: listing.isAvailable,
        images: listing.images,
        currency: listing.currency ?? "KES",
      })),
    },
  };
}

/**
 * ============================================================
 * SERVER-SIDE CHECKOUT PRICING
 * ============================================================
 */

async function calculateCheckout(
  action: Extract<WhatsAppAction, { action: "calculate_checkout" }>,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const args = action.arguments;
  const listingIds = args.items.map((item) => item.marketplaceListingId);

  const listings = await prisma.marketplaceListings.findMany({
    where: {
      id: { in: listingIds },
      companyId: context.companyId,
      status: "ACTIVE",
      isAvailable: true,
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
      pricingTiers: true,
      duration: true,
      hourlyRate: true,
      minimumHours: true,
      listingTransactionType: true,
    },
  });

  const listingMap = new Map(listings.map((listing) => [listing.id, listing]));

  const pricingItems = args.items.map((item) => {
    const listing = listingMap.get(item.marketplaceListingId);
    if (!listing) {
      throw new Error("One of the selected products is no longer available.");
    }

    return {
      marketplaceListingId: listing.id,
      quantity: item.quantity,
      selectedOptions: item.selectedOptions ?? [],
      date: item.date ?? null,
      timeSlot: item.timeSlot ?? null,
      serviceNotes: item.serviceNotes ?? null,
    };
  });

  const pricing = await calculateOrderPricing({
    companyId: context.companyId,
    items: pricingItems,
    promoCode: args.promoCode ?? null,
    shippingMethod: args.shippingMethod ?? null,
    shippingAddress: args.shippingAddress ?? null,
    mode: "PRODUCT",
  });

  await whatsappRepository.updateCart(context.conversationId, {
    items: args.items,
    pricing,
    shippingAddress: args.shippingAddress,
    shippingMethod: args.shippingMethod,
    paymentOption: args.paymentOption,
    promoCode: args.promoCode,
  });

  return {
    success: true,
    action: "calculate_checkout",
    message: buildCheckoutSummary(pricing, listings),
    data: { pricing },
  };
}

/**
 * ============================================================
 * ORDER CREATION
 * ============================================================
 */

async function createOrder(
  action: Extract<WhatsAppAction, { action: "create_order" }>,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const args = action.arguments;

  if (!args.confirmation) {
    return {
      success: false,
      action: "create_order",
      message: "Order confirmation is required before I can place the order.",
    };
  }

  const result = await createUnifiedOrder({
    orderType: "PRODUCT",
    companyId: context.companyId,
    consumerId: undefined,
    name: context.customerName ?? "WhatsApp Customer",
    email:
      context.customerEmail ?? `whatsapp-${context.waId}@placeholder.local`,
    phone: context.phoneNumber,
    mpesaPhone: args.mpesaPhone ?? null,
    paymentOption: args.paymentOption,
    items: args.items,
    shippingAddress: args.shippingAddress,
    shippingMethod: args.shippingMethod,
    promoCode: args.promoCode,
    notes: args.notes,
    idempotencyKey: crypto.randomUUID(),
  });

  await prisma.customerOrder.update({
    where: { id: result.order.id },
    data: { orderSource: "WHATSAPP" },
  });

  await whatsappRepository.updateCart(context.conversationId, {
    orderId: result.order.id,
    trackingNumber: result.trackingNumber,
    pricing: result.pricing,
    status: "ORDER_CREATED",
  });

  return {
    success: true,
    action: "create_order",
    message: `Your order has been placed successfully.\n\nTracking: ${result.trackingNumber}\nTotal: ${formatMoney(result.pricing.total)}\n\nHow would you like to pay?`,
    data: {
      orderId: result.order.id,
      trackingNumber: result.trackingNumber,
      pricing: result.pricing,
    },
  };
}

/**
 * ============================================================
 * M-PESA
 * ============================================================
 */

async function initiateMpesa(
  action: Extract<WhatsAppAction, { action: "initiate_mpesa" }>,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const args = action.arguments;

  const order = await prisma.customerOrder.findFirst({
    where: {
      id: args.orderId,
      companyId: context.companyId,
    },
  });

  if (!order) {
    return {
      success: false,
      action: "initiate_mpesa",
      message: "I couldn't find that order.",
    };
  }

  if (order.paymentStatus === "COMPLETED") {
    return {
      success: true,
      action: "initiate_mpesa",
      message: "This order has already been paid for.",
    };
  }

  const phone = args.phone ?? context.phoneNumber;
  if (!phone) {
    return {
      success: false,
      action: "initiate_mpesa",
      message: "Please provide the M-Pesa phone number to use.",
    };
  }

  const cfg = await getCompanyPaymentConfig(context.companyId);
  if (!cfg?.credentials) {
    return {
      success: false,
      action: "initiate_mpesa",
      message: "M-Pesa is not currently configured for this store.",
    };
  }

  const response = await initiateMpesaPayment(order, phone, cfg.credentials);

  return {
    success: true,
    action: "initiate_mpesa",
    message:
      "I've sent an M-Pesa payment request to your phone. Complete the request on your phone and I'll confirm the payment once the payment service verifies it.",
    data: {
      orderId: order.id,
      status: "PENDING",
      checkoutRequestId:
        response?.data?.CheckoutRequestID ??
        response?.CheckoutRequestID ??
        null,
      merchantRequestId:
        response?.data?.MerchantRequestID ??
        response?.MerchantRequestID ??
        null,
    },
  };
}

/**
 * ============================================================
 * ORDER STATUS
 * ============================================================
 */

async function getOrderStatus(
  action: Extract<WhatsAppAction, { action: "get_order_status" }>,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const args = action.arguments;

  const order = await prisma.customerOrder.findFirst({
    where: {
      companyId: context.companyId,
      OR: [
        args.orderId ? { id: args.orderId } : undefined,
        args.trackingNumber
          ? { trackingNumber: args.trackingNumber }
          : undefined,
      ].filter(Boolean) as any,
    },
    select: {
      id: true,
      trackingNumber: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      deliveryStatus: true,
      totalFinalPrice: true,
      createdAt: true,
    },
  });

  if (!order) {
    return {
      success: true,
      action: "get_order_status",
      message: "I couldn't find an order matching those details.",
    };
  }

  return {
    success: true,
    action: "get_order_status",
    message: `Order ${order.trackingNumber ?? order.id}\nStatus: ${order.status}\nPayment: ${order.paymentStatus}\nDelivery: ${order.deliveryStatus ?? "Pending"}\nTotal: ${order.totalFinalPrice ?? 0}`,
    data: { order },
  };
}

/**
 * ============================================================
 * HUMAN ESCALATION
 * ============================================================
 */

async function escalateToHuman(
  action: Extract<WhatsAppAction, { action: "escalate_to_human" }>,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  await whatsappRepository.escalateConversation(
    context.conversationId,
    action.arguments.reason,
  );

  return {
    success: true,
    action: "escalate_to_human",
    message:
      "I've connected you with a member of our team. Someone will assist you shortly.",
    shouldEscalate: true,
    shouldRespond: true,
  };
}

/**
 * ============================================================
 * HELPERS
 * ============================================================
 */

function buildCheckoutSummary(
  pricing: PricingResult,
  listings: Array<{ id: string; name: string }>,
) {
  const names = listings.map((listing) => listing.name).join(", ");
  const currency = pricing.currency ?? "KES";

  return [
    "Here is your order summary:",
    "",
    names,
    "",
    `Subtotal: ${formatMoney(pricing.subtotal, currency)}`,
    `Discount: ${formatMoney(pricing.totalDiscount, currency)}`,
    `Tax: ${formatMoney(pricing.tax, currency)}`,
    `Delivery: ${formatMoney(pricing.shipping, currency)}`,
    `Total: ${formatMoney(pricing.total, currency)}`,
    "",
    "Reply YES when you're ready to place the order.",
  ].join("\n");
}

function formatMoney(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function sanitizeActionInput(action: WhatsAppAction): Prisma.InputJsonObject {
  const json = JSON.parse(JSON.stringify(action));
  if (json.arguments?.mpesaPhone) json.arguments.mpesaPhone = "[REDACTED]";
  if (json.arguments?.paymentData) json.arguments.paymentData = "[REDACTED]";
  return json as Prisma.InputJsonObject;
}

function sanitizeActionOutput(
  result: WhatsAppActionResult,
): Prisma.InputJsonObject {
  return JSON.parse(
    JSON.stringify({
      success: result.success,
      action: result.action,
      message: result.message,
      data: result.data,
    }),
  ) as Prisma.InputJsonObject;
=======
 * Sanitizes and redacts sensitive PII, phone numbers, and payment details.
 */
function sanitizeData(data: unknown): Prisma.InputJsonValue {
  if (!data || typeof data !== "object") {
    return (data as Prisma.InputJsonValue) ?? {};
  }
  const cloned = JSON.parse(JSON.stringify(data));
  redactSensitiveKeys(cloned);
  return cloned as Prisma.InputJsonValue;
}

function redactSensitiveKeys(obj: any) {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    if (/password|secret|token|apikey|cardnumber|cvv|pin/i.test(key)) {
      obj[key] = "[REDACTED]";
    } else if (typeof obj[key] === "object") {
      redactSensitiveKeys(obj[key]);
    }
  }
>>>>>>> c00ac535 (Fresh initialization and recovery)
}
