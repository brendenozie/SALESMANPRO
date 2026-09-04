import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { encryptEmailSecret, validateSmtpHost } from "@/lib/email/security";
import { EmailConfigDTO } from "@/lib/email/types";

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const companyId = auth.companyId;

    const config = await prisma.emailConfiguration.findFirst({
      where: { companyId, scope: "STORE" },
    });

    if (!config) {
      // Return unconfigured default state
      const defaultState: EmailConfigDTO = {
        scope: "STORE",
        companyId,
        provider: "SMTP",
        fromName: auth.companyName,
        fromEmail: "",
        replyTo: "",
        host: "",
        port: 587,
        secure: false,
        username: "",
        hasPassword: false,
        hasApiKey: false,
        enabled: true,
        verified: false,
        verificationStatus: "UNVERIFIED",
      };
      return formatResponse(true, defaultState, "No custom email configuration found (using platform fallback)", 200);
    }

    const responseDto: EmailConfigDTO = {
      id: config.id,
      scope: "STORE",
      companyId: config.companyId,
      provider: config.provider as any,
      fromName: config.fromName,
      fromEmail: config.fromEmail,
      replyTo: config.replyTo || undefined,
      host: config.host || undefined,
      port: config.port || 587,
      secure: config.secure ?? false,
      username: config.usernameEncrypted ? "***" : undefined,
      hasPassword: Boolean(config.passwordEncrypted),
      hasApiKey: Boolean(config.apiKeyEncrypted),
      enabled: config.enabled,
      verified: config.verified,
      verificationStatus: (config.verificationStatus as any) || "UNVERIFIED",
      lastVerifiedAt: config.lastVerifiedAt?.toISOString() || null,
      lastError: config.lastError || null,
    };

    return formatResponse(true, responseDto, "Email configuration fetched successfully", 200);
  } catch (err: any) {
    console.error("[EmailSettings API] GET error:", err);
    return formatResponse(false, null, err.message || "Failed to fetch email settings", err.statusCode || 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const companyId = auth.companyId;
    const body = await req.json();

    const {
      provider = "SMTP",
      fromName,
      fromEmail,
      replyTo,
      host,
      port,
      secure,
      username,
      password,
      apiKey,
      enabled = true,
    } = body;

    if (!fromName || !fromEmail) {
      return formatResponse(false, null, "From Name and From Email are required", 400);
    }

    if (provider === "SMTP") {
      if (!host) {
        return formatResponse(false, null, "SMTP Host is required for SMTP provider", 400);
      }
      const hostCheck = validateSmtpHost(host);
      if (!hostCheck.valid) {
        return formatResponse(false, null, `Invalid SMTP host: ${hostCheck.reason}`, 400);
      }
    }

    if ((provider === "RESEND" || provider === "SENDGRID") && !apiKey && !body.hasApiKey) {
      return formatResponse(false, null, `API Key is required for ${provider}`, 400);
    }

    // Existing config check to preserve existing credentials if not overwritten
    const existing = await prisma.emailConfiguration.findFirst({
      where: { companyId, scope: "STORE" },
    });

    let usernameEncrypted = existing?.usernameEncrypted || null;
    let usernameIv = existing?.usernameIv || null;
    let usernameTag = existing?.usernameTag || null;
    if (username && username !== "***") {
      const enc = encryptEmailSecret(username);
      usernameEncrypted = enc.value;
      usernameIv = enc.iv;
      usernameTag = enc.tag;
    }

    let passwordEncrypted = existing?.passwordEncrypted || null;
    let passwordIv = existing?.passwordIv || null;
    let passwordTag = existing?.passwordTag || null;
    if (password) {
      const enc = encryptEmailSecret(password);
      passwordEncrypted = enc.value;
      passwordIv = enc.iv;
      passwordTag = enc.tag;
    }

    let apiKeyEncrypted = existing?.apiKeyEncrypted || null;
    let apiKeyIv = existing?.apiKeyIv || null;
    let apiKeyTag = existing?.apiKeyTag || null;
    if (apiKey) {
      const enc = encryptEmailSecret(apiKey);
      apiKeyEncrypted = enc.value;
      apiKeyIv = enc.iv;
      apiKeyTag = enc.tag;
    }

    const saved = await prisma.emailConfiguration.upsert({
      where: { id: existing?.id || "000000000000000000000000" },
      create: {
        scope: "STORE",
        companyId,
        provider,
        fromName,
        fromEmail,
        replyTo: replyTo || null,
        host: host || null,
        port: port ? parseInt(port, 10) : 587,
        secure: Boolean(secure),
        usernameEncrypted,
        usernameIv,
        usernameTag,
        passwordEncrypted,
        passwordIv,
        passwordTag,
        apiKeyEncrypted,
        apiKeyIv,
        apiKeyTag,
        enabled: Boolean(enabled),
        verified: false,
        verificationStatus: "UNVERIFIED",
      },
      update: {
        provider,
        fromName,
        fromEmail,
        replyTo: replyTo || null,
        host: host || null,
        port: port ? parseInt(port, 10) : 587,
        secure: Boolean(secure),
        usernameEncrypted,
        usernameIv,
        usernameTag,
        passwordEncrypted,
        passwordIv,
        passwordTag,
        apiKeyEncrypted,
        apiKeyIv,
        apiKeyTag,
        enabled: Boolean(enabled),
      },
    });

    return formatResponse(
      true,
      {
        id: saved.id,
        provider: saved.provider,
        fromName: saved.fromName,
        fromEmail: saved.fromEmail,
        enabled: saved.enabled,
        verified: saved.verified,
      },
      "Email configuration updated successfully",
      200
    );
  } catch (err: any) {
    console.error("[EmailSettings API] POST error:", err);
    return formatResponse(false, null, err.message || "Failed to save email settings", err.statusCode || 500);
  }
}
