import { syncAuthoritativePayment } from "@/lib/payments/syncPayment";
import {
  resolvePaymentConfiguration,
  PaymentProvider,
  MpesaCredentials,
  PaystackCredentials,
  TillCredentials,
} from "@/lib/payments/resolver";
import { initiateMpesaPayment } from "@/lib/payments/mpesa";
import { initiatePaystackPayment } from "@/lib/payments/paystack";
import { initiateStripePaymentIntent } from "@/lib/paymentsv2/stripe";
import { createPaypalOrder } from "@/lib/paymentsv2/paypal";

import prisma from "@/server/db/prismadb";
import { PaymentMethodType } from "@prisma/client";
import { normalizePhoneNumber } from "@/lib/whatsapp/normalizePhone";

export type ProcessOrderPaymentInput = {
  order: any;
  companyId?: string | null;
  paymentOption: string;
  email: string;
  phone?: string;
  mpesaPhone?: string | null;
  paymentData?: Record<string, any>;
};

export async function processOrderPayment(input: ProcessOrderPaymentInput) {
  const {
    order,
    companyId,
    paymentOption,
    email,
    phone,
    mpesaPhone,
    paymentData,
  } = input;

  const optLower = (paymentOption || "").toLowerCase();
  const effectiveCompanyId = companyId || order.companyId;

  let effectiveOption = optLower;
  if (optLower === "card" && effectiveCompanyId) {
    const storeSettings = await prisma.company.findUnique({
      where: { id: effectiveCompanyId },
      select: {
        PaymentSettings: {
          select: { isStripeEnabled: true, isPaystackEnabled: true },
        },
      },
    });
    if (storeSettings?.PaymentSettings?.isStripeEnabled) {
      effectiveOption = "stripe";
    } else {
      effectiveOption = "paystack";
    }
  }

  /**
   * ---------------------------------------------------------
   * CASH / SPLIT
   * ---------------------------------------------------------
   */
  if (effectiveOption === "cash" || effectiveOption === "split") {
    const gross = Number(order.totalFinalPrice ?? order.totalPrice ?? 0);
    await syncAuthoritativePayment({
      orderId: order.id,
      transactionId: `CASH-${order.trackingNumber || order.id}`,
      amount: gross,
      provider: effectiveOption.toUpperCase(),
      channel: order.channel || "POS",
      status: "COMPLETED",
      companyId: effectiveCompanyId,
      paidAt: new Date(),
    });

    return {
      success: true,
      status: "COMPLETED",
      message: "Counter payment verified and completed.",
      method: effectiveOption,
    };
  }

  /**
   * ---------------------------------------------------------
   * DEFERRED PAYMENT (COD / PICKUP)
   * ---------------------------------------------------------
   */
  if (
    effectiveOption === "cod" ||
    effectiveOption === "pending" ||
    effectiveOption === "pickupatshop"
  ) {
    const gross = Number(order.totalFinalPrice ?? order.totalPrice ?? 0);
    await syncAuthoritativePayment({
      orderId: order.id,
      transactionId: `DEF-${order.trackingNumber || order.id}`,
      amount: gross,
      provider: effectiveOption.toUpperCase(),
      channel: order.channel || "WEBSITE",
      status: "PENDING",
      companyId: effectiveCompanyId,
    });

    return {
      success: true,
      status: "PENDING",
      message: "Order created with deferred payment.",
      method: effectiveOption,
    };
  }

  if (!effectiveCompanyId) {
    throw new Error("Company ID is required for online payments.");
  }

  /**
   * ---------------------------------------------------------
   * M-PESA STK PUSH (GHUBA-MANAGED OR MERCHANT-MANAGED)
   * ---------------------------------------------------------
   */
  if (effectiveOption === "mpesa") {
    const rawNumber = paymentData?.mpesaPhone ?? mpesaPhone ?? phone;
    const number = normalizePhoneNumber(rawNumber);

    if (!number) {
      throw new Error("M-Pesa phone number is required.");
    }

    const resolved = await resolvePaymentConfiguration({
      purpose: "ORDER",
      provider: "MPESA",
      storeId: effectiveCompanyId,
    });

    const response = await initiateMpesaPayment(
      order,
      number,
      resolved.credentials as MpesaCredentials,
    );

    const checkoutRequestId =
      response?.CheckoutRequestID ??
      response?.MerchantRequestID ??
      response?.data?.CheckoutRequestID;

    if (checkoutRequestId) {
      await prisma.customerOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: "INITIATED",
          paymentOption: "mpesa",
          paymentMethod: PaymentMethodType.MPESA,
          mpesaPhone: number,
          transactionReference: checkoutRequestId,
          notes: `${order.notes || ""} [M-Pesa: ${resolved.ownership} via ${resolved.credentialSource}]`.trim(),
        },
      });
    }

    return {
      success: true,
      status: "INITIATED",
      method: "mpesa",
      ownership: resolved.ownership,
      credentialSource: resolved.credentialSource,
      checkoutRequestId,
      gatewayResponse: response,
      authorizationUrl: null,
      message: "M-Pesa STK push initiated successfully.",
    };
  }

  /**
   * ---------------------------------------------------------
   * PAYSTACK & GHUBA PAY (GHUBA-MANAGED OR MERCHANT-MANAGED)
   * ---------------------------------------------------------
   */
  if (effectiveOption === "paystack" || effectiveOption === "ghuba") {
    const resolved = await resolvePaymentConfiguration({
      purpose: "ORDER",
      provider: "PAYSTACK",
      storeId: effectiveCompanyId,
    });

    const response: any = await initiatePaystackPayment(
      order,
      email,
      resolved.credentials as PaystackCredentials,
    );

    const reference =
      response?.reference ??
      response?.data?.reference ??
      order.trackingNumber;

    const authUrl =
      response?.authorization_url ??
      response?.data?.authorization_url ??
      null;

    if (reference) {
      await prisma.customerOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: "INITIATED",
          paymentOption: effectiveOption,
          paymentMethod: PaymentMethodType.PAYSTACK,
          transactionReference: reference,
          notes: `${order.notes || ""} [Paystack: ${resolved.ownership} via ${resolved.credentialSource}]`.trim(),
        },
      });
    }

    return {
      success: true,
      status: "INITIATED",
      method: effectiveOption,
      ownership: resolved.ownership,
      credentialSource: resolved.credentialSource,
      reference,
      gatewayResponse: response,
      authorizationUrl: authUrl,
    };
  }

  /**
   * ---------------------------------------------------------
   * TILL NUMBER PAYMENT (FALLBACK OR EXPLICIT MANUAL FLOW)
   * ---------------------------------------------------------
   */
  if (effectiveOption === "till" || effectiveOption === "mpesatill") {
    const resolved = await resolvePaymentConfiguration({
      purpose: "ORDER",
      provider: "TILL",
      storeId: effectiveCompanyId,
    });

    const creds = resolved.credentials as TillCredentials;
    const tempRef = `TILL-${order.trackingNumber || order.id}`;

    await prisma.customerOrder.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PENDING",
        paymentOption: "till",
        paymentMethod: PaymentMethodType.MPESA,
        transactionReference: tempRef,
        deliveryStatus: "Awaiting Payment Verification",
        notes: `${order.notes || ""} [Till Payment Pending: Till ${creds.tillNumber} (${creds.accountName})]`.trim(),
      },
    });

    return {
      success: true,
      status: "AWAITING_CONFIRMATION",
      method: "till",
      ownership: resolved.ownership,
      credentialSource: resolved.credentialSource,
      tillNumber: creds.tillNumber,
      accountName: creds.accountName,
      instructions: creds.instructions,
      reference: tempRef,
      message: `Please complete payment of KES ${Number(order.totalFinalPrice ?? order.totalPrice).toLocaleString()} to Till ${creds.tillNumber} (${creds.accountName}) and submit your transaction code for verification.`,
    };
  }

  /**
   * ---------------------------------------------------------
   * STRIPE
   * ---------------------------------------------------------
   */
  if (effectiveOption === "stripe") {
    const resolved = await resolvePaymentConfiguration({
      purpose: "ORDER",
      provider: "STRIPE",
      storeId: effectiveCompanyId,
    });

    const response = await initiateStripePaymentIntent(order, resolved.credentials as any);
    const clientSecret =
      response?.client_secret ??
      response?.clientSecret ??
      response?.id;

    if (response?.id) {
      await prisma.customerOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: "INITIATED",
          paymentOption: "stripe",
          paymentMethod: PaymentMethodType.STRIPE,
          transactionReference: response.id,
        },
      });
    }

    return {
      success: true,
      status: "INITIATED",
      method: "stripe",
      ownership: resolved.ownership,
      credentialSource: resolved.credentialSource,
      clientSecret,
      gatewayResponse: response,
      authorizationUrl: response?.url ?? null,
    };
  }

  /**
   * ---------------------------------------------------------
   * PAYPAL
   * ---------------------------------------------------------
   */
  if (effectiveOption === "paypal") {
    const resolved = await resolvePaymentConfiguration({
      purpose: "ORDER",
      provider: "PAYPAL",
      storeId: effectiveCompanyId,
    });

    const response = await createPaypalOrder(order, resolved.credentials as any);
    const authUrl =
      response?.links?.find((l: any) => l.rel === "approve")?.href ??
      response?.data?.authorization_url ??
      response?.authorization_url ??
      null;

    const reference = response?.id ?? order.trackingNumber;

    if (reference) {
      await prisma.customerOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: "INITIATED",
          paymentOption: "paypal",
          paymentMethod: PaymentMethodType.PAYPAL,
          transactionReference: reference,
        },
      });
    }

    return {
      success: true,
      status: "INITIATED",
      method: "paypal",
      ownership: resolved.ownership,
      credentialSource: resolved.credentialSource,
      reference,
      gatewayResponse: response,
      authorizationUrl: authUrl,
      approveLink: authUrl,
    };
  }

  throw new Error(`Unsupported payment option: ${paymentOption}`);
}
