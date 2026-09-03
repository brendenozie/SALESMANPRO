"use strict";
// lib/payments/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyPaymentConfig = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb")); // adjust to your prisma client path
async function getCompanyPaymentConfig(companyId) {
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
    const company = await prismadb_1.default.company.findUnique({
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
exports.getCompanyPaymentConfig = getCompanyPaymentConfig;
