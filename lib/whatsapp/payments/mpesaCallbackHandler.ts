/**
 * lib/whatsapp/payments/mpesaCallbackHandler.ts
 *
 * Authoritative Safaricom Daraja M-Pesa Callback Processor.
 * Validates callback, verifies transaction metadata, updates Payment & Order records,
 * and proactively notifies the WhatsApp customer.
 */

import prisma from "@/server/db/prismadb";
import { syncAuthoritativePayment } from "@/lib/payments/syncPayment";
import { MetaWhatsAppClient } from "../metaClient";
import { whatsappRepository } from "../repository";
import { decrypt } from "@/lib/crypto";

export interface MpesaStkCallbackPayload {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResultCode?: number;
      ResultDesc?: string;
      CallbackMetadata?: {
        Item?: Array<{
          Name: string;
          Value?: string | number;
        }>;
      };
    };
  };
}

export async function processMpesaCallback(payload: MpesaStkCallbackPayload): Promise<{
  success: boolean;
  message: string;
  orderId?: string;
}> {
  const stk = payload?.Body?.stkCallback;
  if (!stk) {
    return { success: false, message: "Invalid M-Pesa callback body" };
  }

  const { CheckoutRequestID, MerchantRequestID, ResultCode, ResultDesc } = stk;

  // 1. Locate corresponding order by CheckoutRequestID or MerchantRequestID
  const order = await prisma.customerOrder.findFirst({
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

    // Create/update authoritative Payment record linked to order
    await syncAuthoritativePayment({
      orderId: order.id,
      transactionId: receipt,
      providerTransactionId: receipt,
      internalReference: CheckoutRequestID || order.trackingNumber,
      amount,
      provider: "MPESA",
      channel: order.channel || "WHATSAPP",
      status: "COMPLETED",
      companyId: order.companyId,
      paidAt: new Date(),
    });

    // 4. Proactively send WhatsApp notification to customer if ordered via WhatsApp
    if (order.whatsappConversation && order.whatsappConversation.WhatsAppAccount) {
      const account = order.whatsappConversation.WhatsAppAccount;
      const contact = order.whatsappConversation.WhatsAppContact;

      let accessToken = process.env.WHATSAPP_ACCESS_TOKEN ?? "";
      if (account.accessTokenEncrypted && account.accessTokenIv && account.accessTokenTag) {
        accessToken = decrypt({
          value: account.accessTokenEncrypted,
          iv: account.accessTokenIv,
          tag: account.accessTokenTag,
        });
      }

      if (accessToken && account.phoneNumberId && contact?.phoneNumber) {
        try {
          const client = new MetaWhatsAppClient({
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
          await whatsappRepository.persistOutboundMessage({
            companyId: order.companyId ?? account.companyId,
            accountId: account.id,
            contactId: contact.id,
            conversationId: order.whatsappConversation.id,
            body: `Payment received: KES ${amount} (Receipt: ${receipt}) for Order #${order.trackingNumber ?? order.id}`,
            senderType: "SYSTEM",
            status: "SENT",
          });
        } catch (notificationError) {
          console.error("[WHATSAPP_PAYMENT_NOTIFICATION_FAILED]", notificationError);
        }
      }
    }

    console.log(`[MPESA_PAYMENT_SUCCESS] Order #${order.trackingNumber ?? order.id} marked as PAID. Receipt: ${receipt}`);
    return { success: true, message: "Payment completed successfully", orderId: order.id };
  }

  // 5. Handle Failed / Cancelled Payment
  await prisma.customerOrder.update({
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
