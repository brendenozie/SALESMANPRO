"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOrderPayment = void 0;
const index_1 = require("@/lib/paymentsv2/index");
const mpesa_1 = require("@/lib/paymentsv2/mpesa");
const paystack_1 = require("@/lib/paymentsv2/paystack");
const paystack_2 = require("@/lib/payments/paystack");
const stripe_1 = require("@/lib/paymentsv2/stripe");
const paypal_1 = require("@/lib/paymentsv2/paypal");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const normalizePhone_1 = require("@/lib/whatsapp/normalizePhone");
async function processOrderPayment(input) {
    const { order, companyId, paymentOption, email, phone, mpesaPhone, paymentData, } = input;
    /**
     * ---------------------------------------------------------
     * CASH / SPLIT
     * ---------------------------------------------------------
     */
    if (paymentOption === "cash" || paymentOption === "split") {
        await prismadb_1.default.customerOrder.update({
            where: {
                id: order.id,
            },
            data: {
                paymentStatus: "COMPLETED",
                status: "PAID",
                paymentMethod: paymentOption.toUpperCase(),
                deliveryStatus: "Processing",
            },
        });
        return {
            success: true,
            status: "COMPLETED",
            message: "Counter payment verified and completed.",
            method: paymentOption,
        };
    }
    /**
     * ---------------------------------------------------------
     * DEFERRED PAYMENT
     * ---------------------------------------------------------
     */
    if (paymentOption === "cod" ||
        paymentOption === "pending" ||
        paymentOption === "pickupatshop") {
        await prismadb_1.default.customerOrder.update({
            where: {
                id: order.id,
            },
            data: {
                paymentStatus: "PENDING",
                status: "PENDING",
                paymentMethod: paymentOption.toUpperCase(),
                deliveryStatus: paymentOption === "pickupatshop"
                    ? "Ready for Pickup"
                    : "Order Placed",
            },
        });
        return {
            success: true,
            status: "PENDING",
            message: "Order created with deferred payment.",
            method: paymentOption,
        };
    }
    /**
     * ---------------------------------------------------------
     * GATEWAY CONFIG
     * ---------------------------------------------------------
     */
    if (!companyId) {
        throw new Error("Company ID is required for online payments.");
    }
    const cfg = await (0, index_1.getCompanyPaymentConfig)(companyId);
    if (!cfg?.credentials) {
        throw new Error("Payment gateway configuration is missing for this store.");
    }
    /**
     * ---------------------------------------------------------
     * M-PESA
     * ---------------------------------------------------------
     */
    if (paymentOption === "mpesa") {
        const rawNumber = paymentData?.mpesaPhone ?? mpesaPhone ?? phone;
        const number = (0, normalizePhone_1.normalizePhoneNumber)(rawNumber);
        if (!number) {
            throw new Error("M-Pesa phone number is required.");
        }
        const response = await (0, mpesa_1.initiateMpesaPayment)(order, number, cfg.credentials);
        const checkoutRequestId = response?.data?.CheckoutRequestID ??
            response?.CheckoutRequestID ??
            response?.MerchantRequestID;
        if (checkoutRequestId) {
            await prismadb_1.default.customerOrder.update({
                where: { id: order.id },
                data: {
                    paymentStatus: "INITIATED",
                    paymentOption: "mpesa",
                    paymentMethod: paymentOption.toUpperCase(),
                    mpesaPhone: number,
                    transactionReference: checkoutRequestId,
                },
            });
        }
        return {
            success: true,
            status: "INITIATED",
            method: "mpesa",
            checkoutRequestId,
            gatewayResponse: response,
            authorizationUrl: null,
            message: "M-Pesa STK push initiated successfully.",
        };
    }
    /**
     * ---------------------------------------------------------
     * PAYSTACK
     * ---------------------------------------------------------
     */
    if (paymentOption === "paystack") {
        const response = await (0, paystack_1.initiatePaystackPayment)(order, email, cfg.credentials, "");
        const reference = response?.data?.reference ??
            response?.reference ??
            order.trackingNumber;
        const authUrl = response?.data?.authorization_url ??
            response?.authorization_url ??
            null;
        if (reference) {
            await prismadb_1.default.customerOrder.update({
                where: { id: order.id },
                data: {
                    paymentStatus: "INITIATED",
                    paymentOption: "paystack",
                    paymentMethod: paymentOption.toUpperCase(),
                    transactionReference: reference,
                },
            });
        }
        return {
            success: true,
            status: "INITIATED",
            method: "paystack",
            reference,
            gatewayResponse: response,
            authorizationUrl: authUrl,
        };
    }
    /**
     * ---------------------------------------------------------
     * GHUBA (USES PAYSTACK GATEWAY BY DEFAULT)
     * ---------------------------------------------------------
     */
    if (paymentOption === "ghuba") {
        const response = await (0, paystack_2.initiatePaystackPayment)(order, email);
        const reference = response?.data?.reference ??
            response?.reference ??
            order.trackingNumber;
        const authUrl = response?.data?.authorization_url ??
            response?.authorization_url ??
            null;
        if (reference) {
            await prismadb_1.default.customerOrder.update({
                where: { id: order.id },
                data: {
                    paymentStatus: "INITIATED",
                    paymentOption: "ghuba",
                    paymentMethod: "PAYSTACK",
                    transactionReference: reference,
                },
            });
        }
        return {
            success: true,
            status: "INITIATED",
            method: "ghuba",
            reference,
            gatewayResponse: response,
            authorizationUrl: authUrl,
        };
    }
    /**
     * ---------------------------------------------------------
     * STRIPE
     * ---------------------------------------------------------
     */
    if (paymentOption === "stripe") {
        const response = await (0, stripe_1.initiateStripePaymentIntent)(order, cfg.credentials);
        const clientSecret = response?.client_secret ??
            response?.clientSecret ??
            response?.id;
        if (response?.id) {
            await prismadb_1.default.customerOrder.update({
                where: { id: order.id },
                data: {
                    paymentStatus: "INITIATED",
                    paymentOption: "stripe",
                    paymentMethod: paymentOption.toUpperCase(),
                    transactionReference: response.id,
                },
            });
        }
        return {
            success: true,
            status: "INITIATED",
            method: "stripe",
            clientSecret,
            gatewayResponse: response,
            authorizationUrl: null,
        };
    }
    /**
     * ---------------------------------------------------------
     * PAYPAL
     * ---------------------------------------------------------
     */
    if (paymentOption === "paypal") {
        const response = await (0, paypal_1.createPaypalOrder)(order, cfg.credentials);
        const authUrl = response?.data?.authorization_url ??
            response?.authorization_url ??
            null;
        const reference = response?.id ?? order.trackingNumber;
        if (reference) {
            await prismadb_1.default.customerOrder.update({
                where: { id: order.id },
                data: {
                    paymentStatus: "INITIATED",
                    paymentOption: "paypal",
                    paymentMethod: paymentOption.toUpperCase(),
                    transactionReference: reference,
                },
            });
        }
        return {
            success: true,
            status: "INITIATED",
            method: "paypal",
            reference,
            gatewayResponse: response,
            authorizationUrl: authUrl,
        };
    }
    throw new Error(`Unsupported payment option: ${paymentOption}`);
}
exports.processOrderPayment = processOrderPayment;
