"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyPaymentConfig = void 0;
// lib/payments/index.ts
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const decrypt_1 = require("../payments/decrypt");
/**
 * Resolve effective provider config for a given company.
 * Logic:
 *  - If company PaymentSettings present and any provider enabled, use that provider (priority order below).
 *  - For Ghuba: if company has ghuba enabled use company creds; otherwise fallback to env GHUBA_*.
 *
 * Priority used here (you can change): ghuba -> mpesa -> paystack -> stripe -> paypal
 */
async function getCompanyPaymentConfig(companyId) {
    const ghubaEnv = {
        ghubaMerchantId: process.env.GHUBA_MERCHANT_ID,
        ghubaApiKey: process.env.GHUBA_API_KEY,
        baseUrl: process.env.GHUBA_BASE_URL,
        callbackUrl: process.env.GHUBA_CALLBACK_URL,
    };
    if (!companyId) {
        return { provider: "ghuba", credentials: ghubaEnv, rawSettings: null };
    }
    const company = await prismadb_1.default.company.findUnique({
        where: { id: companyId },
        include: { PaymentSettings: true },
    });
    const s = company?.PaymentSettings;
    if (!s) {
        return { provider: "ghuba", credentials: ghubaEnv, rawSettings: null };
    }
    // ───────────────── GHUBA ─────────────────
    if (s.isGhubaEnabled) {
        return {
            provider: "ghuba",
            credentials: {
                ghubaMerchantId: s.ghubaMerchantId ?? ghubaEnv.ghubaMerchantId,
                ghubaApiKey: (0, decrypt_1.decryptSecret)(s.ghubaSecret_encrypted, s.ghubaSecret_iv, s.ghubaSecret_tag) ?? ghubaEnv.ghubaApiKey,
                baseUrl: process.env.GHUBA_BASE_URL,
                callbackUrl: process.env.GHUBA_CALLBACK_URL,
            },
            rawSettings: s,
        };
    }
    // ───────────────── MPESA ─────────────────
    if (s.isMpesaEnabled) {
        return {
            provider: "mpesa",
            credentials: {
                consumerKey: s.mpesaConsumerKey,
                consumerSecret: (0, decrypt_1.decryptSecret)(s.mpesaSecret_encrypted, s.mpesaSecret_iv, s.mpesaSecret_tag),
                shortcode: s.mpesaShortcode,
                passkey: s.mpesaPasskey,
                callbackUrl: s.mpesaCallbackUrl,
                baseUrl: process.env.MPESA_BASE_URL,
            },
            rawSettings: s,
        };
    }
    if (s.isPaystackEnabled) {
        return {
            provider: "paystack",
            credentials: {
                secretKey: (0, decrypt_1.decryptSecret)(s.paystackSecret_encrypted, s.paystackSecret_iv, s.paystackSecret_tag) ?? process.env.PAYSTACK_SECRET_KEY,
                publicKey: s.paystackPublicKey ?? process.env.PAYSTACK_PUBLIC_KEY,
                baseUrl: process.env.PAYSTACK_BASE_URL,
                callbackUrl: process.env.PAYSTACK_CALLBACK_URL,
            },
            rawSettings: s,
        };
    }
    if (s.isStripeEnabled) {
        return {
            provider: "stripe",
            credentials: {
                secretKey: (0, decrypt_1.decryptSecret)(s.stripeSecret_encrypted, s.stripeSecret_iv, s.stripeSecret_tag) ?? process.env.STRIPE_SECRET_KEY,
                publishableKey: s.stripePublishableKey ?? process.env.STRIPE_PUBLISHABLE_KEY,
                callbackUrl: process.env.STRIPE_WEBHOOK_URL,
            },
            rawSettings: s,
        };
    }
    // if (s.isPaypalEnabled) {
    //   return {
    //     provider: "paypal",
    //     credentials: {
    //       clientId: s.paypalClientId ?? process.env.PAYPAL_CLIENT_ID!,
    //       clientSecret:
    //         decryptSecret(
    //           s.paypalClientSecret_encrypted,
    //           s.paypalClientSecret_iv,
    //           s.paypalClientSecret_tag,
    //         ) ?? process.env.PAYPAL_CLIENT_SECRET!,
    //       baseUrl: process.env.PAYPAL_BASE_URL!,
    //       callbackUrl: process.env.PAYPAL_WEBHOOK_URL!,
    //     },
    //     rawSettings: s,
    //   };
    // }
    // default: Ghuba env fallback
    return {
        provider: "ghuba",
        credentials: { ...ghubaEnv },
        rawSettings: s,
    };
}
exports.getCompanyPaymentConfig = getCompanyPaymentConfig;
