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
