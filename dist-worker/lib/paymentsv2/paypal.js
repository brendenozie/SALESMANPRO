"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaypalOrder = void 0;
// lib/payments/paypal.ts
const utils_1 = require("./utils");
async function getPaypalAccessToken(clientId, clientSecret, baseUrl) {
    const id = clientId ?? process.env.PAYPAL_CLIENT_ID;
    const secret = clientSecret ?? process.env.PAYPAL_CLIENT_SECRET;
    const url = `${baseUrl ?? process.env.PAYPAL_BASE_URL}/v1/oauth2/token`;
    if (!id || !secret)
        throw new Error("PayPal credentials missing");
    const resp = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
        // @ts-ignore
        signal: AbortSignal.timeout((0, utils_1.timeoutMs)()),
    });
    if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        throw new Error(`PayPal token fetch failed: ${resp.status} ${txt}`);
    }
    const json = await resp.json();
    return json.access_token;
}
async function createPaypalOrder(order, credentials) {
    const baseUrl = credentials?.baseUrl ?? process.env.PAYPAL_BASE_URL;
    const token = await getPaypalAccessToken(credentials?.clientId, credentials?.clientSecret, baseUrl);
    const payload = {
        intent: "CAPTURE",
        purchase_units: [
            {
                reference_id: order.id ?? order.trackingNumber,
                amount: {
                    currency_code: order.currency ?? process.env.DEFAULT_CURRENCY ?? "KES",
                    value: String(order.totalFinalPrice ?? order.totalPrice ?? 0),
                },
            },
        ],
        application_context: {
            return_url: credentials?.callbackUrl ?? process.env.PAYPAL_BASE_URL,
            cancel_url: credentials?.callbackUrl ?? process.env.PAYPAL_BASE_URL,
        },
    };
    const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        // @ts-ignore
        signal: AbortSignal.timeout((0, utils_1.timeoutMs)()),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
        throw new Error(`PayPal order creation failed: ${res.status} ${JSON.stringify(json)}`);
    }
    return json;
}
exports.createPaypalOrder = createPaypalOrder;
