"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizedOrderSchema = exports.orderItemSchema = exports.paymentOptionSchema = exports.unifiedOrderSchema = exports.unifiedOrderItemSchema = exports.selectedOptionSchema = void 0;
const zod_1 = require("zod");
exports.selectedOptionSchema = zod_1.z.object({
    category: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    extraPrice: zod_1.z.number().nonnegative().optional(),
});
exports.unifiedOrderItemSchema = zod_1.z.object({
    marketplaceListingId: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().positive(),
    price: zod_1.z.number().positive().optional(),
    totalPrice: zod_1.z.number().positive().optional(),
    date: zod_1.z.string().nullable().optional(),
    timeSlot: zod_1.z.string().nullable().optional(),
    serviceNotes: zod_1.z.string().nullable().optional(),
    course: zod_1.z.string().nullable().optional(),
    kitchenStatus: zod_1.z.string().nullable().optional(),
    selectedOptions: zod_1.z.array(exports.selectedOptionSchema).optional(),
    appointmentId: zod_1.z.string().optional(),
    productId: zod_1.z.string().optional(),
});
exports.unifiedOrderSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).default("Walk-in Customer"),
    email: zod_1.z.string().optional().default("walkin@pos.local"),
    phone: zod_1.z.string().optional().default("N/A"),
    mpesaPhone: zod_1.z.string().optional(),
    consumerId: zod_1.z.string().optional(),
    companyId: zod_1.z.string().optional(),
    orderType: zod_1.z
        .enum(["PRODUCT", "SERVICE", "RENTAL", "BOOKING", "OTHER"])
        .default("PRODUCT"),
    source: zod_1.z
        .enum(["WEBSITE", "IN_PERSON", "MOBILE", "WHATSAPP", "AI", "POS"])
        .default("WEBSITE"),
    paymentOption: zod_1.z
        .enum([
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
    ])
        .default("cod"),
    items: zod_1.z.array(exports.unifiedOrderItemSchema).min(1),
    shippingAddress: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    shippingMethod: zod_1.z.string().optional(),
    promoCode: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    trackingNumber: zod_1.z.string().optional(),
    idempotencyKey: zod_1.z.string().optional(),
    customerPin: zod_1.z.string().optional(),
    terminalId: zod_1.z.string().optional(),
    cashierName: zod_1.z.string().optional(),
    posSessionId: zod_1.z.string().optional(),
    operatorId: zod_1.z.string().optional(),
    tableId: zod_1.z.string().optional(),
    tableSessionId: zod_1.z.string().optional(),
    tableNumber: zod_1.z.string().optional(),
    guestCount: zod_1.z.number().int().optional(),
    serviceMode: zod_1.z.string().optional(),
    kitchenStatus: zod_1.z.string().optional(),
    isHeld: zod_1.z.boolean().optional(),
    heldNote: zod_1.z.string().optional(),
    isWalkIn: zod_1.z.boolean().optional(),
    customerType: zod_1.z.string().optional(),
    channel: zod_1.z.enum(["WEBSITE", "MOBILE", "WHATSAPP", "FACEBOOK", "INSTAGRAM", "POS", "API", "AI"]).optional(),
    actorType: zod_1.z.enum(["CUSTOMER", "USER", "STAFF", "AI", "SYSTEM"]).optional(),
    paymentData: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
exports.paymentOptionSchema = zod_1.z.enum([
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
exports.orderItemSchema = zod_1.z.object({
    marketplaceListingId: zod_1.z.string().min(1),
    date: zod_1.z.string().nullable().optional(),
    timeSlot: zod_1.z.string().nullable().optional(),
    quantity: zod_1.z.number().int().positive(),
    price: zod_1.z.number().positive(),
    totalPrice: zod_1.z.number().positive(),
    selectedOptions: zod_1.z.array(exports.selectedOptionSchema).optional(),
    serviceNotes: zod_1.z.string().nullable().optional(),
    productId: zod_1.z.string().nullable().optional(),
});
exports.normalizedOrderSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1).nullable().optional(),
    consumerId: zod_1.z.string().min(1).nullable().optional(),
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().email("Invalid email"),
    phone: zod_1.z.string().min(1, "Phone is required"),
    mpesaPhone: zod_1.z.string().nullable().optional(),
    paymentOption: exports.paymentOptionSchema.default("cod"),
    items: zod_1.z
        .array(exports.orderItemSchema)
        .min(1, "Order must contain at least one item"),
    totalPrice: zod_1.z.number().positive(),
    totalFinalPrice: zod_1.z.number().positive().optional(),
    shippingAddress: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).nullable().optional(),
    shippingMethod: zod_1.z.string().nullable().optional(),
    paymentData: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).nullable().optional(),
    trackingNumber: zod_1.z.string().nullable().optional(),
    idempotencyKey: zod_1.z.string().uuid().nullable().optional(),
    orderSource: zod_1.z.enum(["WEBSITE", "MOBILE", "IN_PERSON", "WHATSAPP"]).default("WEBSITE"),
    isServiceOrder: zod_1.z.boolean().default(false),
});
