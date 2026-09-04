/**
 * lib/payments/syncPayment.ts
 *
 * Authoritative Payment Synchronizer.
 * Idempotently creates or updates unified Payment records and synchronizes
 * CustomerOrder state across all gateways (M-Pesa, Paystack, Stripe, PayPal, Ghuba, Cash/POS).
 */

import prisma from "@/server/db/prismadb";
import { PaymentMethodType, PaymentStatus, OrderChannel } from "@prisma/client";
import { attributeOrderFinancials, roundCurrency } from "./attribution";

export interface SyncPaymentInput {
  orderId: string;
  transactionId: string; // Authoritative gateway transaction ID or unique ref
  providerTransactionId?: string;
  internalReference?: string;
  amount?: number; // Gross amount paid
  feeAmount?: number;
  netAmount?: number;
  currency?: string;
  provider: PaymentMethodType | string;
  channel?: OrderChannel | string;
  status: PaymentStatus | "COMPLETED" | "FAILED" | "PENDING" | "INITIATED" | "REFUNDED";
  userId?: string | null;
  companyId?: string | null;
  metadata?: Record<string, any>;
  paidAt?: Date | null;
  settlementStatus?: "UNSETTLED" | "PENDING" | "SETTLED" | "NOT_APPLICABLE";
}

export async function syncAuthoritativePayment(input: SyncPaymentInput) {
  const {
    orderId,
    transactionId,
    providerTransactionId,
    internalReference,
    amount,
    currency = "KES",
    provider,
    channel,
    status,
    userId,
    companyId,
    metadata,
    paidAt,
    settlementStatus = "UNSETTLED",
  } = input;

  // 1. Fetch the authoritative CustomerOrder with all relations for attribution
  const order = await prisma.customerOrder.findUnique({
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
  const financialSummary = attributeOrderFinancials(order as any);
  const targetCompanyId =
    companyId ||
    order.companyId ||
    Object.keys(financialSummary.attributions)[0] ||
    null;

  const gross = roundCurrency(
    amount ?? Number(order.totalFinalPrice ?? order.totalPrice ?? 0)
  );

  let fee = input.feeAmount;
  if (typeof fee !== "number") {
    fee = financialSummary.totalPlatformFees;
  }
  fee = roundCurrency(fee);

  let net = input.netAmount;
  if (typeof net !== "number") {
    net = roundCurrency(gross - fee);
  }
  net = roundCurrency(net);

  // 3. Normalize Enums
  let normProvider: PaymentMethodType = PaymentMethodType.MPESA;
  const pUpper = String(provider).toUpperCase();
  if (pUpper.includes("PAYSTACK")) normProvider = PaymentMethodType.PAYSTACK;
  else if (pUpper.includes("STRIPE")) normProvider = PaymentMethodType.STRIPE;
  else if (pUpper.includes("PAYPAL")) normProvider = PaymentMethodType.PAYPAL;
  else if (pUpper.includes("GHUBA")) normProvider = PaymentMethodType.GHUBA;
  else if (pUpper.includes("CASH")) normProvider = PaymentMethodType.CASH;
  else if (pUpper.includes("COD")) normProvider = PaymentMethodType.COD;
  else if (pUpper.includes("PICKUP")) normProvider = PaymentMethodType.PICKUP;
  else if (pUpper.includes("CARD")) normProvider = PaymentMethodType.CARD;

  let normChannel: OrderChannel = OrderChannel.WEBSITE;
  const cUpper = String(channel || order.channel || "WEBSITE").toUpperCase();
  if (cUpper.includes("WHATSAPP")) normChannel = OrderChannel.WHATSAPP;
  else if (cUpper.includes("POS")) normChannel = OrderChannel.POS;
  else if (cUpper.includes("MOBILE")) normChannel = OrderChannel.MOBILE;
  else if (cUpper.includes("API")) normChannel = OrderChannel.API;
  else if (cUpper.includes("AI")) normChannel = OrderChannel.AI;

  const normStatus = status.toUpperCase() as PaymentStatus;
  const resolvedPaidAt =
    normStatus === PaymentStatus.COMPLETED
      ? paidAt || new Date()
      : null;

  // 4. Atomic Database Upsert within Transaction
  return await prisma.$transaction(async (tx) => {
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
      settlementStatus:
        normStatus === PaymentStatus.COMPLETED ? settlementStatus : "UNSETTLED",
      transactionId: transactionId || `TX-${order.trackingNumber || order.id}`,
      providerTransactionId: providerTransactionId || transactionId,
      internalReference: internalReference || order.trackingNumber || order.id,
      metadata: metadata ? (metadata as any) : undefined,
      paidAt: resolvedPaidAt,
    };

    if (existingPayment) {
      paymentRecord = await tx.payment.update({
        where: { id: existingPayment.id },
        data: paymentData,
      });
    } else {
      paymentRecord = await tx.payment.create({
        data: paymentData,
      });
    }

    // 5. Authoritatively update CustomerOrder status
    const orderUpdateData: any = {
      paymentStatus: normStatus,
      paymentMethod: normProvider,
      transactionId: paymentRecord.transactionId,
      transactionReference: providerTransactionId || internalReference || transactionId,
    };

    if (normStatus === PaymentStatus.COMPLETED) {
      orderUpdateData.status = "PAID";
      orderUpdateData.transactionDate = resolvedPaidAt || new Date();
      orderUpdateData.deliveryStatus = "Payment Confirmed";
    } else if (normStatus === PaymentStatus.FAILED) {
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
