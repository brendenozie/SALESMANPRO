/**
 * lib/whatsapp/payments/mpesaCallbackHandler.ts
 *
 * Authoritative Safaricom Daraja M-Pesa Callback Processor.
 * Reconciles callbacks across:
 * 1. Customer Orders (E-commerce / Storefronts / Ghuba / WhatsApp)
 * 2. AI Credit Top-Ups (Platform Revenue)
 * 3. Subscription Payments (Platform Subscriptions)
 *
 * Implements strict idempotency, duplicate protection, and failure logging.
 */

import prisma from "@/server/db/prismadb";
import { syncAuthoritativePayment } from "@/lib/payments/syncPayment";
import { MetaWhatsAppClient } from "../metaClient";
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
  aiCreditTransactionId?: string;
  subscriptionId?: string;
}> {
  const stk = payload?.Body?.stkCallback;
  if (!stk) {
    return { success: false, message: "Invalid M-Pesa callback body" };
  }

  const { CheckoutRequestID, MerchantRequestID, ResultCode, ResultDesc } = stk;
  const isSuccess = ResultCode === 0;

  const meta = stk.CallbackMetadata?.Item || [];
  const amountPaid = Number(meta.find((x) => x.Name === "Amount")?.Value ?? 0);
  const mpesaReceipt = String(meta.find((x) => x.Name === "MpesaReceiptNumber")?.Value ?? CheckoutRequestID);
  const phone = String(meta.find((x) => x.Name === "PhoneNumber")?.Value ?? "");

  // =========================================================================
  // 1. MATCH CUSTOMER ORDER
  // =========================================================================
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

  if (order) {
    // Prevent duplicate callback processing
    if (order.paymentStatus === "COMPLETED") {
      return { success: true, message: "Payment already processed", orderId: order.id };
    }

    if (isSuccess) {
      const expectedAmount = Number(order.totalFinalPrice ?? order.totalPrice ?? 0);
      if (expectedAmount > 0 && amountPaid < expectedAmount - 1) {
        await prisma.customerOrder.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PARTIALLY_PAID",
            notes: `${order.notes || ""} [M-Pesa Underpayment: Received KES ${amountPaid}, Expected KES ${expectedAmount}. M-Pesa Receipt: ${mpesaReceipt}]`.trim(),
          },
        });
        return {
          success: false,
          message: `Underpayment detected: received KES ${amountPaid}, expected KES ${expectedAmount}`,
          orderId: order.id,
        };
      }

      await syncAuthoritativePayment({
        orderId: order.id,
        transactionId: mpesaReceipt,
        providerTransactionId: mpesaReceipt,
        internalReference: CheckoutRequestID || order.trackingNumber,
        amount: amountPaid > 0 ? amountPaid : expectedAmount,
        provider: "MPESA",
        channel: order.channel || "WEBSITE",
        status: "COMPLETED",
        companyId: order.companyId,
        paidAt: new Date(),
        metadata: {
          checkoutRequestId: CheckoutRequestID,
          merchantRequestId: MerchantRequestID,
          resultDesc: ResultDesc,
          phone,
        },
      });

      // WhatsApp Customer Notification if ordered via WhatsApp
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
            await client.sendTextMessage({
              to: contact.phoneNumber,
              body: `✅ Payment of KES ${amountPaid} confirmed for order ${order.trackingNumber || order.id}! M-Pesa Receipt: ${mpesaReceipt}. Thank you for shopping with ${order.Company?.name || "us"}!`,
            });
          } catch (whatsappErr) {
            console.warn("[MPESA_CALLBACK_WHATSAPP_WARN]", whatsappErr);
          }
        }
      }

      return { success: true, message: "Customer order payment confirmed", orderId: order.id };
    } else {
      // Payment Failed or Cancelled by User
      await prisma.customerOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
          notes: `${order.notes || ""} [M-Pesa Failed: Code ${ResultCode} - ${ResultDesc}]`.trim(),
        },
      });

      return {
        success: false,
        message: `M-Pesa payment failed: ${ResultDesc || "Cancelled by user"}`,
        orderId: order.id,
      };
    }
  }

  // =========================================================================
  // 2. MATCH AI CREDIT TRANSACTION
  // =========================================================================
  const aiTx = await prisma.aICreditTransaction.findFirst({
    where: {
      OR: [
        { referenceId: CheckoutRequestID },
        { referenceId: MerchantRequestID },
        { idempotencyKey: CheckoutRequestID },
        { idempotencyKey: MerchantRequestID },
      ],
    },
  });

  if (aiTx) {
    if (aiTx.status === "COMPLETED") {
      return {
        success: true,
        message: "AI credits already allocated for this transaction",
        aiCreditTransactionId: aiTx.id,
      };
    }

    if (isSuccess) {
      const creditsToAdd = Math.abs(aiTx.amount);

      await prisma.$transaction(async (tx) => {
        // Increment company credit balance exactly once
        const updatedCompany = await tx.company.update({
          where: { id: aiTx.companyId },
          data: {
            aiCreditBalance: { increment: creditsToAdd },
          },
          select: { aiCreditBalance: true },
        });

        // Mark transaction COMPLETED with authoritative balance and receipt
        await tx.aICreditTransaction.update({
          where: { id: aiTx.id },
          data: {
            status: "COMPLETED",
            balanceAfter: updatedCompany.aiCreditBalance,
            metadata: {
              ...(aiTx.metadata as any || {}),
              mpesaReceiptNumber: mpesaReceipt,
              amountPaid,
              phone,
              resultCode: ResultCode,
              resultDesc: ResultDesc,
              completedAt: new Date().toISOString(),
            },
          },
        });

        // Ensure WhatsApp AI is enabled
        await tx.whatsAppAIConfig.upsert({
          where: { companyId: aiTx.companyId },
          update: { enabled: true },
          create: { companyId: aiTx.companyId, enabled: true },
        });
      });

      console.log(`✅ [AI_CREDITS_ALLOCATED] ${creditsToAdd} credits allocated to company ${aiTx.companyId}. Receipt: ${mpesaReceipt}`);
      return {
        success: true,
        message: `Successfully allocated ${creditsToAdd} AI credits upon M-Pesa confirmation.`,
        aiCreditTransactionId: aiTx.id,
      };
    } else {
      // Payment Failed or Cancelled - Zero credits allocated
      await prisma.aICreditTransaction.update({
        where: { id: aiTx.id },
        data: {
          status: "FAILED",
          metadata: {
            ...(aiTx.metadata as any || {}),
            resultCode: ResultCode,
            failureReason: ResultDesc,
            failedAt: new Date().toISOString(),
          },
        },
      });

      console.warn(`❌ [AI_CREDITS_PAYMENT_FAILED] M-Pesa payment failed for AI credits. Code: ${ResultCode}, Reason: ${ResultDesc}`);
      return {
        success: false,
        message: `AI credit purchase payment failed: ${ResultDesc}`,
        aiCreditTransactionId: aiTx.id,
      };
    }
  }

  // =========================================================================
  // 3. MATCH SUBSCRIPTION PAYMENT
  // =========================================================================
  const subPayment = await prisma.subscriptionPayment.findFirst({
    where: {
      gatewayRef: { in: [CheckoutRequestID, MerchantRequestID].filter(Boolean) as string[] },
      status: "PENDING",
    },
    include: { subscription: true },
  });

  if (subPayment) {
    if (isSuccess) {
      const sub = subPayment.subscription;
      const renewalDate = new Date();
      if (sub.billingCycle === "ANNUALLY") {
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      } else {
        renewalDate.setMonth(renewalDate.getMonth() + 1);
      }

      await prisma.$transaction(async (tx) => {
        await tx.subscriptionPayment.update({
          where: { id: subPayment.id },
          data: {
            status: "SUCCESS",
            paidAt: new Date(),
            gatewayRef: mpesaReceipt,
            gatewayMessage: `M-Pesa STK confirmed. Receipt: ${mpesaReceipt}`,
          },
        });

        await tx.subscriptionCompany.update({
          where: { id: sub.id },
          data: {
            status: "ACTIVE",
            gateway: "MPESA",
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
        message: "Subscription activated upon verified M-Pesa STK callback",
        subscriptionId: sub.id,
      };
    } else {
      await prisma.subscriptionPayment.update({
        where: { id: subPayment.id },
        data: {
          status: "FAILED",
          gatewayMessage: `M-Pesa failed: ${ResultDesc}`,
        },
      });

      return {
        success: false,
        message: `Subscription M-Pesa payment failed: ${ResultDesc}`,
        subscriptionId: subPayment.subscriptionId,
      };
    }
  }

  console.warn("[MPESA_CALLBACK_UNMATCHED]", {
    CheckoutRequestID,
    MerchantRequestID,
    ResultCode,
    ResultDesc,
  });

  return {
    success: false,
    message: "No matching CustomerOrder, AICreditTransaction, or SubscriptionPayment found for M-Pesa callback.",
  };
}
