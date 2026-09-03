"use strict";
/**
 * lib/whatsapp/payments/mpesaCallbackHandler.ts
 *
 * Authoritative Safaricom Daraja M-Pesa Callback Processor.
 * Validates callback, verifies transaction metadata, updates Payment & Order records,
 * and proactively notifies the WhatsApp customer.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMpesaCallback = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const metaClient_1 = require("../metaClient");
const repository_1 = require("../repository");
const crypto_1 = require("@/lib/crypto");
async function processMpesaCallback(payload) {
    const stk = payload?.Body?.stkCallback;
    if (!stk) {
        return { success: false, message: "Invalid M-Pesa callback body" };
    }
    const { CheckoutRequestID, MerchantRequestID, ResultCode, ResultDesc } = stk;
    // 1. Locate corresponding order by CheckoutRequestID or MerchantRequestID
    const order = await prismadb_1.default.customerOrder.findFirst({
        where: {
            OR: [
                { transactionReference: CheckoutRequestID },
                { transactionReference: MerchantRequestID },
                { trackingNumber: CheckoutRequestID },
            ],
        },
        include: {
            Company: {
                select: {
                    id: true,
                    name: true,
                    currency: true,
                },
            },
            whatsappConversation: {
                include: {
                    WhatsAppAccount: true,
                    WhatsAppContact: true,
                },
            },
        },
    });
    if (!order) {
        console.warn("[MPESA_CALLBACK_UNKNOWN_ORDER]", {
            CheckoutRequestID,
            MerchantRequestID,
        });
        return { success: false, message: "Order not found" };
    }
    // 2. Prevent duplicate callback processing
    if (order.paymentStatus === "COMPLETED") {
        return { success: true, message: "Payment already processed", orderId: order.id };
    }
    // 3. Handle Successful Payment (ResultCode === 0)
    if (ResultCode === 0) {
        const meta = stk.CallbackMetadata?.Item || [];
        const amount = Number(meta.find((x) => x.Name === "Amount")?.Value ?? order.totalFinalPrice ?? 0);
        const receipt = String(meta.find((x) => x.Name === "MpesaReceiptNumber")?.Value ?? CheckoutRequestID);
        const phone = String(meta.find((x) => x.Name === "PhoneNumber")?.Value ?? order.mpesaPhone ?? order.phone);
        // Create Payment record linked to order
        await prismadb_1.default.payment.create({
            data: {
                userId: order.consumerId ?? order.Company?.id ?? "unknown",
                orderId: order.id,
                amount,
                status: "COMPLETED",
                transactionId: receipt,
            },
        });
        // Update CustomerOrder to COMPLETED / PAID
        await prismadb_1.default.customerOrder.update({
            where: { id: order.id },
            data: {
                paymentStatus: "COMPLETED",
                paymentMethod: "MPESA",
                transactionId: receipt,
                transactionDate: new Date(),
                deliveryStatus: "Payment Received",
                status: "PAID",
            },
        });
        // 4. Proactively send WhatsApp notification to customer if ordered via WhatsApp
        if (order.whatsappConversation && order.whatsappConversation.WhatsAppAccount) {
            const account = order.whatsappConversation.WhatsAppAccount;
            const contact = order.whatsappConversation.WhatsAppContact;
            let accessToken = process.env.WHATSAPP_ACCESS_TOKEN ?? "";
            if (account.accessTokenEncrypted && account.accessTokenIv && account.accessTokenTag) {
                accessToken = (0, crypto_1.decrypt)({
                    value: account.accessTokenEncrypted,
                    iv: account.accessTokenIv,
                    tag: account.accessTokenTag,
                });
            }
            if (accessToken && account.phoneNumberId && contact?.phoneNumber) {
                try {
                    const client = new metaClient_1.MetaWhatsAppClient({
                        accessToken,
                        phoneNumberId: account.phoneNumberId,
                    });
                    await client.sendPaymentReceivedNotification({
                        phone: contact.phoneNumber,
                        trackingNumber: order.trackingNumber ?? order.id,
                        receiptNumber: receipt,
                        amount,
                        currency: order.Company?.currency ?? "KES",
                    });
                    // Persist outbound notification message
                    await repository_1.whatsappRepository.persistOutboundMessage({
                        companyId: order.companyId ?? account.companyId,
                        accountId: account.id,
                        contactId: contact.id,
                        conversationId: order.whatsappConversation.id,
                        body: `Payment received: KES ${amount} (Receipt: ${receipt}) for Order #${order.trackingNumber ?? order.id}`,
                        senderType: "SYSTEM",
                        status: "SENT",
                    });
                }
                catch (notificationError) {
                    console.error("[WHATSAPP_PAYMENT_NOTIFICATION_FAILED]", notificationError);
                }
            }
        }
        console.log(`[MPESA_PAYMENT_SUCCESS] Order #${order.trackingNumber ?? order.id} marked as PAID. Receipt: ${receipt}`);
        return { success: true, message: "Payment completed successfully", orderId: order.id };
    }
    // 5. Handle Failed / Cancelled Payment
    await prismadb_1.default.customerOrder.update({
        where: { id: order.id },
        data: {
            paymentStatus: "FAILED",
            deliveryStatus: "Payment Failed",
            notes: order.notes
                ? `${order.notes}\n[M-Pesa Failed]: ${ResultDesc}`
                : `[M-Pesa Failed]: ${ResultDesc}`,
        },
    });
    console.warn(`[MPESA_PAYMENT_FAILED] Order #${order.trackingNumber ?? order.id}: ${ResultDesc}`);
    return { success: true, message: `Payment failed: ${ResultDesc}`, orderId: order.id };
}
exports.processMpesaCallback = processMpesaCallback;
