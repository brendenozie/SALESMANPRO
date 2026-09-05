"use strict";
/**
 * lib/email/providers/providerFactory.ts
 *
 * Factory for creating and instantiating IEmailProvider instances from resolved configurations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFactory = void 0;
const SmtpProvider_1 = require("./SmtpProvider");
const ResendProvider_1 = require("./ResendProvider");
const SendGridProvider_1 = require("./SendGridProvider");
class ProviderFactory {
    static createProvider(type, credentials) {
        switch (type) {
            case "SMTP": {
                if (!credentials.host) {
                    throw new Error("SMTP provider requires a valid host");
                }
                return new SmtpProvider_1.SmtpProvider({
                    host: credentials.host,
                    port: credentials.port || 587,
                    secure: credentials.secure,
                    username: credentials.username,
                    password: credentials.password,
                });
            }
            case "RESEND": {
                if (!credentials.apiKey) {
                    throw new Error("Resend provider requires an apiKey");
                }
                return new ResendProvider_1.ResendProvider(credentials.apiKey);
            }
            case "SENDGRID": {
                if (!credentials.apiKey) {
                    throw new Error("SendGrid provider requires an apiKey");
                }
                return new SendGridProvider_1.SendGridProvider(credentials.apiKey);
            }
            default:
                throw new Error(`Unsupported email provider type: ${type}`);
        }
    }
}
exports.ProviderFactory = ProviderFactory;
