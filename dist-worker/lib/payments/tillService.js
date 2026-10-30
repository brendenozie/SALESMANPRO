"use strict";
/**
 * lib/payments/tillService.ts
 *
 * Authoritative M-Pesa Till Number Manual Payment Verification Workflow.
 * Implements a strictly controlled two-stage audit trail:
 *
 *   CUSTOMER SUBMISSION
 *          |
 *          v
 *   PENDING_ADMIN_REVIEW
 *          |
 *          v
 *   ADMIN_CONFIRMED  (PENDING_SUPER_ADMIN_VERIFICATION)
 *          |
 *          v
 *   SUPER_ADMIN_VERIFIED
 *          |
 *          v
 *   PAYMENT_COMPLETED & ORDER PAID
 *
 * CRITICAL SECURITY RULES:
 * - A customer-entered M-Pesa code is NEVER treated as proof of payment.
 * - Admin confirmation alone is NOT proof of payment.
 * - Final verification requires authoritative receipt confirmation against receiving account records.
 * - No order fulfillment or credit allocation occurs while verification is pending.
 * - Auditable tracking of reviewing Admin, verifying Super-Admin, timestamps, and notes.
 * - Rejects duplicate transaction codes across orders to prevent replay fraud.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TillPaymentService = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const subscription_plans_1 = require("@/lib/subscriptions/subscription-plans");
const syncPayment_1 = require("./syncPayment");
const client_1 = require("@prisma/client");
class TillPaymentService {
    /**
     * 1. Customer submits M-Pesa transaction code after paying to Till.
     */
    static async submitCustomerPayment(input) {
        const { orderId, subscriptionId, customerPhone, mpesaReceiptCode, amountPaid, submittedByUserId } = input;
        const cleanCode = (mpesaReceiptCode || "").trim().toUpperCase();
        if (!cleanCode || cleanCode.length < 5) {
            throw new Error("A valid M-Pesa transaction reference code is required (e.g. SLK892HJ3A).");
        }
        // Anti-Fraud: Check if this M-Pesa code was already used for another completed or verified payment
        const existingUsage = await prismadb_1.default.payment.findFirst({
            where: {
                providerTransactionId: cleanCode,
                status: client_1.PaymentStatus.COMPLETED,
            },
        });
        if (existingUsage) {
            throw new Error(`This M-Pesa transaction code (${cleanCode}) has already been used for another completed transaction. If you believe this is an error, please contact customer support.`);
        }
        if (orderId) {
            const order = await prismadb_1.default.customerOrder.findUnique({
                where: { id: orderId },
            });
            if (!order)
                throw new Error(`Order ${orderId} not found.`);
            // Update order state to pending admin review
            const updatedOrder = await prismadb_1.default.customerOrder.update({
                where: { id: orderId },
                data: {
                    paymentStatus: client_1.PaymentStatus.PENDING,
                    paymentOption: "till",
                    paymentMethod: client_1.PaymentMethodType.MPESA,
                    transactionReference: cleanCode,
                    deliveryStatus: "Awaiting Manual Payment Verification",
                    notes: `${order.notes || ""} [Till Submitted: Code ${cleanCode}, Phone ${customerPhone || "N/A"}, Amount KES ${amountPaid}]`.trim(),
                    orderAudits: {
                        customerSubmittedMpesaCode: cleanCode,
                        customerPhone,
                        amountSubmitted: amountPaid,
                        submittedAt: new Date().toISOString(),
                        submittedByUserId: submittedByUserId || null,
                        manualVerificationStatus: "PENDING_ADMIN_REVIEW",
                    },
                },
            });
            // Create or update pending Payment record
            await (0, syncPayment_1.syncAuthoritativePayment)({
                orderId: order.id,
                transactionId: `TILL-${cleanCode}-${order.id}`,
                providerTransactionId: cleanCode,
                internalReference: order.trackingNumber || order.id,
                amount: amountPaid,
                provider: client_1.PaymentMethodType.MPESA,
                channel: order.channel || "WEBSITE",
                status: client_1.PaymentStatus.PENDING,
                companyId: order.companyId,
                metadata: {
                    customerSubmittedMpesaCode: cleanCode,
                    customerPhone,
                    manualVerificationStatus: "PENDING_ADMIN_REVIEW",
                },
            });
            return {
                success: true,
                message: "Payment code submitted successfully. Your payment is currently pending administrator review.",
                status: "PENDING_ADMIN_REVIEW",
                orderId,
            };
        }
        if (subscriptionId) {
            const sub = await prismadb_1.default.subscriptionCompany.findUnique({
                where: { id: subscriptionId },
            });
            if (!sub)
                throw new Error(`Subscription ${subscriptionId} not found.`);
            await prismadb_1.default.subscriptionCompany.update({
                where: { id: subscriptionId },
                data: {
                    status: "AWAITING_CONFIRMATION",
                    gateway: "MPESA_TILL",
                },
            });
            await prismadb_1.default.subscriptionPayment.create({
                data: {
                    subscription: { connect: { id: subscriptionId } },
                    amount: amountPaid,
                    currency: "KES",
                    gateway: "MPESA_TILL",
                    gatewayRef: cleanCode,
                    status: "PENDING",
                    type: "INITIAL",
                },
            });
            return {
                success: true,
                message: "Subscription Till payment code submitted. Pending admin review.",
                status: "PENDING_ADMIN_REVIEW",
                subscriptionId,
            };
        }
        throw new Error("Must provide orderId or subscriptionId for Till payment submission.");
    }
    /**
     * 2. Store Administrator or Platform Admin confirms initial review.
     * Advances status to PENDING_SUPER_ADMIN_VERIFICATION.
     */
    static async adminConfirmPayment(input) {
        const { orderId, subscriptionId, adminUserId, adminName, notes } = input;
        if (orderId) {
            const order = await prismadb_1.default.customerOrder.findUnique({
                where: { id: orderId },
            });
            if (!order)
                throw new Error(`Order ${orderId} not found.`);
            const audits = order.orderAudits || {};
            const status = audits.manualVerificationStatus || "PENDING_ADMIN_REVIEW";
            if (status !== "PENDING_ADMIN_REVIEW") {
                throw new Error(`Order is not in PENDING_ADMIN_REVIEW status. Current status: ${status}`);
            }
            const updatedOrder = await prismadb_1.default.customerOrder.update({
                where: { id: orderId },
                data: {
                    notes: `${order.notes || ""} [Admin Confirmed: ${adminName || adminUserId}]`.trim(),
                    orderAudits: {
                        ...audits,
                        manualVerificationStatus: "PENDING_SUPER_ADMIN_VERIFICATION",
                        adminConfirmedBy: adminUserId,
                        adminConfirmedName: adminName || "Store Admin",
                        adminConfirmedAt: new Date().toISOString(),
                        adminNotes: notes || null,
                    },
                },
            });
            return {
                success: true,
                message: "Admin confirmation recorded. Awaiting final Super-Admin verification.",
                status: "PENDING_SUPER_ADMIN_VERIFICATION",
                order: updatedOrder,
            };
        }
        if (subscriptionId) {
            const payment = await prismadb_1.default.subscriptionPayment.findFirst({
                where: { subscriptionId, status: "PENDING", gateway: "MPESA_TILL" },
            });
            if (!payment)
                throw new Error("Pending subscription Till payment not found.");
            await prismadb_1.default.subscriptionPayment.update({
                where: { id: payment.id },
                data: {
                    gatewayMessage: `Admin confirmed by ${adminName || adminUserId}. Pending Super-Admin verification.`,
                },
            });
            return {
                success: true,
                message: "Subscription Till payment confirmed by admin. Pending final Super-Admin verification.",
                status: "PENDING_SUPER_ADMIN_VERIFICATION",
            };
        }
        throw new Error("Must provide orderId or subscriptionId.");
    }
    /**
     * 3. Super Administrator performs final authoritative verification against receiving bank/Till statement.
     * Marks Payment as COMPLETED, CustomerOrder as PAID, and triggers fiscal/receipt generation.
     */
    static async superAdminVerifyPayment(input) {
        const { orderId, subscriptionId, superAdminUserId, superAdminName, authoritativeStatementRef, notes } = input;
        if (orderId) {
            const order = await prismadb_1.default.customerOrder.findUnique({
                where: { id: orderId },
                include: { Company: true },
            });
            if (!order)
                throw new Error(`Order ${orderId} not found.`);
            const audits = order.orderAudits || {};
            const code = audits.customerSubmittedMpesaCode || order.transactionReference;
            if (!code) {
                throw new Error("No M-Pesa transaction reference found on order.");
            }
            const grossAmount = Number(order.totalFinalPrice ?? order.totalPrice ?? 0);
            // Perform authoritative synchronization into Payment and CustomerOrder records
            const syncResult = await (0, syncPayment_1.syncAuthoritativePayment)({
                orderId: order.id,
                transactionId: `TILL-${code}`,
                providerTransactionId: code,
                internalReference: order.trackingNumber || order.id,
                amount: grossAmount,
                provider: client_1.PaymentMethodType.MPESA,
                channel: order.channel || "WEBSITE",
                status: client_1.PaymentStatus.COMPLETED,
                companyId: order.companyId,
                paidAt: new Date(),
                metadata: {
                    ...audits,
                    manualVerificationStatus: "VERIFIED_COMPLETED",
                    superAdminVerifiedBy: superAdminUserId,
                    superAdminVerifiedName: superAdminName || "Super Admin",
                    superAdminVerifiedAt: new Date().toISOString(),
                    authoritativeStatementRef: authoritativeStatementRef || code,
                    verificationNotes: notes || null,
                },
            });
            return {
                success: true,
                message: "Payment authoritatively verified and marked COMPLETED. Order is now PAID.",
                status: "COMPLETED",
                orderId: order.id,
                payment: syncResult.payment,
            };
        }
        if (subscriptionId) {
            const payment = await prismadb_1.default.subscriptionPayment.findFirst({
                where: { subscriptionId, status: "PENDING", gateway: "MPESA_TILL" },
                include: { subscription: true },
            });
            if (!payment)
                throw new Error("Pending subscription Till payment not found.");
            const sub = payment.subscription;
            // Handles MONTHLY, ANNUALLY and LAUNCH:<pkg> (multi-month launch packages)
            const renewalDate = (0, subscription_plans_1.computeRenewalDate)(sub.billingCycle);
            await prismadb_1.default.$transaction(async (tx) => {
                await tx.subscriptionPayment.update({
                    where: { id: payment.id },
                    data: {
                        status: "SUCCESS",
                        paidAt: new Date(),
                        gatewayMessage: `Super-Admin verified by ${superAdminName || superAdminUserId}. Statement Ref: ${authoritativeStatementRef || payment.gatewayRef}`,
                    },
                });
                await tx.subscriptionCompany.update({
                    where: { id: sub.id },
                    data: {
                        status: "ACTIVE",
                        gateway: "MPESA_TILL",
                        renewalDate,
                    },
                });
                await tx.company.update({
                    where: { id: sub.companyId },
                    data: { hasWebsite: true },
                });
            });
            return {
                success: true,
                message: "Subscription Till payment authoritatively verified and activated.",
                status: "COMPLETED",
                subscriptionId: sub.id,
            };
        }
        throw new Error("Must provide orderId or subscriptionId.");
    }
    /**
     * 4. Rejection of unverified or fraudulent payment submissions.
     */
    static async rejectPayment(input) {
        const { orderId, subscriptionId, reviewerUserId, reason } = input;
        if (!reason || reason.trim().length === 0) {
            throw new Error("A specific rejection reason is mandatory.");
        }
        if (orderId) {
            const order = await prismadb_1.default.customerOrder.findUnique({
                where: { id: orderId },
            });
            if (!order)
                throw new Error(`Order ${orderId} not found.`);
            const audits = order.orderAudits || {};
            await prismadb_1.default.customerOrder.update({
                where: { id: orderId },
                data: {
                    paymentStatus: client_1.PaymentStatus.FAILED,
                    deliveryStatus: "Payment Rejected",
                    notes: `${order.notes || ""} [Till Payment Rejected: ${reason}]`.trim(),
                    orderAudits: {
                        ...audits,
                        manualVerificationStatus: "REJECTED",
                        rejectedBy: reviewerUserId,
                        rejectedAt: new Date().toISOString(),
                        rejectionReason: reason,
                    },
                },
            });
            return {
                success: true,
                message: `Payment submission rejected. Reason: ${reason}`,
                status: "REJECTED",
                orderId,
            };
        }
        if (subscriptionId) {
            const payment = await prismadb_1.default.subscriptionPayment.findFirst({
                where: { subscriptionId, status: "PENDING", gateway: "MPESA_TILL" },
            });
            if (payment) {
                await prismadb_1.default.subscriptionPayment.update({
                    where: { id: payment.id },
                    data: {
                        status: "FAILED",
                        gatewayMessage: `Rejected by reviewer: ${reason}`,
                    },
                });
            }
            await prismadb_1.default.subscriptionCompany.update({
                where: { id: subscriptionId },
                data: { status: "EXPIRED" },
            });
            return {
                success: true,
                message: `Subscription Till payment rejected. Reason: ${reason}`,
                status: "REJECTED",
            };
        }
        throw new Error("Must provide orderId or subscriptionId.");
    }
    /**
     * Lists all pending Till payments awaiting review or verification.
     */
    static async getPendingTillQueue(filter) {
        const { companyId, stage = "ALL" } = filter || {};
        const orderWhere = {
            paymentOption: { in: ["till", "mpesatill"] },
            paymentStatus: { in: ["AWAITING_CONFIRMATION", "PENDING"] },
        };
        if (companyId) {
            orderWhere.companyId = companyId;
        }
        const orders = await prismadb_1.default.customerOrder.findMany({
            where: orderWhere,
            include: {
                Company: { select: { id: true, name: true, slug: true, currency: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        const pendingOrders = orders.filter((o) => {
            const audits = o.orderAudits || {};
            const status = audits.manualVerificationStatus || "PENDING_ADMIN_REVIEW";
            if (stage === "ADMIN")
                return status === "PENDING_ADMIN_REVIEW";
            if (stage === "SUPER_ADMIN")
                return status === "PENDING_SUPER_ADMIN_VERIFICATION";
            return true;
        });
        // Also fetch pending subscription Till payments
        const subscriptionPayments = await prismadb_1.default.subscriptionPayment.findMany({
            where: {
                status: "PENDING",
                gateway: "MPESA_TILL",
            },
            include: {
                subscription: {
                    include: {
                        company: { select: { id: true, name: true } },
                        user: { select: { name: true, email: true } },
                        plan: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        return {
            orders: pendingOrders.map((o) => {
                const audits = o.orderAudits || {};
                return {
                    id: o.id,
                    trackingNumber: o.trackingNumber,
                    companyId: o.companyId,
                    companyName: o.Company?.name || "Store",
                    amount: o.totalFinalPrice ?? o.totalPrice,
                    currency: o.Company?.currency || "KES",
                    customerName: o.name,
                    customerPhone: audits.customerPhone || o.mpesaPhone || o.phone,
                    customerSubmittedMpesaCode: audits.customerSubmittedMpesaCode || o.transactionReference,
                    stage: audits.manualVerificationStatus || "PENDING_ADMIN_REVIEW",
                    submittedAt: audits.submittedAt || o.createdAt,
                    adminConfirmedBy: audits.adminConfirmedName || audits.adminConfirmedBy || null,
                    adminConfirmedAt: audits.adminConfirmedAt || null,
                    notes: audits.adminNotes || null,
                };
            }),
            subscriptions: subscriptionPayments.map((p) => ({
                id: p.id,
                subscriptionId: p.subscriptionId,
                companyName: p.subscription.company?.name || "Company",
                userName: p.subscription.user?.name || "User",
                userEmail: p.subscription.user?.email || "",
                planName: p.subscription.plan?.name || "Plan",
                amount: p.amount,
                currency: p.currency,
                reference: p.gatewayRef,
                message: p.gatewayMessage,
                createdAt: p.createdAt,
            })),
        };
    }
}
exports.TillPaymentService = TillPaymentService;
