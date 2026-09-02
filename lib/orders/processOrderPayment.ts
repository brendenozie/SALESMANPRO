import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";
import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";
import { initiatePaystackPayment } from "@/lib/paymentsv2/paystack";
import { initiatePaystackPayment as initiateGhubaPayment } from "@/lib/payments/paystack";
import { initiateStripePaymentIntent } from "@/lib/paymentsv2/stripe";
import { createPaypalOrder } from "@/lib/paymentsv2/paypal";

import prisma from "@/server/db/prismadb";
import { PaymentMethodType } from "@prisma/client";

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
    const number = paymentData?.mpesaPhone ?? mpesaPhone ?? phone;

    if (!number) {
      throw new Error("M-Pesa phone number is required.");
    }

    const response = await initiateMpesaPayment(order, number, cfg.credentials);

    return {
      success: true,
      status: "PENDING",
      method: "mpesa",
      gatewayResponse: response,
      authorizationUrl:
        response?.data?.authorization_url ??
        response?.authorization_url ??
        null,
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

    return {
      success: true,
      status: "PENDING",
      method: "paystack",
      gatewayResponse: response,
      authorizationUrl:
        response?.data?.authorization_url ??
        response?.authorization_url ??
        null,
    };
  }

  /**
   * ---------------------------------------------------------
   * GHUBA
   * ---------------------------------------------------------
   *
   * Currently using your existing Paystack fallback.
   */

  if (paymentOption === "ghuba") {
    const response = await initiateGhubaPayment(order, email);

    return {
      success: true,
      status: "PENDING",
      method: "ghuba",
      gatewayResponse: response,
      authorizationUrl:
        (response as any)?.data?.authorization_url ??
        response?.authorization_url ??
        null,
    };
  }

  /**
   * ---------------------------------------------------------
   * STRIPE
   * ---------------------------------------------------------
   */

  if (paymentOption === "stripe") {
    const response = await initiateStripePaymentIntent(order, cfg.credentials);

    return {
      success: true,
      status: "PENDING",
      method: "stripe",
      gatewayResponse: response,
    };
  }

  /**
   * ---------------------------------------------------------
   * PAYPAL
   * ---------------------------------------------------------
   */

  if (paymentOption === "paypal") {
    const response = await createPaypalOrder(order, cfg.credentials);

    return {
      success: true,
      status: "PENDING",
      method: "paypal",
      gatewayResponse: response,
      authorizationUrl:
        response?.data?.authorization_url ??
        response?.authorization_url ??
        null,
    };
  }

  throw new Error(`Unsupported payment option: ${paymentOption}`);
}
