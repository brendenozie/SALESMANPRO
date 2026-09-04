/**
 * lib/email/providers/providerFactory.ts
 *
 * Factory for creating and instantiating IEmailProvider instances from resolved configurations.
 */

import { IEmailProvider } from "./IEmailProvider";
import { SmtpProvider } from "./SmtpProvider";
import { ResendProvider } from "./ResendProvider";
import { SendGridProvider } from "./SendGridProvider";
import { DecryptedEmailCredentials, EmailProviderType } from "../types";

export class ProviderFactory {
  static createProvider(
    type: EmailProviderType,
    credentials: DecryptedEmailCredentials
  ): IEmailProvider {
    switch (type) {
      case "SMTP": {
        if (!credentials.host) {
          throw new Error("SMTP provider requires a valid host");
        }
        return new SmtpProvider({
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
        return new ResendProvider(credentials.apiKey);
      }

      case "SENDGRID": {
        if (!credentials.apiKey) {
          throw new Error("SendGrid provider requires an apiKey");
        }
        return new SendGridProvider(credentials.apiKey);
      }

      default:
        throw new Error(`Unsupported email provider type: ${type}`);
    }
  }
}
