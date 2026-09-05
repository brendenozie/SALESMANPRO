"use strict";
/**
 * lib/whatsapp/metaClient.ts
 *
 * Production Meta WhatsApp Cloud API Client.
 * Supports text, images, documents, audio, interactive buttons,
 * interactive lists, message templates, status updates, and order/payment notifications.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaWhatsAppClient = void 0;
const DEFAULT_GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION ?? "v21.0";
const GRAPH_BASE = process.env.WHATSAPP_GRAPH_BASE_URL ??
    `https://graph.facebook.com/${DEFAULT_GRAPH_VERSION}`;
class MetaWhatsAppClient {
    accessToken;
    phoneNumberId;
    timeoutMs;
    constructor(options) {
        if (!options.accessToken || !options.phoneNumberId) {
            throw new Error("WhatsApp credentials missing: accessToken and phoneNumberId are required.");
        }
        this.accessToken = options.accessToken;
        this.phoneNumberId = options.phoneNumberId;
        this.timeoutMs = options.timeoutMs ?? 15000;
    }
    async request(path, init = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const response = await fetch(`${GRAPH_BASE}${path}`, {
                ...init,
                signal: controller.signal,
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                    ...(init.headers ?? {}),
                },
                cache: "no-store",
            });
            clearTimeout(timeoutId);
            const body = await response.json().catch(() => null);
            if (!response.ok) {
                const errorMsg = body?.error?.message ??
                    `Meta WhatsApp API request failed with HTTP ${response.status}`;
                console.error("[META_WHATSAPP_API_ERROR]", {
                    status: response.status,
                    error: errorMsg,
                    code: body?.error?.code,
                    subcode: body?.error?.error_subcode,
                    path,
                });
                throw new Error(errorMsg);
            }
            return body;
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === "AbortError") {
                throw new Error(`Meta WhatsApp API timeout after ${this.timeoutMs}ms on ${path}`);
            }
            throw error;
        }
    }
    // ─── Standard Messages ──────────────────────────────────────────────────────
    async sendTextMessage(params) {
        return this.request(`/${this.phoneNumberId}/messages`, {
            method: "POST",
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: params.to,
                type: "text",
                text: {
                    preview_url: params.previewUrl ?? false,
                    body: params.body,
                },
            }),
        });
    }
    async sendImageMessage(params) {
        return this.request(`/${this.phoneNumberId}/messages`, {
            method: "POST",
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: params.to,
                type: "image",
                image: {
                    link: params.imageUrl,
                    caption: params.caption,
                },
            }),
        });
    }
    async sendDocumentMessage(params) {
        return this.request(`/${this.phoneNumberId}/messages`, {
            method: "POST",
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: params.to,
                type: "document",
                document: {
                    link: params.documentUrl,
                    filename: params.filename,
                    caption: params.caption,
                },
            }),
        });
    }
    async sendAudioMessage(params) {
        return this.request(`/${this.phoneNumberId}/messages`, {
            method: "POST",
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: params.to,
                type: "audio",
                audio: {
                    link: params.audioUrl,
                },
            }),
        });
    }
    // ─── Interactive Messages ───────────────────────────────────────────────────
    async sendInteractiveButtons(params) {
        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: params.to,
            type: "interactive",
            interactive: {
                type: "button",
                ...(params.header ? { header: params.header } : {}),
                body: { text: params.body },
                ...(params.footer ? { footer: { text: params.footer } } : {}),
                action: {
                    buttons: params.buttons.slice(0, 3).map((button) => ({
                        type: "reply",
                        reply: {
                            id: button.id,
                            title: button.title.slice(0, 20),
                        },
                    })),
                },
            },
        };
        return this.request(`/${this.phoneNumberId}/messages`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }
    async sendListMessage(params) {
        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: params.to,
            type: "interactive",
            interactive: {
                type: "list",
                ...(params.header ? { header: params.header } : {}),
                body: { text: params.body },
                ...(params.footer ? { footer: { text: params.footer } } : {}),
                action: {
                    button: params.buttonText.slice(0, 20),
                    sections: params.sections.map((section) => ({
                        title: section.title?.slice(0, 24),
                        rows: section.rows.slice(0, 10).map((row) => ({
                            id: row.id,
                            title: row.title.slice(0, 24),
                            description: row.description?.slice(0, 72),
                        })),
                    })),
                },
            },
        };
        return this.request(`/${this.phoneNumberId}/messages`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }
    // ─── Status & Read Receipts ─────────────────────────────────────────────────
    async markMessageAsRead(messageId) {
        try {
            await this.request(`/${this.phoneNumberId}/messages`, {
                method: "POST",
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    status: "read",
                    message_id: messageId,
                }),
            });
            return true;
        }
        catch {
            return false;
        }
    }
    // ─── Template Messages ──────────────────────────────────────────────────────
    async sendTemplateMessage(params) {
        const components = params.components ? [...params.components] : [];
        if (params.bodyParameters && params.bodyParameters.length > 0) {
            components.push({
                type: "body",
                parameters: params.bodyParameters.map((text) => ({
                    type: "text",
                    text,
                })),
            });
        }
        if (params.buttonPayload) {
            components.push({
                type: "button",
                sub_type: "quick_reply",
                index: "0",
                parameters: [{ type: "payload", payload: params.buttonPayload }],
            });
        }
        return this.request(`/${this.phoneNumberId}/messages`, {
            method: "POST",
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: params.to,
                type: "template",
                template: {
                    name: params.templateName,
                    language: { code: params.languageCode || "en_US" },
                    components: components.length > 0 ? components : undefined,
                },
            }),
        });
    }
    // ─── High-Level Notifications ───────────────────────────────────────────────
    async sendOrderConfirmation(params) {
        const currency = params.currency ?? "KES";
        const formattedTotal = new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency,
        }).format(params.total);
        const body = [
            `🎉 *Order Confirmed!*`,
            ``,
            `Hello ${params.name}, your order has been received.`,
            ``,
            `📦 *Tracking #:* ${params.trackingNumber}`,
            `💰 *Total:* ${formattedTotal}`,
            params.itemsSummary ? `📋 *Items:* ${params.itemsSummary}` : "",
            ``,
            `We will notify you once your order is on the way!`,
        ]
            .filter(Boolean)
            .join("\n");
        return this.sendTextMessage({
            to: params.phone,
            body,
        });
    }
    async sendPaymentReceivedNotification(params) {
        const currency = params.currency ?? "KES";
        const formattedAmount = new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency,
        }).format(params.amount);
        const body = [
            `✅ *Payment Received Successfully!*`,
            ``,
            `Your payment of *${formattedAmount}* for Order *#${params.trackingNumber}* has been confirmed.`,
            `🧾 *Receipt:* ${params.receiptNumber}`,
            ``,
            `Thank you for shopping with us!`,
        ].join("\n");
        return this.sendTextMessage({
            to: params.phone,
            body,
        });
    }
    async registerOutreachTemplate(params) {
        const name = params.templateName || "salesmanpro_merchant_outreach";
        return this.request(`/${params.wabaId}/message_templates`, {
            method: "POST",
            body: JSON.stringify({
                name,
                category: "MARKETING",
                language: "en_US",
                components: [
                    {
                        type: "HEADER",
                        format: "TEXT",
                        text: "SalesmanPro Merchant Growth",
                    },
                    {
                        type: "BODY",
                        text: "Hello {{1}}, we noticed {{2}} and wanted to show you how our mobile storefront, WhatsApp commerce, and M-Pesa automated ordering can boost your sales. Reply YES to see a quick 2-minute demo!",
                        example: {
                            body_text: [["Merchant Partner", "your business presence in Kenya"]],
                        },
                    },
                    {
                        type: "FOOTER",
                        text: "SalesmanPro Merchant Solutions",
                    },
                    {
                        type: "BUTTONS",
                        buttons: [
                            {
                                type: "QUICK_REPLY",
                                text: "Request Demo",
                            },
                            {
                                type: "QUICK_REPLY",
                                text: "Not Interested",
                            },
                        ],
                    },
                ],
            }),
        });
    }
}
exports.MetaWhatsAppClient = MetaWhatsAppClient;
