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
import {
  whatsappActionSchema,
  type WhatsAppAction,
  type WhatsAppActionContext,
  type WhatsAppActionResult,
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

// AI Workforce Orchestrator Bindings
import { WorkforceOrchestrator } from "@/lib/ai/workforce/orchestrator";
import { AgentWorkforceLevel } from "@/lib/ai/workforce/types";

const workforceOrchestrator = new WorkforceOrchestrator();

export async function actionRouter(params: {
  action: unknown;
  context: WhatsAppActionContext;
}): Promise<WhatsAppActionResult> {
  const parsed = whatsappActionSchema.safeParse(params.action);

  if (!parsed.success) {
    console.warn("[ACTION_ROUTER_VALIDATION_FAILED]", parsed.error.format());
    return {
      success: false,
      action: "escalate_to_human",
      message: "I didn't quite catch that. Would you like me to connect you with our support team?",
      shouldRespond: true,
      shouldEscalate: false,
    };
  }

  const action = parsed.data;
  let auditId: string | null = null;
  const startTime = Date.now();

  try {
    // 1. Record pending AI Action in database for complete auditability
    const audit = await prisma.aIAction.create({
      data: {
        companyId: params.context.companyId,
        conversationId: params.context.conversationId,
        action: action.action,
        status: "PENDING",
        input: sanitizeData(action),
        messageId: params.context.messageId,
        idempotencyKey: `${params.context.conversationId}:${params.context.messageId ?? crypto.randomUUID()}:${action.action}`,
        startedAt: new Date(),
      },
    });

    auditId = audit.id;
    let result: WhatsAppActionResult;

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
        result = await validateDiscount(action.arguments as any, params.context);
        break;
      case "calculate_checkout_total":
        result = await calculateCheckoutTotal(action.arguments as any, params.context);
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
        result = await createOrder(action.arguments as any, params.context);
        break;
      case "get_order":
        result = await getOrder(action.arguments, params.context);
        break;
      case "track_order":
        result = await trackOrder(action.arguments, params.context);
        break;
      case "cancel_order":
        result = await cancelOrder(action.arguments as any, params.context);
        break;
      case "request_order_change":
        result = await requestOrderChange(action.arguments as any, params.context);
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
        result = await bookService(action.arguments as any, params.context);
        break;
      case "confirm_service_booking":
        result = await confirmServiceBooking(action.arguments as any, params.context);
        break;
      case "cancel_service_booking":
        result = await cancelServiceBooking(action.arguments as any, params.context);
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
        result = await createSupportRequest(action.arguments as any, params.context);
        break;
      case "get_support_status":
        result = await getCustomerOrders({ limit: 1 }, params.context);
        break;

      // ======================================================================
      // AI WORKFORCE DIRECT AGENT BINDINGS
      // ======================================================================
      case "route_to_sales_agent": {
        try {
          const runResult = await workforceOrchestrator.execute(
            {
              agentKey: "SALES_AGENT",
              prompt: `Customer WhatsApp inquiry: "${(action.arguments as any).inquiry}". Use catalog search and authoritative pricing to assist and offer recommendations.`,
              channel: "WHATSAPP",
            },
            {
              companyId: params.context.companyId,
              companyName: params.context.customerName || "Store Customer",
              level: AgentWorkforceLevel.STORE,
              traceId: `wa_sales_${Date.now()}`,
              channel: "WHATSAPP",
            },
          );

          result = {
            success: true,
            action: "route_to_sales_agent",
            message: runResult.reply,
            shouldRespond: true,
            data: {
              creditsUsed: runResult.creditsUsed,
              steps: runResult.stepsExecuted,
            },
          };
        } catch (err: any) {
          console.error("[WORKFORCE_WHATSAPP_SALES_ERROR]", err);
          result = await searchProducts({ query: (action.arguments as any).inquiry }, params.context);
        }
        break;
      }

      case "route_to_support_agent": {
        try {
          const runResult = await workforceOrchestrator.execute(
            {
              agentKey: "SUPPORT_AGENT",
              prompt: `Customer WhatsApp support inquiry: "${(action.arguments as any).inquiry}". Order context: ${(action.arguments as any).orderId || "None specified"}. Check order status and store policies accurately.`,
              channel: "WHATSAPP",
            },
            {
              companyId: params.context.companyId,
              companyName: params.context.customerName || "Store Customer",
              level: AgentWorkforceLevel.STORE,
              traceId: `wa_support_${Date.now()}`,
              channel: "WHATSAPP",
            },
          );

          result = {
            success: true,
            action: "route_to_support_agent",
            message: runResult.reply,
            shouldRespond: true,
            data: {
              creditsUsed: runResult.creditsUsed,
              steps: runResult.stepsExecuted,
            },
          };
        } catch (err: any) {
          console.error("[WORKFORCE_WHATSAPP_SUPPORT_ERROR]", err);
          result = await escalateToHuman({ reason: (action.arguments as any).inquiry }, params.context);
        }
        break;
      }

      default:
        result = {
          success: false,
          action: (action as any).action,
          message: "I am unable to perform that action at this time.",
        };
    }

    // 3. Complete audit log with sanitized output and duration
    await prisma.aIAction.update({
      where: { id: auditId },
      data: {
        status: result.success ? "COMPLETED" : "FAILED",
        output: sanitizeData(result),
        completedAt: new Date(),
        error: result.success ? undefined : result.message,
        orderId: (result.data?.orderId as string) ?? undefined,
      },
    });

    return result;
  } catch (error) {
    console.error("[ACTION_ROUTER_EXECUTION_ERROR]", {
      action: action.action,
      companyId: params.context.companyId,
      conversationId: params.context.conversationId,
      error,
      durationMs: Date.now() - startTime,
    });

    if (auditId) {
      await prisma.aIAction
        .update({
          where: { id: auditId },
          data: {
            status: "FAILED",
            error: error instanceof Error ? error.message : "Internal action execution error.",
            completedAt: new Date(),
          },
        })
        .catch(() => undefined);
    }

    return {
      success: false,
      action: action.action,
      message: "I encountered an error processing your request. Please try again shortly.",
    };
  }
}

/**
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
}
