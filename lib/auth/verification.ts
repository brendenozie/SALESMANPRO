import { randomBytes } from "crypto";
import prisma from "@/server/db/prismadb";
import { AUTH_URL } from "./domain";
import { EmailService } from "@/lib/email/emailService";
import { EmailTenantType } from "@/lib/email/types";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export async function createEmailVerificationToken(
  email: string,
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + VERIFY_TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });
  return token;
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  callbackUrl?: string,
  options?: { tenantType?: EmailTenantType; companyId?: string },
) {
  const verifyUrl = new URL("/verify-email", AUTH_URL);
  verifyUrl.searchParams.set("token", token);
  verifyUrl.searchParams.set("email", email);
  if (callbackUrl) verifyUrl.searchParams.set("callbackUrl", callbackUrl);

  const verificationLink = verifyUrl.toString();

  const tenantType = options?.tenantType || (options?.companyId ? "STORE" : "PLATFORM");

  try {
    const result = await EmailService.sendEmail({
      tenantType,
      companyId: options?.companyId,
      template: "ACCOUNT_VERIFICATION",
      recipient: email,
      data: {
        verificationLink,
      },
      async: false,
    });

    return { sent: result.success, verifyUrl: verificationLink };
  } catch (err: any) {
    console.error("[VerificationEmail] Dispatch error:", err.message);
    return { sent: false, verifyUrl: verificationLink };
  }
}

export async function markEmailVerified(email: string) {
  await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
  });
}

export async function consumeVerificationToken(
  email: string,
  token: string,
): Promise<boolean> {
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });
  if (!record || record.expires < new Date()) {
    if (record) {
      await prisma.verificationToken
        .delete({ where: { id: record.id } })
        .catch(() => {});
    }
    return false;
  }
  await prisma.verificationToken.delete({ where: { id: record.id } });
  await markEmailVerified(email);
  return true;
}

export interface ResendVerificationResult {
  success: boolean;
  message: string;
  alreadyVerified?: boolean;
  cooldownRemainingSeconds?: number;
}

export async function resendVerificationEmail(
  email: string,
  callbackUrl?: string,
): Promise<ResendVerificationResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { success: false, message: "A valid email address is required." };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, emailVerified: true, companyId: true },
  });

  if (!user) {
    // Return friendly generic success to prevent email enumeration
    return {
      success: true,
      message: "If an account with this email exists and requires verification, a new link has been sent.",
    };
  }

  if (user.emailVerified === true) {
    return {
      success: true,
      alreadyVerified: true,
      message: "This email address is already verified. You can sign in now.",
    };
  }

  // Rate-limiting check: if a token exists and was created less than 60s ago
  const existing = await prisma.verificationToken.findFirst({
    where: { identifier: normalizedEmail },
    orderBy: { expires: "desc" },
  });

  if (existing) {
    const expiresMs = existing.expires.getTime();
    const approxCreatedMs = expiresMs - VERIFY_TTL_MS;
    const elapsedMs = Date.now() - approxCreatedMs;
    const cooldownMs = 60 * 1000;

    if (elapsedMs < cooldownMs && elapsedMs >= 0) {
      const remainingSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
      return {
        success: false,
        cooldownRemainingSeconds: remainingSeconds,
        message: `Please wait ${remainingSeconds} second${remainingSeconds > 1 ? "s" : ""} before requesting another verification email.`,
      };
    }
  }

  const token = await createEmailVerificationToken(normalizedEmail);
  const sendResult = await sendVerificationEmail(
    normalizedEmail,
    token,
    callbackUrl,
    user.companyId
      ? { tenantType: "STORE", companyId: user.companyId }
      : { tenantType: "PLATFORM" }
  );

  if (!sendResult.sent) {
    return {
      success: false,
      message: "Failed to dispatch verification email. Please try again shortly.",
    };
  }

  return {
    success: true,
    message: "A new verification email has been sent. Please check your inbox.",
  };
}

