"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateGhubaPayment = void 0;
// lib/payments/ghuba.ts
const utils_1 = require("./utils");
async function initiateGhubaPayment(order, credentials) {
    const { ghubaMerchantId, ghubaApiKey, baseUrl = process.env.GHUBA_BASE_URL, callbackUrl = process.env.GHUBA_CALLBACK_URL } = credentials || {};
    if (!ghubaMerchantId || !ghubaApiKey) {
        throw new Error("Ghuba credentials missing");
    }
    const payload = {
        merchantId: ghubaMerchantId,
        amount: Math.round(order.totalFinalPrice ?? order.totalPrice ?? 0),
        currency: order.currency ?? process.env.DEFAULT_CURRENCY ?? "KES",
        orderId: order.id ?? order.trackingNumber,
        description: `Order ${order.trackingNumber}`,
        callbackUrl,
        metadata: { orderId: order.id, trackingNumber: order.trackingNumber },
    };
    const res = await fetch(`${baseUrl}/payments/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": ghubaApiKey,
        },
        body: JSON.stringify(payload),
        // @ts-ignore next-line
        signal: AbortSignal.timeout((0, utils_1.timeoutMs)()),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
        throw new Error(`Ghuba init failed: ${res.status} ${JSON.stringify(json)}`);
    }
    return json;
}
exports.initiateGhubaPayment = initiateGhubaPayment;
