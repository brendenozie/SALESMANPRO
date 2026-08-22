// lib/whatsapp/ai/actionRouter.ts

import {
  searchMarketplace,
  getListing,
  calculateOrderPricing,
  createWhatsAppOrder,
  getOrderStatus,
  getServiceAvailability,
  bookService,
} from "../business";

import { updateConversationState } from "../conversation";

import type { ConversationState } from "../types";

export type AIActionName =
  | "SEARCH_PRODUCTS"
  | "GET_PRODUCT"
  | "CALCULATE_ORDER"
  | "CREATE_ORDER"
  | "GET_ORDER_STATUS"
  | "GET_SERVICE_AVAILABILITY"
  | "BOOK_SERVICE"
  | "HUMAN_HANDOFF";

export interface AIAction {
  name: AIActionName;

  arguments: Record<string, unknown>;
}

export interface ActionContext {
  companyId: string;

  conversationId: string;

  phoneNumber: string;

  customerName?: string;

  customerEmail?: string;

  consumerId?: string;

  aiSettings: {
    allowAIOrderCreation: boolean;

    allowAIPaymentLinks: boolean;

    allowAIAppointmentBooking: boolean;

    enableHumanHandoff: boolean;
  };
}

function stringArg(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

function numberArg(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function paymentOption(value: unknown) {
  const allowed = [
    "cod",
    "pickupatshop",
    "mpesa",
    "card",
    "paystack",
    "ghuba",
    "stripe",
    "paypal",
    "cash",
    "split",
    "pending",
  ] as const;

  if (typeof value !== "string") {
    return "cod" as const;
  }

  return (
    allowed.includes(value as any) ? value : "cod"
  ) as (typeof allowed)[number];
}

export async function executeAIAction(
  action: AIAction,
  context: ActionContext,
) {
  switch (action.name) {
    case "SEARCH_PRODUCTS": {
      const query = stringArg(action.arguments.query);

      const category = stringArg(action.arguments.category);

      const maxPrice = numberArg(action.arguments.maxPrice);

      const result = await searchMarketplace({
        companyId: context.companyId,

        query,

        category,

        maxPrice,

        limit: 5,
      });

      return {
        success: true,

        action: action.name,

        products: result,
      };
    }

    case "GET_PRODUCT": {
      const listingId = stringArg(action.arguments.listingId);

      if (!listingId) {
        throw new Error("listingId is required");
      }

      const result = await getListing(listingId, context.companyId);

      if (!result) {
        return {
          success: false,

          action: action.name,

          message: "Product not found",
        };
      }

      return {
        success: true,

        action: action.name,

        product: result,
      };
    }

    case "CALCULATE_ORDER": {
      const items = Array.isArray(action.arguments.items)
        ? action.arguments.items
        : [];

      if (!items.length) {
        throw new Error("Order items are required");
      }

      const result = await calculateOrderPricing({
        companyId: context.companyId,

        items: items as any,
      });

      return {
        success: true,

        action: action.name,

        pricing: result,
      };
    }

    case "CREATE_ORDER": {
      if (!context.aiSettings.allowAIOrderCreation) {
        return {
          success: false,

          action: action.name,

          requiresHuman: true,

          message: "AI order creation is disabled for this company.",
        };
      }

      const items = Array.isArray(action.arguments.items)
        ? action.arguments.items
        : [];

      if (!items.length) {
        throw new Error("Order items are required");
      }

      const name =
        stringArg(action.arguments.name) ||
        context.customerName ||
        "WhatsApp Customer";

      const phone = stringArg(action.arguments.phone) || context.phoneNumber;

      const email = stringArg(action.arguments.email) || context.customerEmail;

      const result = await createWhatsAppOrder({
        companyId: context.companyId,

        consumerId: context.consumerId,

        name,

        email,

        phone,

        items: items as any,

        paymentOption: paymentOption(action.arguments.paymentOption),

        shippingAddress: action.arguments.shippingAddress,

        shippingMethod: stringArg(action.arguments.shippingMethod),

        conversationId: context.conversationId,
      });

      return {
        success: true,

        action: action.name,

        orderId: result.order.id,

        trackingNumber: result.order.trackingNumber,

        pricing: result.pricing,
      };
    }

    case "GET_ORDER_STATUS": {
      const result = await getOrderStatus({
        companyId: context.companyId,

        orderId: stringArg(action.arguments.orderId),

        trackingNumber: stringArg(action.arguments.trackingNumber),

        phone: context.phoneNumber,
      });

      return {
        success: Boolean(result),

        action: action.name,

        order: result,
      };
    }

    case "GET_SERVICE_AVAILABILITY": {
      const listingId = stringArg(action.arguments.listingId);

      if (!listingId) {
        throw new Error("listingId is required");
      }

      const result = await getServiceAvailability({
        companyId: context.companyId,

        listingId,

        date: stringArg(action.arguments.date),
      });

      return {
        success: true,

        action: action.name,

        availability: result,
      };
    }

    case "BOOK_SERVICE": {
      if (!context.aiSettings.allowAIAppointmentBooking) {
        return {
          success: false,

          action: action.name,

          requiresHuman: true,

          message: "AI service booking is disabled.",
        };
      }

      const listingId = stringArg(action.arguments.listingId);

      const date = stringArg(action.arguments.date);

      if (!listingId || !date) {
        throw new Error("listingId and date are required");
      }

      const result = await bookService({
        companyId: context.companyId,

        consumerId: context.consumerId,

        name: context.customerName || "WhatsApp Customer",

        email: context.customerEmail,

        phone: context.phoneNumber,

        listingId,

        date,

        timeSlot: stringArg(action.arguments.timeSlot),

        quantity: numberArg(action.arguments.quantity),

        serviceNotes: stringArg(action.arguments.serviceNotes),

        paymentOption: paymentOption(action.arguments.paymentOption),

        conversationId: context.conversationId,
      });

      return {
        success: true,

        action: action.name,

        orderId: result.order.id,

        trackingNumber: result.order.trackingNumber,

        pricing: result.pricing,
      };
    }

    case "HUMAN_HANDOFF": {
      if (!context.aiSettings.enableHumanHandoff) {
        return {
          success: false,

          action: action.name,

          message: "Human handoff is not enabled.",
        };
      }

      await updateConversationState(
        context.conversationId,

        {
          aiEnabled: false,

          humanHandoff: true,

          state: "HUMAN_HANDOFF" satisfies ConversationState,

          interactionStatus: "ACTIVE",
        },
      );

      return {
        success: true,

        action: action.name,

        humanHandoff: true,

        reason:
          stringArg(action.arguments.reason) ||
          "Customer requested human assistance.",
      };
    }

    default:
      throw new Error(`Unsupported AI action: ${String(action.name)}`);
  }
}

type WhatsAppAIAction =
  | {
      action: "SEARCH_PRODUCTS";
      input: {
        query: string;
        category?: string;
        maxPrice?: number;
      };
    }
  | {
      action: "GET_PRODUCT";
      input: {
        listingId: string;
      };
    }
  | {
      action: "ADD_TO_CART";
      input: {
        listingId: string;
        quantity: number;
      };
    }
  | {
      action: "CREATE_ORDER";
      input: {
        items: unknown[];
        paymentOption?: string;
      };
    }
  | {
      action: "GET_ORDER_STATUS";
      input: {
        orderId?: string;
        trackingNumber?: string;
      };
    }
  | {
      action: "BOOK_SERVICE";
      input: {
        listingId: string;
        date: string;
        timeSlot?: string;
      };
    }
  | {
      action: "GET_SERVICE_AVAILABILITY";
      input: {
        listingId: string;
        date?: string;
      };
    }
  | {
      action: "HUMAN_HANDOFF";
      input: {
        reason: string;
      };
    };
