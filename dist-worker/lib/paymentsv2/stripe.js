"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateStripePaymentIntent = void 0;
// lib/payments/stripe.ts
const utils_1 = require("./utils");
/**
 * Minimal Stripe usage via HTTP. For a production app, use stripe-node SDK
 * which handles signing, retries, idempotency.
 */
async function initiateStripePaymentIntent(order, credentials) {
    const secret = credentials?.secretKey ?? process.env.STRIPE_SECRET_KEY;
    if (!secret)
        throw new Error("Stripe secret key missing");
    const amount = Math.max(50, Math.round((order.totalFinalPrice ?? order.totalPrice ?? 0) * 100)); // cents
    const currency = (order.currency ?? process.env.DEFAULT_CURRENCY ?? "KES").toLowerCase();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://salesmanpro.site";
    // 1. Try creating a hosted Stripe Checkout Session first for seamless browser redirects
    try {
        const sessionParams = new URLSearchParams();
        sessionParams.append("mode", "payment");
        sessionParams.append("payment_method_types[]", "card");
        sessionParams.append("line_items[0][price_data][currency]", currency);
        sessionParams.append("line_items[0][price_data][unit_amount]", String(amount));
        sessionParams.append("line_items[0][price_data][product_data][name]", `Order #${order.trackingNumber || order.id}`);
        sessionParams.append("line_items[0][quantity]", "1");
        sessionParams.append("success_url", `${baseUrl}/ecommerce/track?trackingNumber=${order.trackingNumber || order.id}&status=success`);
        sessionParams.append("cancel_url", `${baseUrl}/ecommerce/track?trackingNumber=${order.trackingNumber || order.id}&status=cancel`);
        sessionParams.append("metadata[order_id]", String(order.id ?? order.trackingNumber));
        const sRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${secret}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: sessionParams.toString(),
            // @ts-ignore
            signal: AbortSignal.timeout((0, utils_1.timeoutMs)()),
        });
        const sJson = await sRes.json().catch(() => null);
        if (sRes.ok && sJson?.url) {
            return sJson;
        }
    }
    catch {
        // Proceed to standard PaymentIntent fallback
    }
    // 2. Fallback to direct PaymentIntent
    const params = new URLSearchParams();
    params.append("amount", String(amount));
    params.append("currency", currency);
    params.append("payment_method_types[]", "card");
    params.append("metadata[order_id]", String(order.id ?? order.trackingNumber));
    const res = await fetch("https://api.stripe.com/v1/payment_intents", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
        // @ts-ignore
        signal: AbortSignal.timeout((0, utils_1.timeoutMs)()),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
        throw new Error(`Stripe PaymentIntent failed: ${res.status} ${JSON.stringify(json)}`);
    }
    return json;
}
exports.initiateStripePaymentIntent = initiateStripePaymentIntent;
