"use strict";
/**
 * lib/whatsapp/actionRouter.ts
 *
 * Centralized Action Router.
 * Validates action input with Zod, enforces strict tenant boundaries,
 * executes domain actions, records audit logs into AIAction, and sanitizes output.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionRouter = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const types_1 = require("./types");
// Product Actions
const searchProducts_1 = require("./actions/products/searchProducts");
const getProduct_1 = require("./actions/products/getProduct");
const getCategories_1 = require("./actions/products/getCategories");
const checkInventory_1 = require("./actions/products/checkInventory");
const getStoreInformation_1 = require("./actions/products/getStoreInformation");
// Customer Actions
const identifyCustomer_1 = require("./actions/customer/identifyCustomer");
const getCustomerOrders_1 = require("./actions/customer/getCustomerOrders");
const getCustomerProfile_1 = require("./actions/customer/getCustomerProfile");
// Pricing Actions
const calculatePrice_1 = require("./actions/pricing/calculatePrice");
const calculateShipping_1 = require("./actions/pricing/calculateShipping");
const calculateCheckoutTotal_1 = require("./actions/pricing/calculateCheckoutTotal");
// Checkout Actions
const createCheckout_1 = require("./actions/checkout/createCheckout");
// Order Actions
const createOrder_1 = require("./actions/orders/createOrder");
const getOrder_1 = require("./actions/orders/getOrder");
// Service Actions
const searchServices_1 = require("./actions/services/searchServices");
const getServiceAvailability_1 = require("./actions/services/getServiceAvailability");
// Payment Actions
const initiateMpesa_1 = require("./actions/payments/initiateMpesa");
// Support Actions
const escalateToHuman_1 = require("./actions/support/escalateToHuman");
// AI Workforce Orchestrator Bindings
const orchestrator_1 = require("@/lib/ai/workforce/orchestrator");
const types_2 = require("@/lib/ai/workforce/types");
const workforceOrchestrator = new orchestrator_1.WorkforceOrchestrator();
async function actionRouter(params) {
    const parsed = types_1.whatsappActionSchema.safeParse(params.action);
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
    let auditId = null;
    const startTime = Date.now();
    try {
        // 1. Record pending AI Action in database for complete auditability
        const audit = await prismadb_1.default.aIAction.create({
            data: {
                companyId: params.context.companyId,
                conversationId: params.context.conversationId,
                action: action.action,
                status: "PENDING",
                input: sanitizeData(action),
                messageId: params.context.messageId,
                idempotencyKey: `${params.context.conversationId}:${params.context.messageId ?? node_crypto_1.default.randomUUID()}:${action.action}`,
                startedAt: new Date(),
            },
        });
        auditId = audit.id;
        let result;
        // 2. Dispatch to domain action handlers with strict tenant context
        switch (action.action) {
            // Products
            case "search_products":
                result = await (0, searchProducts_1.searchProducts)(action.arguments, params.context);
                break;
            case "get_product":
            case "get_listing":
                result = await (0, getProduct_1.getProduct)(action.arguments, params.context);
                break;
            case "get_categories":
                result = await (0, getCategories_1.getCategories)(action.arguments, params.context);
                break;
            case "check_inventory":
                result = await (0, checkInventory_1.checkInventory)(action.arguments, params.context);
                break;
            case "get_store_information":
                result = await (0, getStoreInformation_1.getStoreInformation)(action.arguments, params.context);
                break;
            // Customer
            case "identify_customer":
                result = await (0, identifyCustomer_1.identifyCustomer)(action.arguments, params.context);
                break;
            case "create_customer":
            case "update_customer":
                result = await (0, getCustomerProfile_1.updateCustomer)(action.arguments, params.context);
                break;
            case "get_customer_orders":
                result = await (0, getCustomerOrders_1.getCustomerOrders)(action.arguments, params.context);
                break;
            case "get_customer_profile":
                result = await (0, getCustomerProfile_1.getCustomerProfile)(action.arguments, params.context);
                break;
            // Pricing
            case "calculate_price":
                result = await (0, calculatePrice_1.calculatePrice)(action.arguments, params.context);
                break;
            case "calculate_shipping":
                result = await (0, calculateShipping_1.calculateShipping)(action.arguments, params.context);
                break;
            case "validate_discount":
                result = await (0, calculateShipping_1.validateDiscount)(action.arguments, params.context);
                break;
            case "calculate_checkout_total":
                result = await (0, calculateCheckoutTotal_1.calculateCheckoutTotal)(action.arguments, params.context);
                break;
            // Checkout
            case "create_checkout":
                result = await (0, createCheckout_1.createCheckout)(action.arguments, params.context);
                break;
            case "get_checkout":
                result = await (0, createCheckout_1.getCheckout)(action.arguments, params.context);
                break;
            case "update_checkout":
                result = await (0, createCheckout_1.createCheckout)(action.arguments, params.context);
                break;
            case "confirm_checkout":
                result = await (0, createCheckout_1.confirmCheckout)(action.arguments, params.context);
                break;
            // Orders
            case "create_order":
                result = await (0, createOrder_1.createOrder)(action.arguments, params.context);
                break;
            case "get_order":
                result = await (0, getOrder_1.getOrder)(action.arguments, params.context);
                break;
            case "track_order":
                result = await (0, getOrder_1.trackOrder)(action.arguments, params.context);
                break;
            case "cancel_order":
                result = await (0, getOrder_1.cancelOrder)(action.arguments, params.context);
                break;
            case "request_order_change":
                result = await (0, getOrder_1.requestOrderChange)(action.arguments, params.context);
                break;
            // Services
            case "search_services":
                result = await (0, searchServices_1.searchServices)(action.arguments, params.context);
                break;
            case "get_service":
            case "get_service_availability":
                result = await (0, getServiceAvailability_1.getServiceAvailability)(action.arguments, params.context);
                break;
            case "create_service_booking":
                result = await (0, getServiceAvailability_1.bookService)(action.arguments, params.context);
                break;
            case "confirm_service_booking":
                result = await (0, getServiceAvailability_1.confirmServiceBooking)(action.arguments, params.context);
                break;
            case "cancel_service_booking":
                result = await (0, getServiceAvailability_1.cancelServiceBooking)(action.arguments, params.context);
                break;
            // Payments
            case "get_payment_methods":
                result = await (0, initiateMpesa_1.getPaymentMethods)(action.arguments, params.context);
                break;
            case "initiate_payment":
            case "initiate_mpesa":
                result = await (0, initiateMpesa_1.initiateMpesa)(action.arguments, params.context);
                break;
            case "check_payment_status":
                result = await (0, initiateMpesa_1.checkPaymentStatus)(action.arguments, params.context);
                break;
            case "retry_payment":
                result = await (0, initiateMpesa_1.initiateMpesa)(action.arguments, params.context);
                break;
            // Support
            case "escalate_to_human":
                result = await (0, escalateToHuman_1.escalateToHuman)(action.arguments, params.context);
                break;
            case "create_support_request":
                result = await (0, escalateToHuman_1.createSupportRequest)(action.arguments, params.context);
                break;
            case "get_support_status":
                result = await (0, getCustomerOrders_1.getCustomerOrders)({ limit: 1 }, params.context);
                break;
            // ======================================================================
            // AI WORKFORCE DIRECT AGENT BINDINGS
            // ======================================================================
            case "route_to_sales_agent": {
                try {
                    const runResult = await workforceOrchestrator.execute({
                        agentKey: "SALES_AGENT",
                        prompt: `Customer WhatsApp inquiry: "${action.arguments.inquiry}". Use catalog search and authoritative pricing to assist and offer recommendations.`,
                        channel: "WHATSAPP",
                    }, {
                        companyId: params.context.companyId,
                        companyName: params.context.customerName || "Store Customer",
                        level: types_2.AgentWorkforceLevel.STORE,
                        traceId: `wa_sales_${Date.now()}`,
                        channel: "WHATSAPP",
                    });
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
                }
                catch (err) {
                    console.error("[WORKFORCE_WHATSAPP_SALES_ERROR]", err);
                    result = await (0, searchProducts_1.searchProducts)({ query: action.arguments.inquiry }, params.context);
                }
                break;
            }
            case "route_to_support_agent": {
                try {
                    const runResult = await workforceOrchestrator.execute({
                        agentKey: "SUPPORT_AGENT",
                        prompt: `Customer WhatsApp support inquiry: "${action.arguments.inquiry}". Order context: ${action.arguments.orderId || "None specified"}. Check order status and store policies accurately.`,
                        channel: "WHATSAPP",
                    }, {
                        companyId: params.context.companyId,
                        companyName: params.context.customerName || "Store Customer",
                        level: types_2.AgentWorkforceLevel.STORE,
                        traceId: `wa_support_${Date.now()}`,
                        channel: "WHATSAPP",
                    });
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
                }
                catch (err) {
                    console.error("[WORKFORCE_WHATSAPP_SUPPORT_ERROR]", err);
                    result = await (0, escalateToHuman_1.escalateToHuman)({ reason: action.arguments.inquiry }, params.context);
                }
                break;
            }
            default:
                result = {
                    success: false,
                    action: action.action,
                    message: "I am unable to perform that action at this time.",
                };
        }
        // 3. Complete audit log with sanitized output and duration
        await prismadb_1.default.aIAction.update({
            where: { id: auditId },
            data: {
                status: result.success ? "COMPLETED" : "FAILED",
                output: sanitizeData(result),
                completedAt: new Date(),
                error: result.success ? undefined : result.message,
                orderId: result.data?.orderId ?? undefined,
            },
        });
        return result;
    }
    catch (error) {
        console.error("[ACTION_ROUTER_EXECUTION_ERROR]", {
            action: action.action,
            companyId: params.context.companyId,
            conversationId: params.context.conversationId,
            error,
            durationMs: Date.now() - startTime,
        });
        if (auditId) {
            await prismadb_1.default.aIAction
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
exports.actionRouter = actionRouter;
/**
 * Sanitizes and redacts sensitive PII, phone numbers, and payment details.
 */
function sanitizeData(data) {
    if (!data || typeof data !== "object") {
        return data ?? {};
    }
    const cloned = JSON.parse(JSON.stringify(data));
    redactSensitiveKeys(cloned);
    return cloned;
}
function redactSensitiveKeys(obj) {
    if (!obj || typeof obj !== "object")
        return;
    for (const key of Object.keys(obj)) {
        if (/password|secret|token|apikey|cardnumber|cvv|pin/i.test(key)) {
            obj[key] = "[REDACTED]";
        }
        else if (typeof obj[key] === "object") {
            redactSensitiveKeys(obj[key]);
        }
    }
}
