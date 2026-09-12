/**
 * lib/email/contextResolver.ts
 *
 * Resolves authoritative branding, sender identity, and email provider configurations
 * across SalesmanPro, Ghuba, and individual store tenants.
 */

import prisma from "@/server/db/prismadb";
import {
  EmailBrandingContext,
  EmailSenderIdentity,
  EmailTenantType,
  EmailProviderType,
  DecryptedEmailCredentials,
} from "./types";
import { decryptEmailSecret } from "./security";

export interface ResolvedEmailContext {
  tenantType: EmailTenantType;
  companyId?: string;
  branding: EmailBrandingContext;
  sender: EmailSenderIdentity;
  providerType: EmailProviderType;
  credentials: DecryptedEmailCredentials;
  isCustomStoreProvider: boolean;
}

/**
 * Resolves the platform default SMTP/provider credentials from environment variables.
 */
function getPlatformDefaultCredentials(): {
  providerType: EmailProviderType;
  credentials: DecryptedEmailCredentials;
} {
  const providerType = (process.env.DEFAULT_EMAIL_PROVIDER || "SMTP").toUpperCase() as EmailProviderType;

  if (providerType === "RESEND") {
    return {
      providerType: "RESEND",
      credentials: { apiKey: process.env.RESEND_API_KEY },
    };
  }

  if (providerType === "SENDGRID") {
    return {
      providerType: "SENDGRID",
      credentials: { apiKey: process.env.SENDGRID_API_KEY },
    };
  }

  // Default SMTP fallback (supporting legacy SMTP_* and EMAIL_* variables)
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.hostinger.com";
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const username = process.env.SMTP_USER || process.env.EMAIL_USER;
  const password = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

  return {
    providerType: "SMTP",
    credentials: { host, port, secure, username, password },
  };
}

/**
 * Resolves the branding context for a given tenant type and company ID.
 */
export async function resolveBrandingContext(
  tenantType: EmailTenantType,
  companyId?: string
): Promise<EmailBrandingContext> {
  if (tenantType === "PLATFORM") {
    return {
      brandName: "SalesmanPro",
      logoUrl: "https://salesmanpro.site/logo.png",
      primaryColor: "#ea580c",
      websiteUrl: process.env.NEXTAUTH_URL || "https://salesmanpro.site",
      supportEmail: process.env.DEFAULT_REPLY_TO || "support@salesmanpro.site",
      supportPhone: "+254 732 771 353",
    };
  }

  if (tenantType === "GHUBA") {
    return {
      brandName: "Ghuba Marketplace",
      logoUrl: "https://salesmanpro.site/ghuba-logo.png",
      primaryColor: "#10b981",
      websiteUrl: "https://ghuba.shop",
      supportEmail: process.env.GHUBA_REPLY_TO || "support@ghuba.shop",
    };
  }

  // STORE Branding: Load authoritative company data from DB
  if (!companyId) {
    throw new Error("companyId is required to resolve STORE email branding");
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      name: true,
      logoUrl: true,
      contactEmail: true,
      contactPhone: true,
      address: true,
      domain: true,
      slug: true,
      currency: true,
    },
  });

  if (!company) {
    throw new Error(`Store with ID ${companyId} not found`);
  }

  const websiteUrl = company.domain
    ? `https://${company.domain}`
    : `https://salesmanpro.site/site/${company.slug}`;

  return {
    brandName: company.name,
    logoUrl: company.logoUrl,
    primaryColor: "#4f46e5", // Indigo accent for stores
    websiteUrl,
    supportEmail: company.contactEmail,
    supportPhone: company.contactPhone,
    address: company.address,
    currency: company.currency || "KES",
  };
}

/**
 * Authoritatively resolves the full email context:
 * - Brand identity
 * - Sender From/Reply-To
 * - Provider credentials (custom store provider vs platform fallback)
 */
export async function resolveEmailContext(
  tenantType: EmailTenantType,
  companyId?: string
): Promise<ResolvedEmailContext> {
  const branding = await resolveBrandingContext(tenantType, companyId);
  const platformDefaults = getPlatformDefaultCredentials();

  // 1. PLATFORM Context (SalesmanPro)
  if (tenantType === "PLATFORM") {
    return {
      tenantType: "PLATFORM",
      branding,
      sender: {
        fromName: process.env.DEFAULT_FROM_NAME || "SalesmanPro",
        fromEmail: process.env.DEFAULT_FROM_EMAIL || process.env.EMAIL_FROM || "no-reply@salesmanpro.site",
        replyTo: process.env.DEFAULT_REPLY_TO || "support@salesmanpro.site",
      },
      providerType: platformDefaults.providerType,
      credentials: platformDefaults.credentials,
      isCustomStoreProvider: false,
    };
  }

  // 2. GHUBA Context (Marketplace)
  if (tenantType === "GHUBA") {
    return {
      tenantType: "GHUBA",
      branding,
      sender: {
        fromName: process.env.GHUBA_FROM_NAME || "Ghuba",
        fromEmail: process.env.GHUBA_FROM_EMAIL || "no-reply@ghuba.shop",
        replyTo: process.env.GHUBA_REPLY_TO || "support@ghuba.shop",
      },
      providerType: platformDefaults.providerType,
      credentials: platformDefaults.credentials,
      isCustomStoreProvider: false,
    };
  }

  // 3. STORE Context
  if (!companyId) {
    throw new Error("companyId is required for STORE email context resolution");
  }

  // Look for store-specific email configuration in DB
  const storeConfig = await prisma.emailConfiguration.findFirst({
    where: {
      companyId,
      scope: "STORE",
      enabled: true,
    },
  });

  if (storeConfig) {
    // Custom store provider is configured
    const providerType = storeConfig.provider as EmailProviderType;
    const decryptedCreds: DecryptedEmailCredentials = {
      host: storeConfig.host || undefined,
      port: storeConfig.port || undefined,
      secure: storeConfig.secure ?? undefined,
      username: decryptEmailSecret({
        value: storeConfig.usernameEncrypted,
        iv: storeConfig.usernameIv,
        tag: storeConfig.usernameTag,
      }) || undefined,
      password: decryptEmailSecret({
        value: storeConfig.passwordEncrypted,
        iv: storeConfig.passwordIv,
        tag: storeConfig.passwordTag,
      }) || undefined,
      apiKey: decryptEmailSecret({
        value: storeConfig.apiKeyEncrypted,
        iv: storeConfig.apiKeyIv,
        tag: storeConfig.apiKeyTag,
      }) || undefined,
    };

    return {
      tenantType: "STORE",
      companyId,
      branding,
      sender: {
        fromName: storeConfig.fromName || branding.brandName,
        fromEmail: storeConfig.fromEmail,
        replyTo: storeConfig.replyTo || branding.supportEmail || storeConfig.fromEmail,
      },
      providerType,
      credentials: decryptedCreds,
      isCustomStoreProvider: true,
    };
  }

  // Fallback to Platform Provider Infrastructure while preserving Store Branding & Reply-To!
  const platformFromEmail =
    process.env.DEFAULT_FROM_EMAIL || process.env.EMAIL_FROM || "no-reply@salesmanpro.site";

  return {
    tenantType: "STORE",
    companyId,
    branding,
    sender: {
      fromName: branding.brandName,
      fromEmail: platformFromEmail, // Uses platform domain to avoid SPF/DKIM rejections
      replyTo: branding.supportEmail || platformFromEmail, // Directs replies to store
    },
    providerType: platformDefaults.providerType,
    credentials: platformDefaults.credentials,
    isCustomStoreProvider: false,
  };
}
