/**
 * lib/whatsapp/actions/payments/initiateMpesa.ts
 *
 * M-Pesa STK Push payment initiation and status verification.
 */

import prisma from "@/server/db/prismadb";
import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";
import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";
import { normalizePhoneNumber } from "../../normalizePhone";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
  initiateMpesaActionSchema,
} from "../../types";
import { z } from "zod";

type InitiateMpesaArgs = z.infer<typeof initiateMpesaActionSchema>["arguments"];

export async function initiateMpesa(
  args: InitiateMpesaArgs,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const order = await prisma.customerOrder.findFirst({
    where: {
      id: args.orderId,
      companyId: context.companyId,
    },
  });

  if (!order) {
    return {
      success: false,
      action: "initiate_mpesa",
      message: "I couldn't find the order to initiate M-Pesa payment for.",
    };
  }

  if (order.paymentStatus === "COMPLETED") {
    return {
      success: true,
      action: "initiate_mpesa",
      message: `✅ Order #${order.trackingNumber ?? order.id} is already paid in full.`,
    };
  }

  const phone = normalizePhoneNumber(args.phone ?? order.mpesaPhone ?? context.phoneNumber);
  if (!phone) {
    return {
      success: false,
      action: "initiate_mpesa",
      message: "Please provide a valid M-Pesa phone number to receive the STK push prompt.",
    };
  }

  const cfg = await getCompanyPaymentConfig(context.companyId);
  if (cfg.provider !== "mpesa" || !cfg.credentials) {
    return {
      success: false,
      action: "initiate_mpesa",
      message: "M-Pesa STK push is currently not configured for this store. You may pay with Cash on Delivery or contact store support.",
    };
  }

  try {
    const response = await initiateMpesaPayment(order, phone, cfg.credentials);

    const checkoutRequestId =
      response?.data?.CheckoutRequestID ??
      response?.CheckoutRequestID ??
      response?.MerchantRequestID;

    // Save transaction reference on order
    await prisma.customerOrder.update({
      where: { id: order.id },
      data: {
        paymentStatus: "INITIATED",
        paymentOption: "mpesa",
        mpesaPhone: phone,
        transactionReference: checkoutRequestId,
      },
    });

    return {
      success: true,
      action: "initiate_mpesa",
      message: `📲 *M-Pesa STK Push Sent!*

An M-Pesa prompt for *KES ${(order.totalFinalPrice ?? order.totalPrice ?? 0).toLocaleString()}* has been sent to *${phone}*.

Please enter your M-Pesa PIN on your phone to complete the payment. I will automatically confirm your order once the payment is processed!`,
      data: {
        orderId: order.id,
        phone,
        checkoutRequestId,
      },
    };
  } catch (error) {
    console.error("[MPESA_INITIATE_ERROR]", error);
    return {
      success: false,
      action: "initiate_mpesa",
      message: error instanceof Error ? error.message : "Failed to trigger M-Pesa STK push. Please check your phone number and try again.",
    };
  }
}

export async function getPaymentMethods(
  _args: Record<string, unknown>,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const settings = await prisma.paymentSettings.findFirst({
    where: { company: { id: context.companyId } },
  });

  const methods: string[] = [];
  if (settings?.isMpesaEnabled) methods.push("🟢 *M-Pesa* (Instant STK Push to your phone)");
  if (settings?.isPaystackEnabled) methods.push("💳 *Debit / Credit Card* (via Paystack)");
  if (settings?.isStripeEnabled) methods.push("💳 *Card / Apple Pay* (via Stripe)");
  if (settings?.isGhubaEnabled) methods.push("⚡ *Ghuba Payments*");
  methods.push("💵 *Cash on Delivery (COD)* (Pay when your order arrives)");

  return {
    success: true,
    action: "get_payment_methods",
    message: `Accepted Payment Methods:\n\n${methods.join("\n")}\n\nLet me know which method you'd like to use!`,
    data: { methods },
  };
}

export async function checkPaymentStatus(
  args: { orderId?: string; paymentReference?: string },
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const order = await prisma.customerOrder.findFirst({
    where: {
      companyId: context.companyId,
      OR: [
        args.orderId ? { id: args.orderId } : undefined,
        args.paymentReference ? { transactionReference: args.paymentReference } : undefined,
      ].filter(Boolean) as any,
    },
  });

  if (!order) {
    return {
      success: false,
      action: "check_payment_status",
      message: "I couldn't find the order to check payment status for.",
    };
  }

  const isPaid = order.paymentStatus === "COMPLETED";

  return {
    success: true,
    action: "check_payment_status",
    message: isPaid
      ? `✅ Payment for Order #${order.trackingNumber ?? order.id} is *COMPLETED*. Transaction ID: \`${order.transactionId ?? "Confirmed"}\``
      : `⏳ Payment status for Order #${order.trackingNumber ?? order.id} is *${order.paymentStatus}*. If you haven't entered your PIN yet, please do so or reply *PAY* to retry.`,
    data: {
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      isPaid,
    },
  };
}
