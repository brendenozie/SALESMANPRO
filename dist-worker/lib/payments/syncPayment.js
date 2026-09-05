"use strict";
/**
 * lib/payments/syncPayment.ts
 *
 * Authoritative Payment Synchronizer.
 * Idempotently creates or updates unified Payment records and synchronizes
 * CustomerOrder state across all gateways (M-Pesa, Paystack, Stripe, PayPal, Ghuba, Cash/POS).
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncAuthoritativePayment = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const client_1 = require("@prisma/client");
const attribution_1 = require("./attribution");
async function syncAuthoritativePayment(input) {
    const { orderId, transactionId, providerTransactionId, internalReference, amount, currency = "KES", provider, channel, status, userId, companyId, metadata, paidAt, settlementStatus = "UNSETTLED", } = input;
    // 1. Fetch the authoritative CustomerOrder with all relations for attribution
    const order = await prismadb_1.default.customerOrder.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    marketplaceListing: {
                        include: {
                            CommissionRate: true,
                        },
                    },
                    product: true,
                    Return: true,
                },
            },
            Company: true,
        },
    });
    if (!order) {
        throw new Error(`CustomerOrder not found for orderId: ${orderId}`);
    }
    // 2. Derive store attribution and financial breakdown
    const financialSummary = (0, attribution_1.attributeOrderFinancials)(order);
    const targetCompanyId = companyId ||
        order.companyId ||
        Object.keys(financialSummary.attributions)[0] ||
        null;
    const gross = (0, attribution_1.roundCurrency)(amount ?? Number(order.totalFinalPrice ?? order.totalPrice ?? 0));
    let fee = input.feeAmount;
    if (typeof fee !== "number") {
        fee = financialSummary.totalPlatformFees;
    }
    fee = (0, attribution_1.roundCurrency)(fee);
    let net = input.netAmount;
    if (typeof net !== "number") {
        net = (0, attribution_1.roundCurrency)(gross - fee);
    }
    net = (0, attribution_1.roundCurrency)(net);
    // 3. Normalize Enums
    let normProvider = client_1.PaymentMethodType.MPESA;
    const pUpper = String(provider).toUpperCase();
    if (pUpper.includes("PAYSTACK"))
        normProvider = client_1.PaymentMethodType.PAYSTACK;
    else if (pUpper.includes("STRIPE"))
        normProvider = client_1.PaymentMethodType.STRIPE;
    else if (pUpper.includes("PAYPAL"))
        normProvider = client_1.PaymentMethodType.PAYPAL;
    else if (pUpper.includes("GHUBA"))
        normProvider = client_1.PaymentMethodType.GHUBA;
    else if (pUpper.includes("CASH"))
        normProvider = client_1.PaymentMethodType.CASH;
    else if (pUpper.includes("COD"))
        normProvider = client_1.PaymentMethodType.COD;
    else if (pUpper.includes("PICKUP"))
        normProvider = client_1.PaymentMethodType.PICKUP;
    else if (pUpper.includes("CARD"))
        normProvider = client_1.PaymentMethodType.CARD;
    let normChannel = client_1.OrderChannel.WEBSITE;
    const cUpper = String(channel || order.channel || "WEBSITE").toUpperCase();
    if (cUpper.includes("WHATSAPP"))
        normChannel = client_1.OrderChannel.WHATSAPP;
    else if (cUpper.includes("POS"))
        normChannel = client_1.OrderChannel.POS;
    else if (cUpper.includes("MOBILE"))
        normChannel = client_1.OrderChannel.MOBILE;
    else if (cUpper.includes("API"))
        normChannel = client_1.OrderChannel.API;
    else if (cUpper.includes("AI"))
        normChannel = client_1.OrderChannel.AI;
    const normStatus = status.toUpperCase();
    const resolvedPaidAt = normStatus === client_1.PaymentStatus.COMPLETED
        ? paidAt || new Date()
        : null;
    // 4. Atomic Database Upsert within Transaction
    return await prismadb_1.default.$transaction(async (tx) => {
        // Check for existing Payment with this transactionId or for this order
        const existingPayment = await tx.payment.findFirst({
            where: {
                OR: [
                    { transactionId },
                    { orderId: order.id, status: normStatus },
                ],
            },
        });
        let paymentRecord;
        const paymentData = {
            orderId: order.id,
            userId: userId || order.consumerId || null,
            companyId: targetCompanyId,
            channel: normChannel,
            provider: normProvider,
            currency,
            amount: gross,
            grossAmount: gross,
            feeAmount: fee,
            netAmount: net,
            status: normStatus,
            settlementStatus: normStatus === client_1.PaymentStatus.COMPLETED ? settlementStatus : "UNSETTLED",
            transactionId: transactionId || `TX-${order.trackingNumber || order.id}`,
            providerTransactionId: providerTransactionId || transactionId,
            internalReference: internalReference || order.trackingNumber || order.id,
            metadata: metadata ? metadata : undefined,
            paidAt: resolvedPaidAt,
        };
        if (existingPayment) {
            paymentRecord = await tx.payment.update({
                where: { id: existingPayment.id },
                data: paymentData,
            });
        }
        else {
            paymentRecord = await tx.payment.create({
                data: paymentData,
            });
        }
        // 5. Authoritatively update CustomerOrder status
        const orderUpdateData = {
            paymentStatus: normStatus,
            paymentMethod: normProvider,
            transactionId: paymentRecord.transactionId,
            transactionReference: providerTransactionId || internalReference || transactionId,
        };
        if (normStatus === client_1.PaymentStatus.COMPLETED) {
            orderUpdateData.status = "PAID";
            orderUpdateData.transactionDate = resolvedPaidAt || new Date();
            orderUpdateData.deliveryStatus = "Payment Confirmed";
        }
        else if (normStatus === client_1.PaymentStatus.FAILED) {
            orderUpdateData.status = "FAILED";
        }
        await tx.customerOrder.update({
            where: { id: order.id },
            data: orderUpdateData,
        });
        return {
            success: true,
            payment: paymentRecord,
            financialSummary,
        };
    });
}
exports.syncAuthoritativePayment = syncAuthoritativePayment;
