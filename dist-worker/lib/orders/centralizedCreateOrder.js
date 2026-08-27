"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = void 0;
const pricing_1 = require("@/lib/pricing");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */
function safeNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}
function generateTrackingNumber() {
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomPart = crypto_1.default.randomBytes(4).toString("hex").toUpperCase();
    return `TRK-${datePart}-${randomPart}`;
}
function normalizePhone(phone) {
    return phone.trim().replace(/[^\d+]/g, "");
}
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
function normalizeString(value) {
    if (!value)
        return undefined;
    const normalized = value.trim();
    return normalized.length ? normalized : undefined;
}
function resolveOrderSource(source) {
    switch (source?.toUpperCase()) {
        case "IN_PERSON":
            return client_1.OrderSource.IN_PERSON;
        case "MOBILE":
            return client_1.OrderSource.MOBILE;
        case "WHATSAPP":
        case "AI":
        case "WEBSITE":
        default:
            return client_1.OrderSource.WEBSITE;
    }
}
/* -------------------------------------------------------------------------- */
/* MAIN SERVICE                                                               */
/* -------------------------------------------------------------------------- */
async function createOrder(input) {
    // 1. Validation
    if (!input.name?.trim())
        throw new Error("Customer name is required.");
    if (!input.email?.trim())
        throw new Error("Customer email is required.");
    if (!input.phone?.trim())
        throw new Error("Customer phone number is required.");
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
    const paymentOption = normalizeString(input.paymentOption) ?? "cod";
    // 2. Idempotency Check
    if (input.idempotencyKey) {
        const existingOrder = await prismadb_1.default.customerOrder.findFirst({
            where: { idempotencyKey: input.idempotencyKey },
            include: { items: true },
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
                trackingNumber: existingOrder.trackingNumber ?? generateTrackingNumber(),
                payment: {
                    option: existingOrder.paymentOption ?? paymentOption,
                    status: existingOrder.paymentStatus,
                },
                orderType: input.orderType ?? "PRODUCT",
                alreadyExists: true,
                created: false,
            };
        }
    }
    // 3. Resolve Store Company ID (if missing)
    let resolvedCompanyId = companyId;
    if (!resolvedCompanyId) {
        const sampleListing = await prismadb_1.default.marketplaceListings.findUnique({
            where: { id: input.items[0].marketplaceListingId },
            select: { companyId: true },
        });
        if (sampleListing?.companyId) {
            resolvedCompanyId = sampleListing.companyId;
        }
    }
    if (!resolvedCompanyId) {
        throw new Error("Unable to resolve store company ID for this order.");
    }
    // 4. Calculate Pricing Authoritatively via calculateOrderPricing Engine
    const pricing = await (0, pricing_1.calculateOrderPricing)({
        companyId: resolvedCompanyId,
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
    // 5. Compute Order Defaults & Statuses
    const trackingNumber = normalizeString(input.trackingNumber) ?? generateTrackingNumber();
    const resolvedSource = resolveOrderSource(input.orderSource);
    let computedPaymentStatus = input.paymentStatus ?? client_1.PaymentStatus.PENDING;
    if (paymentOption === "cash" || paymentOption === "split") {
        computedPaymentStatus = client_1.PaymentStatus.COMPLETED;
    }
    let computedOrderStatus = input.orderStatus ?? client_1.OrderStatus.PENDING;
    if (computedPaymentStatus === client_1.PaymentStatus.COMPLETED) {
        computedOrderStatus = client_1.OrderStatus.PAID;
    }
    // 6. DB Transaction (Order Creation + Inventory Decrement)
    const order = await prismadb_1.default.$transaction(async (tx) => {
        const createdOrder = await tx.customerOrder.create({
            data: {
                consumerId: consumerId ?? undefined,
                companyId: resolvedCompanyId,
                name: input.name.trim(),
                email,
                phone,
                mpesaPhone,
                paymentOption,
                paymentMethod: paymentOption.toUpperCase(),
                paymentStatus: computedPaymentStatus,
                status: computedOrderStatus,
                orderSource: resolvedSource,
                trackingNumber,
                shippingAddress: input.shippingAddress ?? undefined,
                billingAddress: input.billingAddress ?? undefined,
                shippingMethod: input.shippingMethod ?? undefined,
                delivery: pricing.requiresDelivery || (input.delivery ?? false),
                deliveryStatus: input.deliveryStatus ??
                    (computedPaymentStatus === client_1.PaymentStatus.COMPLETED
                        ? "Processing"
                        : "Pending"),
                deliveryFee: input.deliveryFee ?? pricing.shipping,
                notes: input.notes ?? undefined,
                specialInstructions: input.specialInstructions ?? undefined,
                giftMessage: input.giftMessage ?? undefined,
                isGift: input.isGift ?? false,
                giftWrap: input.giftWrap ?? false,
                deliveryDate: input.deliveryDate ?? undefined,
                deliveryTimeSlot: input.deliveryTimeSlot ?? undefined,
                deliveryInstructions: input.deliveryInstructions ?? undefined,
                promoCode: input.promoCode ?? undefined,
                totalPrice: pricing.subtotal,
                totalDiscount: pricing.totalDiscount,
                totalTax: pricing.tax,
                totalShipping: pricing.shipping,
                totalFinalPrice: pricing.total,
                idempotencyKey: input.idempotencyKey ?? undefined,
                items: {
                    create: pricing.items.map((pItem) => {
                        const origItem = input.items.find((i) => i.marketplaceListingId === pItem.marketplaceListingId);
                        return {
                            marketplaceListingId: pItem.marketplaceListingId,
                            quantity: pItem.quantity,
                            price: pItem.unitPriceWithOptions,
                            totalPrice: pItem.total,
                            discount: pItem.discount,
                            tax: pItem.tax,
                            serviceNotes: origItem?.serviceNotes ?? undefined,
                            selectedOptions: pItem.selectedOptions ??
                                undefined,
                            date: origItem?.date ?? undefined,
                            timeSlot: origItem?.timeSlot ?? undefined,
                            riderId: origItem?.riderId ?? undefined,
                            ...(origItem?.productId
                                ? { productId: origItem.productId }
                                : {}),
                            ...(origItem?.appointmentId
                                ? { appointmentId: origItem.appointmentId }
                                : {}),
                        };
                    }),
                },
            },
            include: {
                items: true,
            },
        });
        // Stock Decrement Loop
        for (const pItem of pricing.items) {
            if (pItem.pricingMode === "PRODUCT") {
                await tx.marketplaceListings.update({
                    where: { id: pItem.marketplaceListingId },
                    data: {
                        quantity: {
                            decrement: pItem.quantity,
                        },
                    },
                });
            }
        }
        return createdOrder;
    }, { maxWait: 10_000, timeout: 20_000 });
    return {
        order,
        pricing: {
            subtotal: pricing.subtotal,
            discount: pricing.totalDiscount,
            tax: pricing.tax,
            shipping: pricing.shipping,
            total: pricing.total,
            itemCount: pricing.items.length,
        },
        trackingNumber,
        payment: {
            option: paymentOption,
            status: computedPaymentStatus,
        },
        orderType: input.orderType ?? "PRODUCT",
        alreadyExists: false,
        created: true,
    };
}
exports.createOrder = createOrder;
exports.default = createOrder;
