"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappActionSchema = exports.calculateCheckoutActionSchema = exports.getOrderStatusActionSchema = exports.routeToSupportAgentActionSchema = exports.routeToSalesAgentActionSchema = exports.getSupportStatusActionSchema = exports.createSupportRequestActionSchema = exports.escalateToHumanActionSchema = exports.retryPaymentActionSchema = exports.checkPaymentStatusActionSchema = exports.initiateMpesaActionSchema = exports.initiatePaymentActionSchema = exports.getPaymentMethodsActionSchema = exports.cancelServiceBookingActionSchema = exports.confirmServiceBookingActionSchema = exports.createServiceBookingActionSchema = exports.getServiceAvailabilityActionSchema = exports.getServiceActionSchema = exports.searchServicesActionSchema = exports.requestOrderChangeActionSchema = exports.cancelOrderActionSchema = exports.trackOrderActionSchema = exports.getOrderActionSchema = exports.createOrderActionSchema = exports.confirmCheckoutActionSchema = exports.updateCheckoutActionSchema = exports.getCheckoutActionSchema = exports.createCheckoutActionSchema = exports.calculateCheckoutTotalActionSchema = exports.validateDiscountActionSchema = exports.calculateShippingActionSchema = exports.calculatePriceActionSchema = exports.getCustomerProfileActionSchema = exports.getCustomerOrdersActionSchema = exports.updateCustomerActionSchema = exports.createCustomerActionSchema = exports.identifyCustomerActionSchema = exports.checkInventoryActionSchema = exports.getStoreInformationActionSchema = exports.getCategoriesActionSchema = exports.getListingActionSchema = exports.getProductActionSchema = exports.searchProductsActionSchema = exports.paymentOptionEnum = exports.cartItemInputSchema = exports.pricingOptionSchema = void 0;
const zod_1 = require("zod");
/**
 * ============================================================
 * AI ACTION SCHEMAS (STRONGLY TYPED WITH ZOD)
 * ============================================================
 */
// Shared option schema for product options/variants
exports.pricingOptionSchema = zod_1.z.object({
    category: zod_1.z.string(),
    name: zod_1.z.string(),
    extraPrice: zod_1.z.number().nonnegative().optional().default(0),
});
exports.cartItemInputSchema = zod_1.z.object({
    marketplaceListingId: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().positive().default(1),
    selectedOptions: zod_1.z.array(exports.pricingOptionSchema).optional().default([]),
    date: zod_1.z.string().nullable().optional(),
    timeSlot: zod_1.z.string().nullable().optional(),
    serviceNotes: zod_1.z.string().nullable().optional(),
});
exports.paymentOptionEnum = zod_1.z.enum([
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
]);
// 1. PRODUCT ACTIONS
exports.searchProductsActionSchema = zod_1.z.object({
    action: zod_1.z.literal("search_products"),
    arguments: zod_1.z.object({
        query: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        brand: zod_1.z.string().optional(),
        minPrice: zod_1.z.number().nonnegative().optional(),
        maxPrice: zod_1.z.number().positive().optional(),
        inStockOnly: zod_1.z.boolean().optional().default(true),
        limit: zod_1.z.number().int().positive().max(20).default(5),
    }),
});
exports.getProductActionSchema = zod_1.z.object({
    action: zod_1.z.literal("get_product"),
    arguments: zod_1.z.object({
        productId: zod_1.z.string().optional(),
        listingId: zod_1.z.string().optional(),
        slug: zod_1.z.string().optional(),
    }),
});
exports.getListingActionSchema = zod_1.z.object({
    action: zod_1.z.literal("get_listing"),
    arguments: zod_1.z.object({
        listingId: zod_1.z.string(),
    }),
});
exports.getCategoriesActionSchema = zod_1.z.object({
    action: zod_1.z.literal("get_categories"),
    arguments: zod_1.z.object({
        limit: zod_1.z.number().int().positive().max(50).default(10),
    }),
});
exports.getStoreInformationActionSchema = zod_1.z.object({
    action: zod_1.z.literal("get_store_information"),
    arguments: zod_1.z.object({
        topic: zod_1.z
            .enum([
            "general",
            "hours",
            "location",
            "policies",
            "contact",
            "payment_methods",
        ])
            .optional()
            .default("general"),
    }),
});
exports.checkInventoryActionSchema = zod_1.z.object({
    action: zod_1.z.literal("check_inventory"),
    arguments: zod_1.z.object({
        listingId: zod_1.z.string(),
        quantity: zod_1.z.number().int().positive().default(1),
    }),
});
// 2. CUSTOMER ACTIONS
exports.identifyCustomerActionSchema = zod_1.z.object({
    action: zod_1.z.literal("identify_customer"),
    arguments: zod_1.z.object({
        phone: zod_1.z.string().optional(),
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
    }),
});
exports.createCustomerActionSchema = zod_1.z.object({
    action: zod_1.z.literal("create_customer"),
    arguments: zod_1.z.object({
        name: zod_1.z.string().min(1),
        phone: zod_1.z.string().min(9),
        email: zod_1.z.string().email().optional(),
    }),
});
exports.updateCustomerActionSchema = zod_1.z.object({
    action: zod_1.z.literal("update_customer"),
    arguments: zod_1.z.object({
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        deliveryAddress: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    }),
});
exports.getCustomerOrdersActionSchema = zod_1.z.object({
    action: zod_1.z.literal("get_customer_orders"),
    arguments: zod_1.z.object({
        limit: zod_1.z.number().int().positive().max(10).default(3),
    }),
});
exports.getCustomerProfileActionSchema = zod_1.z.object({
    action: zod_1.z.literal("get_customer_profile"),
    arguments: zod_1.z.object({}),
});
// 3. PRICING ACTIONS
exports.calculatePriceActionSchema = zod_1.z.object({
    action: zod_1.z.literal("calculate_price"),
    arguments: zod_1.z.object({
        items: zod_1.z.array(exports.cartItemInputSchema).min(1),
        promoCode: zod_1.z.string().optional(),
        shippingMethod: zod_1.z.string().optional(),
    }),
});
exports.calculateShippingActionSchema = zod_1.z.object({
    action: zod_1.z.literal("calculate_shipping"),
    arguments: zod_1.z.object({
        shippingAddress: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
        shippingMethod: zod_1.z.string().optional(),
    }),
});
exports.validateDiscountActionSchema = zod_1.z.object({
    action: zod_1.z.literal("validate_discount"),
    arguments: zod_1.z.object({
        promoCode: zod_1.z.string().min(1),
        subtotal: zod_1.z.number().nonnegative().optional(),
    }),
});
exports.calculateCheckoutTotalActionSchema = zod_1.z.object({
    action: zod_1.z.literal("calculate_checkout_total"),
    arguments: zod_1.z.object({
        items: zod_1.z.array(exports.cartItemInputSchema).min(1),
        shippingAddress: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
        shippingMethod: zod_1.z.string().optional(),
        promoCode: zod_1.z.string().optional(),
        paymentOption: exports.paymentOptionEnum.default("cod"),
    }),
});
// 4. CHECKOUT ACTIONS
exports.createCheckoutActionSchema = zod_1.z.object({
    action: zod_1.z.literal("create_checkout"),
    arguments: zod_1.z.object({
        items: zod_1.z.array(exports.cartItemInputSchema).min(1),
        shippingAddress: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
        shippingMethod: zod_1.z.string().optional(),
        promoCode: zod_1.z.string().optional(),
        paymentOption: exports.paymentOptionEnum.default("cod"),
    }),
});
exports.getCheckoutActionSchema = zod_1.z.object({
    action: zod_1.z.literal("get_checkout"),
    arguments: zod_1.z.object({}),
});
exports.updateCheckoutActionSchema = zod_1.z.object({
    action: zod_1.z.literal("update_checkout"),
    arguments: zod_1.z.object({
        items: zod_1.z.array(exports.cartItemInputSchema).optional(),
        shippingAddress: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
        shippingMethod: zod_1.z.string().optional(),
        promoCode: zod_1.z.string().optional(),
        paymentOption: exports.paymentOptionEnum.optional(),
    }),
});
exports.confirmCheckoutActionSchema = zod_1.z.object({
    action: zod_1.z.literal("confirm_checkout"),
    arguments: zod_1.z.object({
        confirm: zod_1.z.boolean().default(true),
    }),
});
// 5. ORDERS ACTIONS
exports.createOrderActionSchema = zod_1.z.object({
    action: zod_1.z.literal("create_order"),
    arguments: zod_1.z.object({
        confirmation: zod_1.z.literal(true),
        items: zod_1.z.array(exports.cartItemInputSchema).min(1),
        paymentOption: exports.paymentOptionEnum.default("cod"),
        shippingAddress: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
        shippingMethod: zod_1.z.string().optional(),
        promoCode: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        mpesaPhone: zod_1.z.string().optional(),
        customerName: zod_1.z.string().optional(),
        customerEmail: zod_1.z.string().email().optional(),
    }),
});
exports.getOrderActionSchema = zod_1.z.object({
    action: zod_1.z.literal("get_order"),
    arguments: zod_1.z.object({
        orderId: zod_1.z.string().optional(),
        trackingNumber: zod_1.z.string().optional(),
    }),
});
exports.trackOrderActionSchema = zod_1.z.object({
    action: zod_1.z.literal("track_order"),
    arguments: zod_1.z.object({
        orderId: zod_1.z.string().optional(),
        trackingNumber: zod_1.z.string().optional(),
    }),
});
exports.cancelOrderActionSchema = zod_1.z.object({
    action: zod_1.z.literal("cancel_order"),
    arguments: zod_1.z.object({
        orderId: zod_1.z.string(),
        reason: zod_1.z.string().min(1),
    }),
});
exports.requestOrderChangeActionSchema = zod_1.z.object({
    action: zod_1.z.literal("request_order_change"),
    arguments: zod_1.z.object({
        orderId: zod_1.z.string(),
        changeDescription: zod_1.z.string().min(1),
    }),
});
// 6. SERVICES ACTIONS
exports.searchServicesActionSchema = zod_1.z.object({
    action: zod_1.z.literal("search_services"),
    arguments: zod_1.z.object({
        query: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        limit: zod_1.z.number().int().positive().max(20).default(5),
    }),
});
exports.getServiceActionSchema = zod_1.z.object({
    action: zod_1.z.literal("get_service"),
    arguments: zod_1.z.object({
        serviceId: zod_1.z.string(),
    }),
});
exports.getServiceAvailabilityActionSchema = zod_1.z.object({
    action: zod_1.z.literal("get_service_availability"),
    arguments: zod_1.z.object({
        serviceId: zod_1.z.string().optional(),
        listingId: zod_1.z.string().optional(),
        date: zod_1.z.string().optional(), // YYYY-MM-DD
    }),
});
exports.createServiceBookingActionSchema = zod_1.z.object({
    action: zod_1.z.literal("create_service_booking"),
    arguments: zod_1.z.object({
        serviceId: zod_1.z.string().optional(),
        listingId: zod_1.z.string().optional(),
        date: zod_1.z.string(),
        timeSlot: zod_1.z.string(),
        notes: zod_1.z.string().optional(),
    }),
});
exports.confirmServiceBookingActionSchema = zod_1.z.object({
    action: zod_1.z.literal("confirm_service_booking"),
    arguments: zod_1.z.object({
        appointmentId: zod_1.z.string(),
        confirmation: zod_1.z.literal(true),
    }),
});
exports.cancelServiceBookingActionSchema = zod_1.z.object({
    action: zod_1.z.literal("cancel_service_booking"),
    arguments: zod_1.z.object({
        appointmentId: zod_1.z.string(),
        reason: zod_1.z.string().min(1),
    }),
});
// 7. PAYMENTS ACTIONS
exports.getPaymentMethodsActionSchema = zod_1.z.object({
    action: zod_1.z.literal("get_payment_methods"),
    arguments: zod_1.z.object({}),
});
exports.initiatePaymentActionSchema = zod_1.z.object({
    action: zod_1.z.literal("initiate_payment"),
    arguments: zod_1.z.object({
        orderId: zod_1.z.string(),
        paymentMethod: exports.paymentOptionEnum,
        paymentDetails: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    }),
});
exports.initiateMpesaActionSchema = zod_1.z.object({
    action: zod_1.z.literal("initiate_mpesa"),
    arguments: zod_1.z.object({
        orderId: zod_1.z.string(),
        phone: zod_1.z.string().optional(),
    }),
});
exports.checkPaymentStatusActionSchema = zod_1.z.object({
    action: zod_1.z.literal("check_payment_status"),
    arguments: zod_1.z.object({
        orderId: zod_1.z.string().optional(),
        paymentReference: zod_1.z.string().optional(),
    }),
});
exports.retryPaymentActionSchema = zod_1.z.object({
    action: zod_1.z.literal("retry_payment"),
    arguments: zod_1.z.object({
        orderId: zod_1.z.string(),
        paymentMethod: exports.paymentOptionEnum.optional(),
        phone: zod_1.z.string().optional(),
    }),
});
// 8. CUSTOMER SUPPORT ACTIONS
exports.escalateToHumanActionSchema = zod_1.z.object({
    action: zod_1.z.literal("escalate_to_human"),
    arguments: zod_1.z.object({
        reason: zod_1.z.string().min(1),
    }),
});
exports.createSupportRequestActionSchema = zod_1.z.object({
    action: zod_1.z.literal("create_support_request"),
    arguments: zod_1.z.object({
        subject: zod_1.z.string().min(1),
        description: zod_1.z.string().min(1),
        priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
    }),
});
exports.getSupportStatusActionSchema = zod_1.z.object({
    action: zod_1.z.literal("get_support_status"),
    arguments: zod_1.z.object({}),
});
exports.routeToSalesAgentActionSchema = zod_1.z.object({
    action: zod_1.z.literal("route_to_sales_agent"),
    arguments: zod_1.z.object({
        inquiry: zod_1.z.string().min(1),
        category: zod_1.z.string().optional(),
    }),
});
exports.routeToSupportAgentActionSchema = zod_1.z.object({
    action: zod_1.z.literal("route_to_support_agent"),
    arguments: zod_1.z.object({
        inquiry: zod_1.z.string().min(1),
        orderId: zod_1.z.string().optional(),
    }),
});
// Backward-compatible alias
exports.getOrderStatusActionSchema = exports.trackOrderActionSchema;
exports.calculateCheckoutActionSchema = exports.calculateCheckoutTotalActionSchema;
/**
 * ============================================================
 * COMPLETE DISCRIMINATED UNION OF ALL ACTIONS
 * ============================================================
 */
exports.whatsappActionSchema = zod_1.z.discriminatedUnion("action", [
    // Products
    exports.searchProductsActionSchema,
    exports.getProductActionSchema,
    exports.getListingActionSchema,
    exports.getCategoriesActionSchema,
    exports.getStoreInformationActionSchema,
    exports.checkInventoryActionSchema,
    // Customer
    exports.identifyCustomerActionSchema,
    exports.createCustomerActionSchema,
    exports.updateCustomerActionSchema,
    exports.getCustomerOrdersActionSchema,
    exports.getCustomerProfileActionSchema,
    // Pricing
    exports.calculatePriceActionSchema,
    exports.calculateShippingActionSchema,
    exports.validateDiscountActionSchema,
    exports.calculateCheckoutTotalActionSchema,
    // Checkout
    exports.createCheckoutActionSchema,
    exports.getCheckoutActionSchema,
    exports.updateCheckoutActionSchema,
    exports.confirmCheckoutActionSchema,
    // Orders
    exports.createOrderActionSchema,
    exports.getOrderActionSchema,
    exports.trackOrderActionSchema,
    exports.cancelOrderActionSchema,
    exports.requestOrderChangeActionSchema,
    // Services
    exports.searchServicesActionSchema,
    exports.getServiceActionSchema,
    exports.getServiceAvailabilityActionSchema,
    exports.createServiceBookingActionSchema,
    exports.confirmServiceBookingActionSchema,
    exports.cancelServiceBookingActionSchema,
    // Payments
    exports.getPaymentMethodsActionSchema,
    exports.initiatePaymentActionSchema,
    exports.initiateMpesaActionSchema,
    exports.checkPaymentStatusActionSchema,
    exports.retryPaymentActionSchema,
    // Support
    exports.escalateToHumanActionSchema,
    exports.createSupportRequestActionSchema,
    exports.getSupportStatusActionSchema,
    // AI Workforce Direct Bindings
    exports.routeToSalesAgentActionSchema,
    exports.routeToSupportAgentActionSchema,
]);
