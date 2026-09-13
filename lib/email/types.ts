/**
 * lib/email/types.ts
 *
 * Core type definitions for the SalesmanPro Multi-Tenant Email Architecture.
 * Strictly separates server-side models from client-safe DTOs.
 */

export type EmailTenantType = "PLATFORM" | "GHUBA" | "STORE";

export type EmailProviderType = "SMTP" | "RESEND" | "SENDGRID";

export type EmailTemplateId =
  | "ACCOUNT_VERIFICATION"
  | "PASSWORD_RESET"
  | "WELCOME"
  | "ORDER_CONFIRMED"
  | "ORDER_STATUS_UPDATE"
  | "INQUIRY_REPLY"
  | "DIRECT_MESSAGE"
  | "CONTACT_SUBMISSION"
  | "BACKUP_ALERT"
  | "TEST_EMAIL"
  | "PROMOTIONAL_ANNOUNCEMENT"
  | "SYSTEM_COMMUNICATION";

export interface EmailSenderIdentity {
  fromName: string;
  fromEmail: string;
  replyTo?: string;
}

export interface DecryptedEmailCredentials {
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  password?: string;
  apiKey?: string;
}

export interface EmailBrandingContext {
  brandName: string;
  logoUrl?: string | null;
  primaryColor?: string;
  websiteUrl?: string;
  supportEmail?: string;
  supportPhone?: string | null;
  address?: string | null;
  currency?: string;
  socialLinks?: Record<string, string>;
}

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  sender: EmailSenderIdentity;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  provider: EmailProviderType;
  error?: string;
  accepted?: string[];
  rejected?: string[];
}

export interface SendEmailOptions {
  tenantType: EmailTenantType;
  companyId?: string; // Authoritative store / company ID if tenantType === "STORE"
  template: EmailTemplateId;
  recipient: string;
  data: Record<string, any>;
  replyTo?: string;
  async?: boolean; // Default true: uses BullMQ queue. Set false for direct sync sending (e.g. test email)
  idempotencyKey?: string;
}

export interface EmailConfigDTO {
  id?: string;
  scope: EmailTenantType;
  companyId?: string | null;
  provider: EmailProviderType;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string; // Displayed masked or empty
  hasPassword?: boolean;
  hasApiKey?: boolean;
  enabled: boolean;
  verified: boolean;
  verificationStatus: "UNVERIFIED" | "VERIFIED" | "FAILED";
  lastVerifiedAt?: string | null;
  lastError?: string | null;
}

export interface EmailDeliveryLogDTO {
  id: string;
  scope: string;
  companyId?: string | null;
  recipient: string;
  template: string;
  provider: string;
  fromAddress: string;
  status: "QUEUED" | "PROCESSING" | "SENT" | "FAILED";
  providerMessageId?: string | null;
  error?: string | null;
  attempts: number;
  createdAt: string;
  sentAt?: string | null;
}
