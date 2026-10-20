/**
 * lib/payments/resolver.ts
 *
 * Canonical Payment Ownership and Credential Resolution Engine.
 * Resolves authoritative payment configuration and credentials based on:
 * 1. Payment Purpose (PLATFORM vs STORE)
 * 2. Store Payment Management Option (GHUBA-MANAGED vs MERCHANT-MANAGED)
 * 3. Payment Provider (MPESA, PAYSTACK, STRIPE, PAYPAL, TILL, CASH, COD)
 *
 * CRITICAL SECURITY RULES:
 * - Runs strictly on the server-side.
 * - Never returns raw secret keys to client-facing requests.
 * - Platform revenue (AI credits, subscriptions) ALWAYS uses PLATFORM_DEFAULT credentials.
 * - Ghuba-managed stores ALWAYS use PLATFORM_DEFAULT credentials for collection,
 *   while downstream attribution records store payables and platform commission.
 * - Merchant-managed stores use their own decrypted credentials; never silently
 *   redirects merchant funds without authorization.
 */

import prisma from "@/server/db/prismadb";
import { decryptSecret } from "./decrypt";

export type PaymentProvider =
  | "MPESA"
  | "PAYSTACK"
  | "STRIPE"
  | "PAYPAL"
  | "TILL"
  | "CASH"
  | "COD"
  | "SPLIT";

export type PaymentOwnership =
  | "GHUBA_MANAGED"
  | "MERCHANT_MANAGED"
  | "PLATFORM"
  | "MANUAL";

export type PaymentPurpose =
  | "ORDER"
  | "AI_CREDIT_TOPUP"
  | "SUBSCRIPTION"
  | "PLATFORM_SERVICE"
  | "DELIVERY"
  | "RIDER_PAYOUT"
  | "AD_WALLET_TOPUP";

export type CredentialSource =
  | "PLATFORM_DEFAULT"
  | "MERCHANT_CONFIGURED";

export interface MpesaCredentials {
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  callbackUrl: string;
  baseUrl: string;
  transactionType: "CustomerPayBillOnline" | "CustomerBuyGoodsOnline";
  partyB?: string;
}

export interface PaystackCredentials {
  secretKey: string;
  publicKey: string;
  baseUrl: string;
  callbackUrl: string;
}

export interface StripeCredentials {
  secretKey: string;
  publishableKey: string;
  webhookUrl?: string;
}

export interface PaypalCredentials {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  webhookUrl?: string;
}

export interface TillCredentials {
  tillNumber: string;
  accountName: string;
  instructions: string;
}

export interface ResolvedPaymentConfiguration {
  provider: PaymentProvider;
  ownership: PaymentOwnership;
  credentialSource: CredentialSource;
  purpose: PaymentPurpose;
  storeId?: string | null;
  companyName?: string | null;
  credentials:
    | MpesaCredentials
    | PaystackCredentials
    | StripeCredentials
    | PaypalCredentials
    | TillCredentials
    | Record<string, any>;
  mpesa?: MpesaCredentials;
  paystack?: PaystackCredentials;
  till?: TillCredentials;
  metadata?: Record<string, any>;
}

export interface ResolvePaymentOptions {
  purpose: PaymentPurpose;
  provider: PaymentProvider;
  storeId?: string | null;
}

/**
 * Returns platform default M-Pesa configuration from environment variables.
 * Automatically resolves verified Live credentials when available.
 */
export function getPlatformMpesaCredentials(): MpesaCredentials {
  const envSetting = (process.env.MPESA_ENVIRONMENT || "").toLowerCase();
  const hasLiveKeys = Boolean(process.env.MPESA_LIVE_CONSUMER_KEY && process.env.MPESA_LIVE_SHORTCODE);

  // Authoritatively use live mode if configured as live, in production, or if live production keys exist and not explicitly forced to sandbox
  const isLive =
    envSetting === "live" ||
    (process.env.NODE_ENV || "").toLowerCase() === "production" ||
    (hasLiveKeys && envSetting !== "sandbox");

  const consumerKey = (isLive ? process.env.MPESA_LIVE_CONSUMER_KEY : null) || process.env.MPESA_CONSUMER_KEY || "";
  const consumerSecret = (isLive ? process.env.MPESA_LIVE_CONSUMER_SECRET : null) || process.env.MPESA_CONSUMER_SECRET || "";
  const shortcode = (isLive ? process.env.MPESA_LIVE_SHORTCODE : null) || process.env.MPESA_SHORTCODE || "";
  const passkey = (isLive ? process.env.MPESA_LIVE_PASSKEY : null) || process.env.MPESA_PASSKEY || process.env.MPESA_PASS_KEY || "";
  const callbackUrl =
    process.env.MPESA_CALLBACK_URL ||
    `${process.env.NEXT_PUBLIC_BASE_URL || "https://salesmanpro.store"}/api/mpesa/callback`;
  const baseUrl =
    (isLive ? process.env.MPESA_LIVE_BASE_URL : null) ||
    process.env.MPESA_BASE_URL ||
    (isLive ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke");
  const transactionType =
    (isLive ? (process.env.MPESA_LIVE_TRANSACTION_TYPE as any) : null) ||
    (process.env.MPESA_TRANSACTION_TYPE as any) ||
    (shortcode.length === 7 ? "CustomerBuyGoodsOnline" : "CustomerPayBillOnline");
  const partyB =
    (isLive ? process.env.MPESA_LIVE_PARTY_B : null) ||
    process.env.MPESA_PARTY_B ||
    (transactionType === "CustomerBuyGoodsOnline" ? (process.env.PLATFORM_MPESA_TILL || "537214") : shortcode);

  return {
    consumerKey,
    consumerSecret,
    shortcode,
    passkey,
    callbackUrl,
    baseUrl,
    transactionType,
    partyB,
  };
}

/**
 * Returns platform default Paystack configuration from environment variables.
 * Automatically resolves verified Live credentials when available.
 */
export function getPlatformPaystackCredentials(): PaystackCredentials {
  const envSetting = (process.env.PAYSTACK_ENVIRONMENT || "").toLowerCase();
  const mpesaEnv = (process.env.MPESA_ENVIRONMENT || "").toLowerCase();
  const hasLiveKeys = Boolean(process.env.PAYSTACK_LIVE_SECRET_KEY);

  const isLive =
    envSetting === "live" ||
    (process.env.NODE_ENV || "").toLowerCase() === "production" ||
    mpesaEnv === "live" ||
    (hasLiveKeys && envSetting !== "test" && envSetting !== "sandbox");

  const secretKey =
    (isLive ? process.env.PAYSTACK_LIVE_SECRET_KEY : null) ||
    process.env.PAYSTACK_SECRET_KEY ||
    process.env.PAYSTACK_SECRET ||
    "";
  const publicKey =
    (isLive ? process.env.PAYSTACK_LIVE_PUBLIC_KEY : null) ||
    process.env.PAYSTACK_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_PAYSTACK_LIVE_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
    "";
  const baseUrl =
    process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";
  const callbackUrl =
    process.env.PAYSTACK_CALLBACK_URL ||
    `${process.env.NEXT_PUBLIC_BASE_URL || "https://salesmanpro.store"}/payments/paystack/callback`;

  return {
    secretKey,
    publicKey,
    baseUrl,
    callbackUrl,
  };
}

export function getAuthoritativePaystackSecret(): string {
  return getPlatformPaystackCredentials().secretKey;
}

export function getAuthoritativePaystackPublicKey(): string {
  return getPlatformPaystackCredentials().publicKey;
}

/**
 * Returns platform default Till Number configuration.
 */
export function getPlatformTillCredentials(): TillCredentials {
  return {
    tillNumber: process.env.PLATFORM_MPESA_TILL || "537214",
    accountName: "GHUBA / SALESMANPRO",
    instructions: "Go to M-Pesa > Lipa na M-Pesa > Buy Goods and Services > Enter Till Number 537214",
  };
}

/**
 * Authoritative Centralized Payment Configuration Resolver.
 */
export async function resolvePaymentConfiguration(
  options: ResolvePaymentOptions
): Promise<ResolvedPaymentConfiguration> {
  const { purpose, provider, storeId } = options;
  const pUpper = provider.toUpperCase() as PaymentProvider;

  // 1. PLATFORM OWNED PAYMENTS (AI Credits, Subscriptions, Platform Services, Ad Wallet)
  // These ALWAYS route to platform default credentials regardless of storeId.
  if (
    purpose === "AI_CREDIT_TOPUP" ||
    purpose === "SUBSCRIPTION" ||
    purpose === "PLATFORM_SERVICE" ||
    purpose === "AD_WALLET_TOPUP"
  ) {
    if (pUpper === "MPESA") {
      const creds = getPlatformMpesaCredentials();
      return {
        provider: "MPESA",
        ownership: "PLATFORM",
        credentialSource: "PLATFORM_DEFAULT",
        purpose,
        storeId: storeId ?? null,
        credentials: creds,
        mpesa: creds,
      };
    }

    if (pUpper === "PAYSTACK") {
      const creds = getPlatformPaystackCredentials();
      return {
        provider: "PAYSTACK",
        ownership: "PLATFORM",
        credentialSource: "PLATFORM_DEFAULT",
        purpose,
        storeId: storeId ?? null,
        credentials: creds,
        paystack: creds,
      };
    }

    if (pUpper === "TILL") {
      const creds = getPlatformTillCredentials();
      return {
        provider: "TILL",
        ownership: "PLATFORM",
        credentialSource: "PLATFORM_DEFAULT",
        purpose,
        storeId: storeId ?? null,
        credentials: creds,
        till: creds,
      };
    }

    throw new Error(`Unsupported payment provider for platform purpose ${purpose}: ${provider}`);
  }

  // 2. RIDER PAYOUTS (Platform disbursement to riders)
  if (purpose === "RIDER_PAYOUT") {
    // Rider payouts are funded from Ghuba escrow / platform delivery liabilities
    return {
      provider: pUpper,
      ownership: "PLATFORM",
      credentialSource: "PLATFORM_DEFAULT",
      purpose: "RIDER_PAYOUT",
      storeId: storeId ?? null,
      credentials: pUpper === "MPESA" ? getPlatformMpesaCredentials() : getPlatformPaystackCredentials(),
    };
  }

  // 3. STORE CHECKOUT PAYMENTS (ORDERS & DELIVERIES)
  if (purpose === "ORDER" || purpose === "DELIVERY") {
    // Handle offline / counter options
    if (pUpper === "CASH" || pUpper === "COD" || pUpper === "SPLIT") {
      return {
        provider: pUpper,
        ownership: "MANUAL",
        credentialSource: "MERCHANT_CONFIGURED",
        purpose,
        storeId: storeId ?? null,
        credentials: {},
      };
    }

    if (!storeId) {
      // Marketplace / universal checkout without single store context defaults to Ghuba
      if (pUpper === "MPESA") {
        return {
          provider: "MPESA",
          ownership: "GHUBA_MANAGED",
          credentialSource: "PLATFORM_DEFAULT",
          purpose,
          storeId: null,
          credentials: getPlatformMpesaCredentials(),
        };
      }
      if (pUpper === "PAYSTACK") {
        return {
          provider: "PAYSTACK",
          ownership: "GHUBA_MANAGED",
          credentialSource: "PLATFORM_DEFAULT",
          purpose,
          storeId: null,
          credentials: getPlatformPaystackCredentials(),
        };
      }
      if (pUpper === "TILL") {
        return {
          provider: "TILL",
          ownership: "GHUBA_MANAGED",
          credentialSource: "PLATFORM_DEFAULT",
          purpose,
          storeId: null,
          credentials: getPlatformTillCredentials(),
        };
      }
    }

    // Load store payment settings from database
    const company = await prisma.company.findUnique({
      where: { id: storeId! },
      include: { PaymentSettings: true },
    });

    const s = company?.PaymentSettings;

    // Check if store is Ghuba-Managed
    // A store is Ghuba-managed if isGhubaEnabled is true OR if company has no custom credentials configured
    const isGhubaManaged =
      Boolean(s?.isGhubaEnabled) ||
      (!s?.isMpesaEnabled && !s?.isPaystackEnabled && !s?.isStripeEnabled && !s?.isPaypalEnabled);

    if (isGhubaManaged) {
      if (pUpper === "MPESA") {
        return {
          provider: "MPESA",
          ownership: "GHUBA_MANAGED",
          credentialSource: "PLATFORM_DEFAULT",
          purpose,
          storeId,
          companyName: company?.name,
          credentials: getPlatformMpesaCredentials(),
        };
      }

      if (pUpper === "PAYSTACK") {
        return {
          provider: "PAYSTACK",
          ownership: "GHUBA_MANAGED",
          credentialSource: "PLATFORM_DEFAULT",
          purpose,
          storeId,
          companyName: company?.name,
          credentials: getPlatformPaystackCredentials(),
        };
      }

      if (pUpper === "TILL") {
        return {
          provider: "TILL",
          ownership: "GHUBA_MANAGED",
          credentialSource: "PLATFORM_DEFAULT",
          purpose,
          storeId,
          companyName: company?.name,
          credentials: getPlatformTillCredentials(),
        };
      }
    }

    // MERCHANT-MANAGED PAYMENT RESOLUTION
    if (pUpper === "MPESA") {
      if (!s?.isMpesaEnabled || !s.mpesaConsumerKey || !s.mpesaShortcode) {
        throw new Error(
          `Store '${company?.name || storeId}' has not configured merchant M-Pesa credentials. Please enable Ghuba Payments or configure Daraja API.`
        );
      }

      const consumerSecret = s.mpesaSecret_encrypted
        ? decryptSecret(s.mpesaSecret_encrypted, s.mpesaSecret_iv, s.mpesaSecret_tag)
        : s.mpesaConsumerSecret;

      if (!consumerSecret) {
        throw new Error(`Merchant M-Pesa secret decryption failed for store '${company?.name || storeId}'.`);
      }

      return {
        provider: "MPESA",
        ownership: "MERCHANT_MANAGED",
        credentialSource: "MERCHANT_CONFIGURED",
        purpose,
        storeId,
        companyName: company?.name,
        credentials: {
          consumerKey: s.mpesaConsumerKey,
          consumerSecret,
          shortcode: s.mpesaShortcode,
          passkey: s.mpesaPasskey || "",
          callbackUrl:
            s.mpesaCallbackUrl ||
            `${process.env.NEXT_PUBLIC_BASE_URL || "https://salesmanpro.store"}/api/mpesa/callback`,
          baseUrl: process.env.MPESA_BASE_URL || "https://api.safaricom.co.ke",
          transactionType: "CustomerPayBillOnline",
          partyB: s.mpesaShortcode,
        },
      };
    }

    if (pUpper === "PAYSTACK") {
      if (!s?.isPaystackEnabled) {
        throw new Error(
          `Store '${company?.name || storeId}' has not enabled merchant Paystack payments.`
        );
      }

      const secretKey = s.paystackSecret_encrypted
        ? decryptSecret(s.paystackSecret_encrypted, s.paystackSecret_iv, s.paystackSecret_tag)
        : s.paystackSecretKey;

      if (!secretKey) {
        throw new Error(`Merchant Paystack secret decryption failed for store '${company?.name || storeId}'.`);
      }

      return {
        provider: "PAYSTACK",
        ownership: "MERCHANT_MANAGED",
        credentialSource: "MERCHANT_CONFIGURED",
        purpose,
        storeId,
        companyName: company?.name,
        credentials: {
          secretKey,
          publicKey: s.paystackPublicKey || "",
          baseUrl: "https://api.paystack.co",
          callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://salesmanpro.store"}/payments/paystack/callback`,
        },
      };
    }

    if (pUpper === "STRIPE") {
      if (!s?.isStripeEnabled) {
        throw new Error(`Store '${company?.name || storeId}' has not enabled Stripe.`);
      }

      const secretKey = s.stripeSecret_encrypted
        ? decryptSecret(s.stripeSecret_encrypted, s.stripeSecret_iv, s.stripeSecret_tag)
        : s.stripeSecretKey;

      return {
        provider: "STRIPE",
        ownership: "MERCHANT_MANAGED",
        credentialSource: "MERCHANT_CONFIGURED",
        purpose,
        storeId,
        companyName: company?.name,
        credentials: {
          secretKey: secretKey || process.env.STRIPE_SECRET_KEY || "",
          publishableKey: s.stripePublishableKey || process.env.STRIPE_PUBLISHABLE_KEY || "",
          webhookUrl: process.env.STRIPE_WEBHOOK_URL,
        },
      };
    }

    if (pUpper === "PAYPAL") {
      if (!s?.isPaypalEnabled) {
        throw new Error(`Store '${company?.name || storeId}' has not enabled PayPal.`);
      }

      const clientSecret = s.paypalSecret_encrypted
        ? decryptSecret(s.paypalSecret_encrypted, s.paypalSecret_iv, s.paypalSecret_tag)
        : s.paypalClientSecret;

      return {
        provider: "PAYPAL",
        ownership: "MERCHANT_MANAGED",
        credentialSource: "MERCHANT_CONFIGURED",
        purpose,
        storeId,
        companyName: company?.name,
        credentials: {
          clientId: s.paypalClientId || process.env.PAYPAL_CLIENT_ID || "",
          clientSecret: clientSecret || process.env.PAYPAL_CLIENT_SECRET || "",
          baseUrl: process.env.PAYPAL_BASE_URL || "https://api-m.paypal.com",
          webhookUrl: process.env.PAYPAL_WEBHOOK_URL,
        },
      };
    }

    if (pUpper === "TILL") {
      // If store has a custom Till number configured, use it. Otherwise, fallback to Ghuba Till
      const storeTill = (s as any)?.tillNumber;
      if (storeTill) {
        return {
          provider: "TILL",
          ownership: "MERCHANT_MANAGED",
          credentialSource: "MERCHANT_CONFIGURED",
          purpose,
          storeId,
          companyName: company?.name,
          credentials: {
            tillNumber: storeTill,
            accountName: company?.name || "Merchant Store",
            instructions: `Go to M-Pesa > Lipa na M-Pesa > Buy Goods and Services > Enter Till Number ${storeTill}`,
          },
        };
      }

      return {
        provider: "TILL",
        ownership: "GHUBA_MANAGED",
        credentialSource: "PLATFORM_DEFAULT",
        purpose,
        storeId,
        companyName: company?.name,
        credentials: getPlatformTillCredentials(),
      };
    }
  }

  throw new Error(`Unable to determine payment ownership for provider ${provider} and purpose ${purpose}`);
}
