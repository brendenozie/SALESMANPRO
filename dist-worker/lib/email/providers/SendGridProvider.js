"use strict";
/**
 * lib/email/providers/SendGridProvider.ts
 *
 * Direct HTTPS REST client for SendGrid v3 API.
 * Uses native fetch for minimal dependencies.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridProvider = void 0;
class SendGridProvider {
    providerType = "SENDGRID";
    apiKey;
    constructor(apiKey) {
        if (!apiKey || !apiKey.startsWith("SG.")) {
            throw new Error("Invalid SendGrid API Key format (expected SG....)");
        }
        this.apiKey = apiKey;
    }
    async send(payload) {
        try {
            const toAddresses = Array.isArray(payload.to) ? payload.to : [payload.to];
            const personalizations = [
                {
                    to: toAddresses.map((email) => ({ email: email.trim() })),
                },
            ];
            const fromObj = {
                email: payload.sender.fromEmail,
            };
            if (payload.sender.fromName) {
                fromObj.name = payload.sender.fromName;
            }
            const body = {
                personalizations,
                from: fromObj,
                subject: payload.subject,
                content: [
                    {
                        type: "text/html",
                        value: payload.html,
                    },
                ],
            };
            if (payload.text) {
                body.content.unshift({
                    type: "text/plain",
                    value: payload.text,
                });
            }
            const replyTo = payload.replyTo || payload.sender.replyTo;
            if (replyTo) {
                body.reply_to = { email: replyTo };
            }
            const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            if (res.status === 202 || res.status === 200) {
                const messageId = res.headers.get("x-message-id") || `sg_${Date.now()}`;
                return {
                    success: true,
                    messageId,
                    provider: "SENDGRID",
                    accepted: toAddresses,
                };
            }
            const errData = await res.json().catch(() => ({}));
            const errorMsg = errData.errors?.[0]?.message || `SendGrid rejected request with status ${res.status}`;
            return {
                success: false,
                provider: "SENDGRID",
                error: errorMsg,
            };
        }
        catch (err) {
            console.error("[SendGridProvider] Send failed:", err.message);
            return {
                success: false,
                provider: "SENDGRID",
                error: err.message || "Network error connecting to SendGrid API",
            };
        }
    }
    async verifyConnection() {
        try {
            const res = await fetch("https://api.sendgrid.com/v3/scopes", {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
            });
            if (!res.ok) {
                return {
                    success: false,
                    error: `SendGrid authentication failed (HTTP ${res.status})`,
                };
            }
            return { success: true };
        }
        catch (err) {
            return {
                success: false,
                error: err.message || "Failed to reach SendGrid API",
            };
        }
    }
}
exports.SendGridProvider = SendGridProvider;
