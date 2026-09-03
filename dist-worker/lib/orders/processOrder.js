"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOrder = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const createOrder_1 = require("@/lib/orders/createOrder");
const index_1 = require("@/lib/paymentsv2/index");
const mpesa_1 = require("@/lib/paymentsv2/mpesa");
const paystack_1 = require("@/lib/paymentsv2/paystack");
const paystack_2 = require("@/lib/payments/paystack");
const stripe_1 = require("@/lib/paymentsv2/stripe");
const paypal_1 = require("@/lib/paymentsv2/paypal");
const EXTERNAL_PAYMENT_OPTIONS = new Set([
    "mpesa",
    "paystack",
    "ghuba",
    "stripe",
    "paypal",
    "card",
]);
const IMMEDIATE_PAYMENT_OPTIONS = new Set([
    "cash",
    "split",
]);
const DEFERRED_PAYMENT_OPTIONS = new Set([
    "pending",
    "cod",
    "pickupatshop",
]);
function generateTrackingNumber() {
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomPart = crypto_1.default.randomBytes(4).toString("hex").toUpperCase();
    return `TRK-${datePart}-${randomPart}`;
}
function getPaymentStatusForOption(paymentOption) {
    if (IMMEDIATE_PAYMENT_OPTIONS.has(paymentOption)) {
        return "COMPLETED";
    }
    return "PENDING";
}
function getOrderStatusForOption(paymentOption) {
    if (IMMEDIATE_PAYMENT_OPTIONS.has(paymentOption)) {
        return "PAID";
    }
    return "PENDING";
}
function sanitizePaymentData(paymentData) {
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
    return Object.fromEntries(Object.entries(paymentData).filter(([key]) => !blockedKeys.has(key)));
}
async function verifyListingOwnership(companyId, items) {
    const listingIds = [
        ...new Set(items.map((item) => item.marketplaceListingId).filter(Boolean)),
    ];
    if (!listingIds.length) {
        throw new Error("At least one marketplace listing is required.");
    }
    const listings = await prismadb_1.default.marketplaceListings.findMany({
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
        throw new Error(`One or more listings could not be found: ${missing.join(", ")}`);
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
function validateTotals(input) {
    const calculatedTotal = input.items.reduce((sum, item) => sum + item.totalPrice, 0);
    /**
     * We allow a tiny floating-point tolerance.
     */
    const difference = Math.abs(calculatedTotal - input.totalPrice);
    if (difference > 0.01) {
        throw new Error(`Order total mismatch. Expected ${calculatedTotal.toFixed(2)}, received ${input.totalPrice.toFixed(2)}.`);
    }
}
async function processPayment(orderDb, input) {
    const paymentOption = input.paymentOption;
    /**
     * --------------------------------------------------------
     * NO EXTERNAL GATEWAY
     * --------------------------------------------------------
     */
    if (DEFERRED_PAYMENT_OPTIONS.has(paymentOption)) {
        await prismadb_1.default.customerOrder.update({
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
                message: paymentOption === "cod"
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
        await prismadb_1.default.customerOrder.update({
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
                message: paymentOption === "cash"
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
    const cfg = await (0, index_1.getCompanyPaymentConfig)(input.companyId ?? undefined);
    if (!cfg?.credentials) {
        throw new Error("Payment gateway configuration is missing for this store.");
    }
    let paymentResponse;
    switch (paymentOption) {
        case "mpesa": {
            const phoneNumber = input.paymentData?.mpesaPhone ?? input.mpesaPhone ?? input.phone;
            if (!phoneNumber) {
                throw new Error("M-Pesa phone number is required.");
            }
            paymentResponse = await (0, mpesa_1.initiateMpesaPayment)(orderDb, String(phoneNumber), cfg.credentials);
            break;
        }
        case "paystack": {
            paymentResponse = await (0, paystack_1.initiatePaystackPayment)(orderDb, input.email, cfg.credentials, "");
            break;
        }
        case "ghuba": {
            paymentResponse = await (0, paystack_2.initiatePaystackPayment)(orderDb, input.email);
            break;
        }
        case "stripe": {
            paymentResponse = await (0, stripe_1.initiateStripePaymentIntent)(orderDb, cfg.credentials);
            break;
        }
        case "paypal": {
            paymentResponse = await (0, paypal_1.createPaypalOrder)(orderDb, cfg.credentials);
            break;
        }
        /**
         * `card` is intentionally not processed directly here.
         *
         * Card payments should resolve to a configured provider,
         * rather than allowing raw card details to enter this layer.
         */
        case "card": {
            throw new Error("Direct card processing is not supported. Use Paystack or Stripe.");
        }
        default:
            throw new Error(`Unsupported payment option: ${paymentOption}`);
    }
    const authorizationUrl = paymentResponse?.data?.authorization_url ??
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
async function processOrder(input) {
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
        const existingOrder = await prismadb_1.default.customerOrder.findFirst({
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
    const orderDb = await (0, createOrder_1.createOrder)({
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
        promoCode: typeof paymentData.promoCode === "string"
            ? paymentData.promoCode
            : undefined,
        trackingNumber,
        deliveryStatus: input.isServiceOrder
            ? "Appointment Requested"
            : "Order Placed",
        delivery: false,
        notes: typeof paymentData.notes === "string" ? paymentData.notes : undefined,
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
        const finalOrder = await prismadb_1.default.customerOrder.findUnique({
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
    }
    catch (error) {
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
        await prismadb_1.default.customerOrder.update({
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
exports.processOrder = processOrder;
