"use strict";
/**
 * M-Pesa STK Push POS Tender & Real-Time Settlement Service
 *
 * Handles Daraja Lipa Na M-Pesa Online (STK Push) initiation,
 * real-time webhook callback processing, and status polling for POS checkout.
 * Gracefully provides dev simulation when live Daraja credentials are not configured.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDarajaWebhookCallback = exports.getStkTransactionStatus = exports.initiateStkPush = exports.normalizeMpesaPhone = void 0;
const index_1 = require("@/lib/paymentsv2/index");
if (!global.__mpesaPosTransactions) {
    global.__mpesaPosTransactions = new Map();
}
const transactionStore = global.__mpesaPosTransactions;
/**
 * Normalizes phone numbers to Safaricom 254XXXXXXXXX standard format.
 */
function normalizeMpesaPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 10) {
        return `254${digits.substring(1)}`;
    }
    if (digits.startsWith('254') && digits.length === 12) {
        return digits;
    }
    if (digits.startsWith('+254')) {
        return digits.substring(1);
    }
    if (digits.length === 9) {
        return `254${digits}`;
    }
    return digits;
}
exports.normalizeMpesaPhone = normalizeMpesaPhone;
/**
 * Initiates an STK Push to the customer's phone.
 * Prioritizes the store's custom payment credentials, using Ghuba platform defaults as backup.
 */
async function initiateStkPush(params) {
    const normalizedPhone = normalizeMpesaPhone(params.phone);
    if (!normalizedPhone || normalizedPhone.length !== 12 || !normalizedPhone.startsWith('254')) {
        return {
            success: false,
            error: 'Invalid Kenyan phone number format. Please provide e.g. 0712345678 or 254712345678.',
        };
    }
    const roundedAmount = Math.max(1, Math.round(params.amount));
    const accountRef = (params.accountReference || 'POS-ORDER').substring(0, 12);
    const desc = (params.transactionDesc || 'POS Store Payment').substring(0, 30);
    // 1. Resolve store's custom payment settings, falling back to Ghuba/default platform settings
    let consumerKey = process.env.MPESA_CONSUMER_KEY;
    let consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    let passkey = process.env.MPESA_PASSKEY;
    let shortcode = process.env.MPESA_SHORTCODE || process.env.MPESA_BUSINESS_SHORT_CODE;
    let callbackUrl = process.env.MPESA_CALLBACK_URL || `${process.env.NEXTAUTH_URL || 'https://salesmanpro.store'}/api/pos/mpesa/callback`;
    let isStoreSpecific = false;
    try {
        if (params.companyId) {
            const paymentConfig = await (0, index_1.getCompanyPaymentConfig)(params.companyId);
            if (paymentConfig) {
                if (paymentConfig.provider === 'mpesa' && paymentConfig.credentials) {
                    // Store has its own dedicated M-Pesa Till / Paybill credentials
                    const creds = paymentConfig.credentials;
                    if (creds.consumerKey && creds.consumerSecret && creds.shortcode) {
                        consumerKey = creds.consumerKey;
                        consumerSecret = creds.consumerSecret;
                        shortcode = creds.shortcode;
                        passkey = creds.passkey || passkey;
                        if (creds.callbackUrl)
                            callbackUrl = creds.callbackUrl;
                        isStoreSpecific = true;
                    }
                }
                else if (paymentConfig.provider === 'ghuba' && paymentConfig.credentials) {
                    // Store uses Ghuba as default payment: uses Ghuba platform M-Pesa
                    const creds = paymentConfig.credentials;
                    const ghubaMpesa = creds.mpesa;
                    if (ghubaMpesa?.consumerKey && ghubaMpesa?.consumerSecret && ghubaMpesa?.shortcode) {
                        consumerKey = ghubaMpesa.consumerKey;
                        consumerSecret = ghubaMpesa.consumerSecret;
                        shortcode = ghubaMpesa.shortcode;
                        passkey = ghubaMpesa.passkey || passkey;
                        if (ghubaMpesa.callbackUrl)
                            callbackUrl = ghubaMpesa.callbackUrl;
                    }
                }
            }
        }
    }
    catch (cfgErr) {
        console.warn('[M-Pesa Service] Could not resolve store payment config, falling back to platform defaults:', cfgErr);
    }
    const hasLiveCredentials = !!(consumerKey && consumerSecret && passkey && shortcode);
    if (!hasLiveCredentials) {
        // -------------------------------------------------------------------------
        // DEV / SANDBOX SIMULATION
        // Generates a mock checkout request and schedules an automated payment confirmation
        // -------------------------------------------------------------------------
        const mockCheckoutId = `ws_CO_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const mockMerchantId = `MERCH_${Date.now()}`;
        const record = {
            checkoutRequestId: mockCheckoutId,
            merchantRequestId: mockMerchantId,
            companyId: params.companyId,
            phone: normalizedPhone,
            amount: roundedAmount,
            accountReference: accountRef,
            status: 'PENDING',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        transactionStore.set(mockCheckoutId, record);
        // Auto-confirm after 3.5 seconds to simulate customer entering their PIN on the phone
        setTimeout(() => {
            const existing = transactionStore.get(mockCheckoutId);
            if (existing && existing.status === 'PENDING') {
                const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                const randLetters = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
                const randDigits = Math.floor(100000 + Math.random() * 900000);
                const mockReceipt = `Q${randLetters}${randDigits}`;
                existing.status = 'COMPLETED';
                existing.mpesaReceiptNumber = mockReceipt;
                existing.resultDesc = 'The service request is processed successfully.';
                existing.transactionDate = new Date().toISOString();
                existing.updatedAt = Date.now();
                transactionStore.set(mockCheckoutId, existing);
            }
        }, 3500);
        return {
            success: true,
            checkoutRequestId: mockCheckoutId,
            merchantRequestId: mockMerchantId,
            customerMessage: `Success. STK Push sent to ${normalizedPhone}. Customer will enter PIN.`,
            isSimulated: true,
        };
    }
    try {
        // 1. Fetch OAuth Token from Safaricom Daraja
        const authHeader = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        const authUrl = process.env.NODE_ENV === 'production' && !process.env.MPESA_SANDBOX
            ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
            : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
        const tokenRes = await fetch(authUrl, {
            method: 'GET',
            headers: { Authorization: `Basic ${authHeader}` },
        });
        if (!tokenRes.ok) {
            const errText = await tokenRes.text();
            throw new Error(`Daraja OAuth token request failed: ${errText}`);
        }
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        // 2. Prepare Daraja STK Push Payload
        const timestamp = new Date()
            .toISOString()
            .replace(/[^0-9]/g, '')
            .slice(0, 14); // YYYYMMDDHHmmss
        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
        const stkUrl = process.env.NODE_ENV === 'production' && !process.env.MPESA_SANDBOX
            ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
            : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
        const stkPayload = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: roundedAmount,
            PartyA: normalizedPhone,
            PartyB: shortcode,
            PhoneNumber: normalizedPhone,
            CallBackURL: callbackUrl,
            AccountReference: accountRef,
            TransactionDesc: desc,
        };
        const stkRes = await fetch(stkUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(stkPayload),
        });
        const stkData = await stkRes.json();
        if (stkData.ResponseCode === '0') {
            const record = {
                checkoutRequestId: stkData.CheckoutRequestID,
                merchantRequestId: stkData.MerchantRequestID,
                companyId: params.companyId,
                phone: normalizedPhone,
                amount: roundedAmount,
                accountReference: accountRef,
                status: 'PENDING',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            transactionStore.set(stkData.CheckoutRequestID, record);
            return {
                success: true,
                checkoutRequestId: stkData.CheckoutRequestID,
                merchantRequestId: stkData.MerchantRequestID,
                responseCode: stkData.ResponseCode,
                responseDescription: stkData.ResponseDescription,
                customerMessage: stkData.CustomerMessage,
                isSimulated: false,
            };
        }
        else {
            return {
                success: false,
                responseCode: stkData.ResponseCode,
                responseDescription: stkData.ResponseDescription,
                error: stkData.ResponseDescription || 'M-Pesa STK push request failed.',
            };
        }
    }
    catch (err) {
        console.error('[M-Pesa Service] STK push error:', err);
        return {
            success: false,
            error: err.message || 'Network error communicating with Safaricom Daraja.',
        };
    }
}
exports.initiateStkPush = initiateStkPush;
/**
 * Returns current status of an STK push transaction.
 */
function getStkTransactionStatus(checkoutRequestId) {
    const record = transactionStore.get(checkoutRequestId);
    if (!record)
        return null;
    // Auto-expire after 90 seconds if still pending
    if (record.status === 'PENDING' && Date.now() - record.createdAt > 90000) {
        record.status = 'TIMEOUT';
        record.resultDesc = 'Customer failed to complete M-Pesa PIN prompt within 90 seconds.';
        record.updatedAt = Date.now();
        transactionStore.set(checkoutRequestId, record);
    }
    return record;
}
exports.getStkTransactionStatus = getStkTransactionStatus;
/**
 * Safaricom Daraja Webhook Callback Handler
 */
function handleDarajaWebhookCallback(callbackBody) {
    try {
        const stkCallback = callbackBody?.Body?.stkCallback;
        if (!stkCallback) {
            return { success: false };
        }
        const checkoutId = stkCallback.CheckoutRequestID;
        const resultCode = stkCallback.ResultCode;
        const resultDesc = stkCallback.ResultDesc;
        const record = transactionStore.get(checkoutId);
        if (!record) {
            console.warn(`[M-Pesa Callback] No pending record found for CheckoutRequestID: ${checkoutId}`);
            return { success: false };
        }
        if (resultCode === 0) {
            // Success
            let receipt = '';
            let date = '';
            const items = stkCallback.CallbackMetadata?.Item || [];
            for (const item of items) {
                if (item.Name === 'MpesaReceiptNumber')
                    receipt = item.Value;
                if (item.Name === 'TransactionDate')
                    date = String(item.Value);
            }
            record.status = 'COMPLETED';
            record.mpesaReceiptNumber = receipt;
            record.transactionDate = date;
            record.resultDesc = resultDesc;
            record.updatedAt = Date.now();
        }
        else {
            // User cancelled, wrong PIN, or insufficient balance
            record.status = 'FAILED';
            record.resultDesc = resultDesc;
            record.updatedAt = Date.now();
        }
        transactionStore.set(checkoutId, record);
        return { success: true, record };
    }
    catch (err) {
        console.error('[M-Pesa Callback] Failed to parse webhook:', err);
        return { success: false };
    }
}
exports.handleDarajaWebhookCallback = handleDarajaWebhookCallback;
