import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import prisma from "@/server/db/prismadb";
import { AUTH_URL } from "./domain";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

function transporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function createEmailVerificationToken(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + VERIFY_TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });
  return token;
}

export async function sendVerificationEmail(email: string, token: string, callbackUrl?: string) {
  const mailer = transporter();
  const verifyUrl = new URL("/verify-email", AUTH_URL);
  verifyUrl.searchParams.set("token", token);
  verifyUrl.searchParams.set("email", email);
  if (callbackUrl) verifyUrl.searchParams.set("callbackUrl", callbackUrl);

  if (!mailer) {
    return { sent: false, verifyUrl: verifyUrl.toString() };
  }

  await mailer.sendMail({
    from: process.env.EMAIL_FROM || '"SalesmanPro" <no-reply@salesmanpro.site>',
    to: email,
    subject: "Verify your SalesmanPro email",
    html: `<p>Confirm your email address to finish setting up your account.</p>
           <p><a href="${verifyUrl.toString()}">Verify email</a></p>
           <p>This link expires in 24 hours.</p>`,
  });

  return { sent: true, verifyUrl: verifyUrl.toString() };
}

export async function markEmailVerified(email: string) {
  await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
  });
}

export async function consumeVerificationToken(email: string, token: string): Promise<boolean> {
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });
  if (!record || record.expires < new Date()) {
    if (record) {
      await prisma.verificationToken.delete({ where: { id: record.id } }).catch(() => {});
    }
    return false;
  }
  await prisma.verificationToken.delete({ where: { id: record.id } });
  await markEmailVerified(email);
  return true;
}
