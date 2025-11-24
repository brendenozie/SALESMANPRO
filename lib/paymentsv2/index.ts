// lib/payments/index.ts
import prisma from "@/server/db/prismadb";
import { ProviderConfig } from "./types";

/**
 * Resolve effective provider config for a given company.
 * Logic:
 *  - If company PaymentSettings present and any provider enabled, use that provider (priority order below).
 *  - For Ghuba: if company has ghuba enabled use company creds; otherwise fallback to env GHUBA_*.
 *
 * Priority used here (you can change): ghuba -> mpesa -> paystack -> stripe -> paypal
 */

export async function getCompanyPaymentConfig(companyId?: string): Promise<ProviderConfig> {
  // helper to return env fallback ghuba
  const ghubaEnv = {
    ghubaMerchantId: process.env.GHUBA_MERCHANT_ID,
    ghubaApiKey: process.env.GHUBA_API_KEY,
    baseUrl: process.env.GHUBA_BASE_URL,
    callbackUrl: process.env.GHUBA_CALLBACK_URL,
  };

  if (!companyId) {
    return {
      provider: "ghuba",
      credentials: {
        ...ghubaEnv,
      },
      rawSettings: null,
    };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { PaymentSettings: true },
  });

  const settings = company?.PaymentSettings ?? null;

  // GHUBA
  if (settings?.isGhubaEnabled) {
    return {
      provider: "ghuba",
      credentials: {
        ghubaMerchantId: settings.ghubaMerchantId ?? process.env.GHUBA_MERCHANT_ID,
        ghubaApiKey: settings.ghubaApiKey ?? process.env.GHUBA_API_KEY,
        baseUrl: process.env.GHUBA_BASE_URL,
        callbackUrl: process.env.GHUBA_CALLBACK_URL, //settings.ghubaCallbackUrl ?? 
      },
      rawSettings: settings,
    };
  }

  // MPESA
  if (settings?.isMpesaEnabled) {
    return {
      provider: "mpesa",
      credentials: {
        consumerKey: settings.mpesaConsumerKey ?? process.env.MPESA_CONSUMER_KEY,
        consumerSecret: settings.mpesaConsumerSecret ?? process.env.MPESA_CONSUMER_SECRET,
        shortcode: settings.mpesaShortcode ?? undefined,
        passkey: settings.mpesaPasskey ?? process.env.MPESA_PASSKEY,
        callbackUrl: settings.mpesaCallbackUrl ?? process.env.MPESA_CALLBACK_URL,
        baseUrl: process.env.MPESA_BASE_URL,
      },
      rawSettings: settings,
    };
  }

  // PAYSTACK
  if (settings?.isPaystackEnabled) {
    return {
      provider: "paystack",
      credentials: {
        secretKey: settings.paystackSecretKey ?? process.env.PAYSTACK_SECRET_KEY,
        publicKey: settings.paystackPublicKey ?? process.env.PAYSTACK_PUBLIC_KEY,
        baseUrl: process.env.PAYSTACK_BASE_URL,
        callbackUrl: process.env.PAYSTACK_CALLBACK_URL,
      },
      rawSettings: settings,
    };
  }

  // STRIPE
  if (settings?.isStripeEnabled) {
    return {
      provider: "stripe",
      credentials: {
        secretKey: settings.stripeSecretKey ?? process.env.STRIPE_SECRET_KEY,
        publishableKey: settings.stripePublishableKey ?? process.env.STRIPE_PUBLISHABLE_KEY,
        callbackUrl: process.env.STRIPE_WEBHOOK_SECRET ?? undefined,
      },
      rawSettings: settings,
    };
  }

  // PAYPAL
  if (settings?.isPaypalEnabled) {
    return {
      provider: "paypal",
      credentials: {
        clientId: settings.paypalClientId ?? process.env.PAYPAL_CLIENT_ID,
        clientSecret: settings.paypalClientSecret ?? process.env.PAYPAL_CLIENT_SECRET,
        baseUrl: process.env.PAYPAL_BASE_URL,
        callbackUrl: process.env.PAYPAL_BASE_URL,
      },
      rawSettings: settings,
    };
  }

  // default: Ghuba env fallback
  return {
    provider: "ghuba",
    credentials: { ...ghubaEnv },
    rawSettings: settings,
  };
}
