import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";
import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";
import { initiatePaystackPayment } from "@/lib/paymentsv2/paystack";
import { initiatePaystackPayment as initiateGhubaPayment } from "@/lib/payments/paystack";
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

  /**
   * ---------------------------------------------------------
   * CASH / SPLIT
   * ---------------------------------------------------------
   */

  if (paymentOption === "cash" || paymentOption === "split") {
    await prisma.customerOrder.update({
      where: {
        id: order.id,
      },
      data: {
        paymentStatus: "COMPLETED",
        status: "PAID",
        paymentMethod: (paymentOption.toUpperCase() as PaymentMethodType),
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

  if (
    paymentOption === "cod" ||
    paymentOption === "pending" ||
    paymentOption === "pickupatshop"
  ) {
    await prisma.customerOrder.update({
      where: {
        id: order.id,
      },
      data: {
        paymentStatus: "PENDING",
        status: "PENDING",
        paymentMethod: (paymentOption.toUpperCase() as PaymentMethodType),
        deliveryStatus:
          paymentOption === "pickupatshop"
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

  const cfg = await getCompanyPaymentConfig(companyId);

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
    const number = normalizePhoneNumber(rawNumber);

    if (!number) {
      throw new Error("M-Pesa phone number is required.");
    }

    const response = await initiateMpesaPayment(order, number, cfg.credentials);
    const checkoutRequestId =
      response?.data?.CheckoutRequestID ??
      response?.CheckoutRequestID ??
      response?.MerchantRequestID;

    if (checkoutRequestId) {
      await prisma.customerOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: "INITIATED",
          paymentOption: "mpesa",
          paymentMethod: (paymentOption.toUpperCase() as PaymentMethodType),
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
    const response = await initiatePaystackPayment(
      order,
      email,
      cfg.credentials,
      "",
    );

    const reference =
      response?.data?.reference ??
      response?.reference ??
      order.trackingNumber;

    const authUrl =
      response?.data?.authorization_url ??
      response?.authorization_url ??
      null;

    if (reference) {
      await prisma.customerOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: "INITIATED",
          paymentOption: "paystack",
          paymentMethod: (paymentOption.toUpperCase() as PaymentMethodType),
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
    const response = await initiateGhubaPayment(order, email);

    const reference =
      (response as any)?.data?.reference ??
      response?.reference ??
      order.trackingNumber;

    const authUrl =
      (response as any)?.data?.authorization_url ??
      response?.authorization_url ??
      null;

    if (reference) {
      await prisma.customerOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: "INITIATED",
          paymentOption: "ghuba",
          paymentMethod: ("PAYSTACK" as unknown as PaymentMethodType),
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
    const response = await initiateStripePaymentIntent(order, cfg.credentials);
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
          paymentMethod: (paymentOption.toUpperCase() as PaymentMethodType),
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
    const response = await createPaypalOrder(order, cfg.credentials);
    const authUrl =
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
          paymentMethod: (paymentOption.toUpperCase() as PaymentMethodType),
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
