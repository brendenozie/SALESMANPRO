"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationEmail = exports.consumeVerificationToken = exports.markEmailVerified = exports.sendVerificationEmail = exports.createEmailVerificationToken = void 0;
const crypto_1 = require("crypto");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const domain_1 = require("./domain");
const emailService_1 = require("@/lib/email/emailService");
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
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
async function sendVerificationEmail(email, token, callbackUrl, options) {
    const verifyUrl = new URL("/verify-email", domain_1.AUTH_URL);
    verifyUrl.searchParams.set("token", token);
    verifyUrl.searchParams.set("email", email);
    if (callbackUrl)
        verifyUrl.searchParams.set("callbackUrl", callbackUrl);
    const verificationLink = verifyUrl.toString();
    const tenantType = options?.tenantType || (options?.companyId ? "STORE" : "PLATFORM");
    try {
        const result = await emailService_1.EmailService.sendEmail({
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
    }
    catch (err) {
        console.error("[VerificationEmail] Dispatch error:", err.message);
        return { sent: false, verifyUrl: verificationLink };
    }
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
async function resendVerificationEmail(email, callbackUrl) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
        return { success: false, message: "A valid email address is required." };
    }
    const user = await prismadb_1.default.user.findUnique({
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
    const existing = await prismadb_1.default.verificationToken.findFirst({
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
    const sendResult = await sendVerificationEmail(normalizedEmail, token, callbackUrl, user.companyId
        ? { tenantType: "STORE", companyId: user.companyId }
        : { tenantType: "PLATFORM" });
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
exports.resendVerificationEmail = resendVerificationEmail;
