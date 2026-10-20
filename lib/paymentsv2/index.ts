// lib/paymentsv2/index.ts
import prisma from "@/server/db/prismadb";
import { ProviderConfig } from "./types";
import { decryptSecret } from "../payments/decrypt";
import {
  getPlatformMpesaCredentials,
  getPlatformPaystackCredentials,
  getPlatformTillCredentials,
} from "../payments/resolver";

/**
 * Resolve effective provider config for a given company.
 * Bridges legacy calls to canonical platform defaults when store is Ghuba-managed.
 */
export async function getCompanyPaymentConfig(
  companyId?: string,
): Promise<ProviderConfig> {
  const platformMpesa = getPlatformMpesaCredentials();
  const platformPaystack = getPlatformPaystackCredentials();
  const platformTill = getPlatformTillCredentials();

  if (!companyId) {
    return {
      provider: "paystack",
      credentials: platformPaystack,
      rawSettings: null,
    };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { PaymentSettings: true },
  });

  const s = company?.PaymentSettings;
  if (!s || s.isGhubaEnabled) {
    // Ghuba-managed: Uses platform default Paystack & M-Pesa
    return {
      provider: "ghuba",
      credentials: {
        ...platformPaystack,
        mpesa: platformMpesa,
        till: platformTill,
      },
      rawSettings: s || null,
    };
  }

  // ───────────────── MERCHANT MPESA ─────────────────
  if (s.isMpesaEnabled && s.mpesaConsumerKey) {
    const consumerSecret = s.mpesaSecret_encrypted
      ? decryptSecret(s.mpesaSecret_encrypted, s.mpesaSecret_iv, s.mpesaSecret_tag)
      : s.mpesaConsumerSecret;

    return {
      provider: "mpesa",
      credentials: {
        consumerKey: s.mpesaConsumerKey,
        consumerSecret: consumerSecret || "",
        shortcode: s.mpesaShortcode || "",
        passkey: s.mpesaPasskey || "",
        callbackUrl:
          s.mpesaCallbackUrl ||
          `${process.env.NEXT_PUBLIC_BASE_URL || "https://salesmanpro.store"}/api/mpesa/callback`,
        baseUrl: process.env.MPESA_BASE_URL || "https://api.safaricom.co.ke",
      },
      rawSettings: s,
    };
  }

  // ───────────────── MERCHANT PAYSTACK ─────────────────
  if (s.isPaystackEnabled) {
    const secretKey = s.paystackSecret_encrypted
      ? decryptSecret(s.paystackSecret_encrypted, s.paystackSecret_iv, s.paystackSecret_tag)
      : s.paystackSecretKey;

    return {
      provider: "paystack",
      credentials: {
        secretKey: secretKey || platformPaystack.secretKey,
        publicKey: s.paystackPublicKey || platformPaystack.publicKey,
        baseUrl: platformPaystack.baseUrl,
        callbackUrl: platformPaystack.callbackUrl,
      },
      rawSettings: s,
    };
  }

  // ───────────────── MERCHANT STRIPE ─────────────────
  if (s.isStripeEnabled) {
    const secretKey = s.stripeSecret_encrypted
      ? decryptSecret(s.stripeSecret_encrypted, s.stripeSecret_iv, s.stripeSecret_tag)
      : s.stripeSecretKey;

    return {
      provider: "stripe",
      credentials: {
        secretKey: secretKey || process.env.STRIPE_SECRET_KEY || "",
        publishableKey: s.stripePublishableKey || process.env.STRIPE_PUBLISHABLE_KEY || "",
        callbackUrl: process.env.STRIPE_WEBHOOK_URL || "",
      },
      rawSettings: s,
    };
  }

  // ───────────────── MERCHANT PAYPAL ─────────────────
  if (s.isPaypalEnabled) {
    const clientSecret = s.paypalSecret_encrypted
      ? decryptSecret(s.paypalSecret_encrypted, s.paypalSecret_iv, s.paypalSecret_tag)
      : s.paypalClientSecret;

    return {
      provider: "paypal",
      credentials: {
        clientId: s.paypalClientId || process.env.PAYPAL_CLIENT_ID || "",
        clientSecret: clientSecret || process.env.PAYPAL_CLIENT_SECRET || "",
        baseUrl: process.env.PAYPAL_BASE_URL || "https://api-m.paypal.com",
        callbackUrl: process.env.PAYPAL_WEBHOOK_URL || "",
      },
      rawSettings: s,
    };
  }

  // Default fallback to Ghuba-managed defaults
  return {
    provider: "ghuba",
    credentials: {
      ...platformPaystack,
      mpesa: platformMpesa,
      till: platformTill,
    },
    rawSettings: s,
  };
}
