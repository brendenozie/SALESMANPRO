"use strict";
/**
 * lib/email/providers/SmtpProvider.ts
 *
 * High-performance, pooled SMTP provider implementation using Nodemailer.
 * Server-only execution with TLS validation, timeouts, and connection pooling.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmtpProvider = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const security_1 = require("../security");
class SmtpProvider {
    providerType = "SMTP";
    transporter;
    constructor(config) {
        const hostValidation = (0, security_1.validateSmtpHost)(config.host);
        if (!hostValidation.valid) {
            throw new Error(`SMTP Host rejected for security: ${hostValidation.reason}`);
        }
        const port = config.port || 587;
        const isSecure = config.secure ?? (port === 465);
        this.transporter = nodemailer_1.default.createTransport({
            host: config.host,
            port,
            secure: isSecure,
            auth: config.username && config.password ? {
                user: config.username,
                pass: config.password,
            } : undefined,
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 15000,
            tls: {
                rejectUnauthorized: process.env.NODE_ENV === "production",
            },
        });
    }
    async send(payload) {
        try {
            const fromFormatted = `"${payload.sender.fromName.replace(/"/g, "")}" <${payload.sender.fromEmail}>`;
            const replyToFormatted = payload.replyTo || payload.sender.replyTo || payload.sender.fromEmail;
            const info = await this.transporter.sendMail({
                from: fromFormatted,
                to: Array.isArray(payload.to) ? payload.to.join(", ") : payload.to,
                replyTo: replyToFormatted,
                subject: payload.subject,
                html: payload.html,
                text: payload.text,
                attachments: payload.attachments,
            });
            return {
                success: true,
                messageId: info.messageId,
                provider: "SMTP",
                accepted: Array.isArray(info.accepted) ? info.accepted.map(String) : [],
                rejected: Array.isArray(info.rejected) ? info.rejected.map(String) : [],
            };
        }
        catch (err) {
            console.error("[SmtpProvider] Send failed:", err.message);
            return {
                success: false,
                provider: "SMTP",
                error: err.message || "Failed to deliver email through SMTP",
            };
        }
    }
    async verifyConnection() {
        try {
            await this.transporter.verify();
            return { success: true };
        }
        catch (err) {
            const safeMessage = err.message
                ? err.message.replace(/pass=[^& ]+/gi, "pass=***")
                : "SMTP authentication or connection failed";
            return { success: false, error: safeMessage };
        }
    }
}
exports.SmtpProvider = SmtpProvider;
