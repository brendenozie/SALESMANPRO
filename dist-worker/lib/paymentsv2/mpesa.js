"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateMpesaPayment = void 0;
// lib/payments/mpesa.ts
const utils_1 = require("./utils");
async function getAccessToken(consumerKey, consumerSecret, baseUrl) {
    if (!consumerKey || !consumerSecret)
        throw new Error("Mpesa consumer credentials missing");
    const creds = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const url = `${baseUrl ?? process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
    const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Basic ${creds}` },
        // @ts-ignore
        signal: AbortSignal.timeout((0, utils_1.timeoutMs)()),
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Mpesa token error: ${res.status} ${txt}`);
    }
    const json = await res.json();
    return json.access_token ?? json.accessToken ?? json;
}
async function initiateMpesaPayment(order, phoneNumber, credentials) {
    const { consumerKey, consumerSecret, shortcode, passkey, callbackUrl, baseUrl } = credentials || {};
    if (!consumerKey || !consumerSecret || !shortcode || !passkey)
        throw new Error("Mpesa credentials incomplete");
    const token = await getAccessToken(consumerKey, consumerSecret, baseUrl);
    const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
    const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(order.totalFinalPrice ?? order.totalPrice ?? 0),
        PartyA: formatPhone(phoneNumber),
        PartyB: shortcode,
        PhoneNumber: formatPhone(phoneNumber),
        CallBackURL: callbackUrl ?? process.env.MPESA_CALLBACK_URL,
        AccountReference: `ORD-${order.id ?? order.trackingNumber}`,
        TransactionDesc: `Payment for order ${order.trackingNumber}`,
    };
    const res = await fetch(`${baseUrl ?? process.env.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
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
        throw new Error(`Mpesa STK push failed: ${res.status} ${JSON.stringify(json)}`);
    }
    return json;
}
exports.initiateMpesaPayment = initiateMpesaPayment;
const normalizePhone_1 = require("@/lib/whatsapp/normalizePhone");
function formatPhone(phone) {
    const normalized = (0, normalizePhone_1.normalizePhoneNumber)(phone);
    if (/^254\d{9}$/.test(normalized)) {
        return normalized;
    }
    throw new Error("Invalid phone number format. Expected format: 2547XXXXXXXX or 2541XXXXXXXX");
}
