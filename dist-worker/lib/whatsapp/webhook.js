"use strict";
/**
 * lib/whatsapp/webhook.ts
 *
 * Webhook verification, security validation, and payload normalization.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMetaWebhook = exports.normalizeMetaMessage = exports.getMetaVerifyToken = exports.verifyMetaWebhookSignature = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const normalizePhone_1 = require("./normalizePhone");
/**
 * Validates Meta X-Hub-Signature-256 HMAC header.
 */
function verifyMetaWebhookSignature(rawBody, signature, appSecret) {
    if (!signature || !appSecret || !rawBody) {
        return false;
    }
    try {
        const expected = "sha256=" +
            node_crypto_1.default.createHmac("sha256", appSecret).update(rawBody).digest("hex");
        const expectedBuffer = Buffer.from(expected, "utf8");
        const actualBuffer = Buffer.from(signature, "utf8");
        if (expectedBuffer.length !== actualBuffer.length) {
            return false;
        }
        return node_crypto_1.default.timingSafeEqual(expectedBuffer, actualBuffer);
    }
    catch (error) {
        console.error("[META_WEBHOOK_SIGNATURE_VERIFY_ERROR]", error);
        return false;
    }
}
exports.verifyMetaWebhookSignature = verifyMetaWebhookSignature;
/**
 * Resolves configured global Meta verify token.
 */
function getMetaVerifyToken() {
    const token = process.env.WHATSAPP_VERIFY_TOKEN;
    if (!token) {
        throw new Error("WHATSAPP_VERIFY_TOKEN environment variable is not configured.");
    }
    return token;
}
exports.getMetaVerifyToken = getMetaVerifyToken;
/**
 * Maps incoming Meta message type string to internal WhatsAppMessageType enum.
 */
function mapMessageType(type) {
    switch (type) {
        case "text":
            return "TEXT";
        case "image":
            return "IMAGE";
        case "video":
            return "VIDEO";
        case "audio":
            return "AUDIO";
        case "document":
            return "DOCUMENT";
        case "sticker":
            return "STICKER";
        case "location":
            return "LOCATION";
        case "contacts":
            return "CONTACT";
        case "interactive":
            return "INTERACTIVE";
        case "button":
            return "BUTTON";
        case "reaction":
            return "REACTION";
        default:
            return "UNKNOWN";
    }
}
/**
 * Normalizes raw Meta webhook message object into internal NormalizedWhatsAppMessage format.
 */
function normalizeMetaMessage(params) {
    const { companyId, accountId, phoneNumberId, contactName, message } = params;
    if (!message.id || !message.from) {
        return null;
    }
    const type = mapMessageType(message.type);
    const normalizedPhone = (0, normalizePhone_1.normalizePhoneNumber)(message.from);
    let text = null;
    let media = null;
    let location = null;
    let interactive = null;
    switch (message.type) {
        case "text":
            text = message.text?.body ?? null;
            break;
        case "image":
            media = {
                id: message.image?.id,
                mimeType: message.image?.mime_type,
                caption: message.image?.caption,
            };
            text = message.image?.caption ?? null;
            break;
        case "video":
            media = {
                id: message.video?.id,
                mimeType: message.video?.mime_type,
                caption: message.video?.caption,
            };
            text = message.video?.caption ?? null;
            break;
        case "audio":
            media = {
                id: message.audio?.id,
                mimeType: message.audio?.mime_type,
            };
            break;
        case "document":
            media = {
                id: message.document?.id,
                mimeType: message.document?.mime_type,
                caption: message.document?.caption,
                filename: message.document?.filename,
            };
            text = message.document?.caption ?? null;
            break;
        case "sticker":
            media = {
                id: message.sticker?.id,
                mimeType: message.sticker?.mime_type,
            };
            break;
        case "location":
            if (typeof message.location?.latitude === "number" &&
                typeof message.location?.longitude === "number") {
                location = {
                    latitude: message.location.latitude,
                    longitude: message.location.longitude,
                    name: message.location.name,
                    address: message.location.address,
                };
            }
            break;
        case "interactive":
            interactive = {
                type: message.interactive?.type,
                id: message.interactive?.button_reply?.id ??
                    message.interactive?.list_reply?.id,
                title: message.interactive?.button_reply?.title ??
                    message.interactive?.list_reply?.title,
                description: message.interactive?.list_reply?.description,
                payload: message.interactive,
            };
            // Use interactive title as text fallback if text was empty
            text = interactive.title ?? null;
            break;
        case "button":
            interactive = {
                type: "button",
                title: message.button?.text,
                id: message.button?.payload,
                payload: message.button,
            };
            text = message.button?.text ?? null;
            break;
        default:
            break;
    }
    return {
        provider: "META",
        providerMessageId: message.id,
        accountId,
        companyId,
        phoneNumberId,
        waId: message.from,
        phoneNumber: normalizedPhone,
        displayName: contactName,
        messageType: type,
        text,
        media,
        location,
        interactive,
        timestamp: new Date(Number(message.timestamp ?? "0") * 1000),
        rawPayload: message,
    };
}
exports.normalizeMetaMessage = normalizeMetaMessage;
function parseMetaWebhook(payload) {
    return payload;
}
exports.parseMetaWebhook = parseMetaWebhook;
