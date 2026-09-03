"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateMpesaPayment = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const cache_1 = require("@/lib/cache");
const MPESA_BASE_URL = process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke";
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || "";
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || "";
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || "";
/**
 * Cache Safaricom Daraja OAuth access token for 50 minutes (valid for 3600s).
 * Eliminates 500-2000ms latency on every checkout attempt.
 */
async function getMpesaToken() {
    const cacheKey = `daraja:oauth:token:${process.env.MPESA_CONSUMER_KEY || "default"}`;
    return (0, cache_1.fetchWithCache)(cacheKey, async () => {
        const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try {
            const res = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
                headers: { Authorization: `Basic ${auth}` },
                signal: controller.signal,
            });
            clearTimeout(timer);
            if (!res.ok) {
                throw new Error(`Daraja OAuth failed with HTTP ${res.status}`);
            }
            const data = await res.json();
            return data.access_token;
        }
        catch (err) {
            clearTimeout(timer);
            throw new Error(`Failed to fetch M-Pesa token: ${err.message}`);
        }
    }, { ttlSeconds: 3000 });
}
async function initiateMpesaPayment(order, phoneNumber) {
    const formattedPhone = formatPhone(phoneNumber);
    const token = await getMpesaToken();
    const timestamp = generateTimestamp();
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString("base64");
    const payload = {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: order.totalFinalPrice ? Math.round(order.totalFinalPrice) : 1,
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: String(order.id),
        TransactionDesc: `Payment for order ${order.id}`,
    };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
        const res = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
        clearTimeout(timer);
        const result = await res.json();
        if (result.ResponseCode === "0") {
            await prismadb_1.default.customerOrder.update({
                where: { id: order.id },
                data: {
                    trackingNumber: result.CheckoutRequestID,
                    transactionReference: result.MerchantRequestID,
                    paymentMethod: "MPESA",
                    paymentStatus: "PENDING",
                },
            });
        }
        return result;
    }
    catch (err) {
        clearTimeout(timer);
        throw new Error(`M-Pesa STK push error: ${err.message}`);
    }
}
exports.initiateMpesaPayment = initiateMpesaPayment;
function generateTimestamp() {
    const date = new Date();
    const tzOffset = date.getTimezoneOffset() * 60000;
    const kenyaTime = new Date(date.getTime() + 3 * 60 * 60 * 1000);
    return kenyaTime
        .toISOString()
        .replace(/[-:TZ.]/g, "")
        .slice(0, 14);
}
function formatPhone(phone) {
    // Remove spaces
    phone = phone.replace(/\s+/g, "");
    // If starts with +254 → convert to 254
    if (phone.startsWith("+254"))
        return phone.replace("+254", "254");
    // If starts with 07 → convert to 2547
    if (phone.startsWith("07"))
        return phone.replace(/^0/, "254");
    // If already 2547XXXXXXXX → keep it
    if (phone.startsWith("2547"))
        return phone;
    throw new Error("Invalid phone number format");
}
