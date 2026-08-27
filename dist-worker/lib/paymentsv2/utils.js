"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moneyToSmallestUnit = exports.timeoutMs = exports.nowIso = void 0;
// lib/payments/utils.ts
function nowIso() {
    return new Date().toISOString();
}
exports.nowIso = nowIso;
function timeoutMs() {
    return Number(process.env.PAYMENTS_REQUEST_TIMEOUT_MS ?? 15000);
}
exports.timeoutMs = timeoutMs;
function moneyToSmallestUnit(amount, currency = "KES") {
    // For KES and many currencies we store whole currency amount (no cents).
    // For Paystack (NGN) or Stripe, they expect kobo/cents.
    // We'll return object {amountInProviderUnits, multiplier}
    const lower = currency.toUpperCase();
    if (["USD", "EUR", "NGN"].includes(lower)) {
        return Math.round(amount * 100); // cents / kobo
    }
    // default: assume no decimals for KES
    return Math.round(amount);
}
exports.moneyToSmallestUnit = moneyToSmallestUnit;
