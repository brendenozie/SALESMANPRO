"use strict";
/**
 * lib/email/providers/ResendProvider.ts
 *
 * Direct HTTPS REST client for Resend API.
 * Zero external package dependencies; uses native fetch for minimal bundle overhead.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendProvider = void 0;
class ResendProvider {
    providerType = "RESEND";
    apiKey;
    constructor(apiKey) {
        if (!apiKey || !apiKey.startsWith("re_")) {
            throw new Error("Invalid Resend API Key format (expected re_...)");
        }
        this.apiKey = apiKey;
    }
    async send(payload) {
        try {
            const fromFormatted = `"${payload.sender.fromName.replace(/"/g, "")}" <${payload.sender.fromEmail}>`;
            const toAddresses = Array.isArray(payload.to) ? payload.to : [payload.to];
            const replyTo = payload.replyTo || payload.sender.replyTo || payload.sender.fromEmail;
            const body = {
                from: fromFormatted,
                to: toAddresses,
                subject: payload.subject,
                html: payload.html,
            };
            if (payload.text)
                body.text = payload.text;
            if (replyTo)
                body.reply_to = replyTo;
            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) {
                return {
                    success: false,
                    provider: "RESEND",
                    error: data.message || `Resend error: ${res.statusText}`,
                };
            }
            return {
                success: true,
                messageId: data.id,
                provider: "RESEND",
                accepted: toAddresses,
            };
        }
        catch (err) {
            console.error("[ResendProvider] Send failed:", err.message);
            return {
                success: false,
                provider: "RESEND",
                error: err.message || "Network error connecting to Resend API",
            };
        }
    }
    async verifyConnection() {
        try {
            const res = await fetch("https://api.resend.com/api-keys", {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
            });
            if (!res.ok) {
                return { success: false, error: `Resend authentication failed (HTTP ${res.status})` };
            }
            return { success: true };
        }
        catch (err) {
            return { success: false, error: err.message || "Failed to reach Resend API" };
        }
    }
}
exports.ResendProvider = ResendProvider;
