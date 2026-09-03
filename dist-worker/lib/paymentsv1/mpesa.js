"use strict";
// lib/payments/mpesa.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateMpesaPayment = exports.getMpesaAccessToken = void 0;
const TIMEOUT = Number(process.env.PAYMENTS_REQUEST_TIMEOUT_MS ?? 10000);
async function getMpesaAccessToken(consumerKey, consumerSecret, baseUrl) {
    if (!baseUrl) {
        throw new Error("Mpesa baseUrl is required");
    }
    const creds = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const url = `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`;
    const res = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Basic ${creds}`,
        },
        // timeout: TIMEOUT,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Mpesa token fetch failed: ${res.status} ${text}`);
    }
    return res.json();
}
exports.getMpesaAccessToken = getMpesaAccessToken;
async function initiateMpesaPayment(order, phoneNumber, credentials) {
    const { consumerKey, consumerSecret, shortcode, passkey, callbackUrl = "", baseUrl = process.env.MPESA_BASE_URL } = credentials;
    if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
        throw new Error("Mpesa credentials incomplete");
    }
    const tokenResp = await getMpesaAccessToken(consumerKey, consumerSecret, baseUrl);
    const token = tokenResp.access_token ?? tokenResp.accessToken;
    const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, 14); //  YYYYMMDDHHmmss
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
    const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(order.totalPrice),
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: `ORD-${order.id ?? order.trackingNumber ?? order._id ?? "N"}`,
        TransactionDesc: `Order ${order.id ?? order.trackingNumber}`,
    };
    const res = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        // timeout: TIMEOUT,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
        throw new Error(`Mpesa STK push failed: ${res.status} ${JSON.stringify(json)}`);
    }
    return json; // contains CheckoutRequestID etc.
}
exports.initiateMpesaPayment = initiateMpesaPayment;
