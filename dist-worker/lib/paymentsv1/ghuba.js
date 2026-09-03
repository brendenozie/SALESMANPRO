"use strict";
// lib/payments/ghuba.ts
// import fetch from "node-fetch";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateGhubaPayment = void 0;
const TIMEOUT = Number(process.env.PAYMENTS_REQUEST_TIMEOUT_MS ?? 10000);
async function initiateGhubaPayment(order, credentials) {
    const { ghubaMerchantId = process.env.GHUBA_MERCHANT_ID, ghubaApiKey = process.env.GHUBA_API_KEY, baseUrl = process.env.GHUBA_BASE_URL } = credentials;
    if (!ghubaMerchantId || !ghubaApiKey)
        throw new Error("Ghuba credentials missing");
    const res = await fetch(`${baseUrl}/payments/create`, {
        method: "POST",
        headers: {
            "X-API-KEY": ghubaApiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            merchantId: ghubaMerchantId,
            amount: Math.round(order.totalPrice),
            currency: order.currency ?? "KES",
            orderId: order.id,
            callbackUrl: process.env.GHUBA_CALLBACK_URL,
            metadata: { trackingNumber: order.trackingNumber },
        }),
        // timeout: TIMEOUT,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
        throw new Error(`Ghuba payment init failed: ${res.status} ${JSON.stringify(json)}`);
    }
    return json;
}
exports.initiateGhubaPayment = initiateGhubaPayment;
