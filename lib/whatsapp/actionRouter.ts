import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import prisma from "@/server/db/prismadb";
import { createOrder as createUnifiedOrder } from "@/lib/orders/centralizedCreateOrder";
import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";
import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";
import { whatsappRepository } from "@/lib/whatsapp/repository";
import {
  whatsappActionSchema,
  type WhatsAppAction,
  type WhatsAppActionContext,
  type WhatsAppActionResult,
} from "@/lib/whatsapp/types";
import { calculateOrderPricing } from "@/lib/pricing";
import type { PricingResult } from "@/lib/pricing/types";

/**
 * ============================================================
 * ACTION ROUTER
 * ============================================================
 */

export async function actionRouter(params: {
  action: unknown;
  context: WhatsAppActionContext;
}): Promise<WhatsAppActionResult> {
  const parsed = whatsappActionSchema.safeParse(params.action);

  if (!parsed.success) {
    return {
      success: false,
      action: "escalate_to_human",
      message:
        "I couldn't safely understand that request. Let me connect you with someone from the team.",
      shouldRespond: true,
      shouldEscalate: true,
    };
  }

  const action = parsed.data;
  let auditId: string | null = null;

  try {
    const audit = await prisma.aIAction.create({
      data: {
        companyId: params.context.companyId,
        conversationId: params.context.conversationId,
        action: action.action,
        status: "PENDING",
        input: sanitizeActionInput(action),
        messageId: params.context.messageId,
        idempotencyKey: `${params.context.conversationId}:${params.context.messageId ?? crypto.randomUUID()}:${action.action}`,
        startedAt: new Date(),
      },
    });

    auditId = audit.id;
    let result: WhatsAppActionResult;

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
      default:
        result = {
          success: false,
          action: (action as any).action,
          message: "I can't perform that action.",
        };
    }

    await prisma.aIAction.update({
      where: { id: auditId },
      data: {
        status: result.success ? "COMPLETED" : "FAILED",
        output: sanitizeActionOutput(result),
        completedAt: new Date(),
        error: result.success ? undefined : result.message,
      },
    });

    return result;
  } catch (error) {
    console.error("[WHATSAPP_ACTION_ERROR]", {
      action: action.action,
      companyId: params.context.companyId,
      conversationId: params.context.conversationId,
      error,
    });

    if (auditId) {
      await prisma.aIAction
        .update({
          where: { id: auditId },
          data: {
            status: "FAILED",
            error: error instanceof Error ? error.message : "Action failed.",
            completedAt: new Date(),
          },
        })
        .catch(() => undefined);
    }

    return {
      success: false,
      action: action.action,
      message:
        "Sorry, I couldn't complete that request right now. Please try again.",
    };
  }
}

/**
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
}
