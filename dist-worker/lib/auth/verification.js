"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeVerificationToken = exports.markEmailVerified = exports.sendVerificationEmail = exports.createEmailVerificationToken = void 0;
//@ts-ignore
const crypto_1 = require("crypto");
const nodemailer_1 = __importDefault(require("nodemailer"));
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const domain_1 = require("./domain");
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
function transporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER)
        return null;
    return nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}
async function createEmailVerificationToken(email) {
    const token = (0, crypto_1.randomBytes)(32).toString("hex");
    const expires = new Date(Date.now() + VERIFY_TTL_MS);
    await prismadb_1.default.verificationToken.deleteMany({ where: { identifier: email } });
    await prismadb_1.default.verificationToken.create({
        data: { identifier: email, token, expires },
    });
    return token;
}
exports.createEmailVerificationToken = createEmailVerificationToken;
async function sendVerificationEmail(email, token, callbackUrl) {
    const mailer = transporter();
    const verifyUrl = new URL("/verify-email", domain_1.AUTH_URL);
    verifyUrl.searchParams.set("token", token);
    verifyUrl.searchParams.set("email", email);
    if (callbackUrl)
        verifyUrl.searchParams.set("callbackUrl", callbackUrl);
    const verificationLink = verifyUrl.toString();
    if (!mailer) {
        return { sent: false, verifyUrl: verificationLink };
    }
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Account email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; border-spacing: 0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 40px; text-align: center;">
              <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Salesman<span style="color: #f97316;">Pro</span>
              </span>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 40px 40px 32px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a; text-align: center; letter-spacing: -0.3px;">
                Verify your email address
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;">
                Welcome to SalesmanPro! Please confirm your email address to complete your account activation and access your dashboard.
              </p>

              <!-- Call To Action Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationLink}" target="_blank" style="display: inline-block; background-color: #ea580c; background-image: linear-gradient(to right, #ea580c, #f59e0b); color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.5; color: #64748b; text-align: center;">
                This link will expire in <strong>24 hours</strong>.
              </p>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 24px 0;" />

              <!-- Fallback Direct Link -->
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #64748b; text-align: left;">
                Button not working? Copy and paste this link into your browser:
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.5; word-break: break-all; color: #ea580c;">
                <a href="${verificationLink}" style="color: #ea580c; text-decoration: underline;">${verificationLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">
                If you didn't create an account with SalesmanPro, you can safely ignore this email.
              </p>
              <p style="margin: 0; font-size: 12px; color: #cbd5e1;">
                &copy; ${new Date().getFullYear()} SalesmanPro. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
    await mailer.sendMail({
        from: process.env.EMAIL_FROM || '"SalesmanPro" <no-reply@salesmanpro.site>',
        to: email,
        subject: "Verify your SalesmanPro email",
        html: htmlTemplate,
    });
    return { sent: true, verifyUrl: verificationLink };
}
exports.sendVerificationEmail = sendVerificationEmail;
async function markEmailVerified(email) {
    await prismadb_1.default.user.update({
        where: { email },
        data: { emailVerified: true },
    });
}
exports.markEmailVerified = markEmailVerified;
async function consumeVerificationToken(email, token) {
    const record = await prismadb_1.default.verificationToken.findUnique({
        where: { identifier_token: { identifier: email, token } },
    });
    if (!record || record.expires < new Date()) {
        if (record) {
            await prismadb_1.default.verificationToken
                .delete({ where: { id: record.id } })
                .catch(() => { });
        }
        return false;
    }
    await prismadb_1.default.verificationToken.delete({ where: { id: record.id } });
    await markEmailVerified(email);
    return true;
}
exports.consumeVerificationToken = consumeVerificationToken;
