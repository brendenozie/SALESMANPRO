// lib/payments/index.ts

import prisma from "@/server/db/prismadb";// adjust to your prisma client path
import { PaymentSettings } from "@prisma/client";

export type ProviderConfig = {
  provider: "mpesa" | "paystack" | "ghuba" | "stripe" | "paypal" | "none";
  credentials: Record<string, any>;
  rawSettings?: PaymentSettings | null;
};

export async function getCompanyPaymentConfig(companyId?: string): Promise<ProviderConfig> {
  // fetch company + settings
  if (!companyId) {
    // fallback: decide global default
    return {
      provider: "ghuba",
      credentials: {
        ghubaMerchantId: process.env.GHUBA_MERCHANT_ID,
        ghubaApiKey: process.env.GHUBA_API_KEY,
        baseUrl: process.env.GHUBA_BASE_URL,
      },
    };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { PaymentSettings: true },
  });

  const settings = company?.PaymentSettings ?? null;

  // Prioritization: you can choose logic. Example: if isGhubaEnabled -> use ghuba (company credentials if provided else env)
  if (settings?.isGhubaEnabled) {
    return {
      provider: "ghuba",
      credentials: {
        ghubaMerchantId: settings.ghubaMerchantId ?? process.env.GHUBA_MERCHANT_ID,
        ghubaApiKey: settings.ghubaApiKey ?? process.env.GHUBA_API_KEY,
        baseUrl: process.env.GHUBA_BASE_URL,
      },
      rawSettings: settings,
    };
  }

  if (settings?.isMpesaEnabled) {
    return {
      provider: "mpesa",
      credentials: {
        consumerKey: settings.mpesaConsumerKey ?? process.env.MPESA_CONSUMER_KEY,
        consumerSecret: settings.mpesaConsumerSecret ?? process.env.MPESA_CONSUMER_SECRET,
        shortcode: settings.mpesaShortcode,
        callbackUrl: settings.mpesaCallbackUrl,
        baseUrl: process.env.MPESA_BASE_URL,
      },
      rawSettings: settings,
    };
  }

  if (settings?.isPaystackEnabled) {
    return {
      provider: "paystack",
      credentials: {
        secretKey: settings.paystackSecretKey ?? process.env.PAYSTACK_SECRET_KEY,
        publicKey: settings.paystackPublicKey ?? process.env.PAYSTACK_PUBLIC_KEY,
        baseUrl: process.env.PAYSTACK_BASE_URL,
      },
      rawSettings: settings,
    };
  }

  if (settings?.isStripeEnabled) {
    return {
      provider: "stripe",
      credentials: {
        secretKey: settings.stripeSecretKey ?? process.env.STRIPE_SECRET_KEY,
        publishableKey: settings.stripePublishableKey ?? process.env.STRIPE_PUBLISHABLE_KEY,
        baseUrl: process.env.STRIPE_BASE_URL,
      },
      rawSettings: settings,
    };
  }

  // default: ghuba fallback
  return {
    provider: "ghuba",
    credentials: {
      ghubaMerchantId: process.env.GHUBA_MERCHANT_ID,
      ghubaApiKey: process.env.GHUBA_API_KEY,
      baseUrl: process.env.GHUBA_BASE_URL,
    },
  };
}
