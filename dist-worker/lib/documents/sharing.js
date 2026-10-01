"use strict";
/**
 * lib/documents/sharing.ts
 *
 * Universal Multi-Channel Document Dispatcher (WhatsApp & Email).
 * Supports single-recipient sending as well as high-throughput bulk distribution
 * to groups of parents, clients, consumers, or custom contact lists.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareDocuments = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const engine_1 = require("./engine");
const metaClient_1 = require("@/lib/whatsapp/metaClient");
const credentials_1 = require("@/lib/whatsapp/credentials");
const contextResolver_1 = require("@/lib/email/contextResolver");
const providerFactory_1 = require("@/lib/email/providers/providerFactory");
/**
 * Resolves a MetaWhatsAppClient for a company tenant, falling back to platform env
 */
async function resolveWhatsAppClientForCompany(companyId) {
    try {
        const waAccount = await prismadb_1.default.whatsAppAccount.findFirst({
            where: { companyId, status: "CONNECTED" },
        });
        if (waAccount && waAccount.phoneNumberId) {
            const token = (0, credentials_1.decryptWhatsAppAccessToken)(waAccount);
            if (token) {
                return new metaClient_1.MetaWhatsAppClient({
                    accessToken: token,
                    phoneNumberId: waAccount.phoneNumberId,
                });
            }
        }
        // Platform level fallback
        const platformToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WA_ACCESS_TOKEN;
        const platformPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        if (platformToken && platformPhoneId) {
            return new metaClient_1.MetaWhatsAppClient({
                accessToken: platformToken,
                phoneNumberId: platformPhoneId,
            });
        }
        return null;
    }
    catch (err) {
        console.error("[resolveWhatsAppClientForCompany Error]", err);
        return null;
    }
}
/**
 * Normalizes an international telephone number for WhatsApp dispatch
 */
function cleanPhoneNumber(phone) {
    if (!phone)
        return "";
    let cleaned = phone.replace(/[^0-9]/g, "");
    // If local Kenyan format 07... convert to 2547...
    if (cleaned.startsWith("0") && cleaned.length === 10) {
        cleaned = "254" + cleaned.slice(1);
    }
    return cleaned;
}
/**
 * Universal Multi-Channel Document Dispatcher
 */
async function shareDocuments(options) {
    const { companyId, documentType, channel, templateId, customMessage, recipients, userId } = options;
    const results = [];
    let successful = 0;
    let failed = 0;
    let skipped = 0;
    // 1. Resolve Company & Branding
    const company = await prismadb_1.default.company.findUnique({
        where: { id: companyId },
        select: { name: true, slug: true, domain: true },
    });
    const companyName = company?.name || "Our Business";
    const baseUrl = process.env.NEXTAUTH_URL || "https://salesmanpro.site";
    // 2. Pre-resolve WhatsApp client if channel requires
    let waClient = null;
    if (channel === "WHATSAPP" || channel === "BOTH") {
        waClient = await resolveWhatsAppClientForCompany(companyId);
    }
    // 3. Pre-resolve Email Provider & Context if channel requires
    let emailContext = null;
    let emailProvider = null;
    if (channel === "EMAIL" || channel === "BOTH") {
        try {
            emailContext = await (0, contextResolver_1.resolveEmailContext)("STORE", companyId);
            emailProvider = providerFactory_1.ProviderFactory.createProvider(emailContext.providerType, emailContext.credentials);
        }
        catch (err) {
            console.warn("[Email Context Warning]", err);
        }
    }
    // 4. Dispatch sequentially to avoid rate limits or memory exhaustion
    for (const recipient of recipients) {
        const itemResult = { recipient };
        let hasSuccess = false;
        let hasFailure = false;
        try {
            // Generate the authoritative PDF document buffer
            const docResult = await (0, engine_1.generateDocument)({
                type: documentType,
                companyId,
                sourceId: recipient.sourceEntityId,
                templateId,
                isPreview: false,
                userId,
            });
            const documentDownloadUrl = `${baseUrl}/api/documents/${documentType.toLowerCase().replace(/_/g, "-")}/${recipient.sourceEntityId}/pdf?download=true`;
            // ──────────────────────────────────────────────
            // WHATSAPP DISPATCH
            // ──────────────────────────────────────────────
            if (channel === "WHATSAPP" || channel === "BOTH") {
                const cleanPhone = cleanPhoneNumber(recipient.phone);
                if (!cleanPhone) {
                    itemResult.whatsappStatus = "SKIPPED";
                    itemResult.whatsappError = "No valid phone number provided";
                }
                else if (!waClient) {
                    itemResult.whatsappStatus = "FAILED";
                    itemResult.whatsappError = "WhatsApp is not configured for this organization";
                    hasFailure = true;
                }
                else {
                    try {
                        const defaultMsg = `Hello ${recipient.name},\n\nPlease find your official ${documentType.replace(/_/g, " ")} (${docResult.documentNumber}) from *${companyName}* attached.\n\nDirect Download Link:\n${documentDownloadUrl}\n\nThank you for choosing ${companyName}.`;
                        const finalMsg = customMessage
                            ? `${customMessage}\n\nDocument: ${docResult.documentNumber}\nDownload: ${documentDownloadUrl}`
                            : defaultMsg;
                        // Send text notification with download link
                        const waRes = await waClient.sendTextMessage({
                            to: cleanPhone,
                            body: finalMsg,
                            previewUrl: true,
                        });
                        itemResult.whatsappStatus = "SENT";
                        itemResult.whatsappMessageId = waRes.messages?.[0]?.id;
                        hasSuccess = true;
                        // Log WhatsApp dispatch event
                        await prismadb_1.default.generatedDocumentLog.create({
                            data: {
                                companyId,
                                documentType,
                                documentNumber: docResult.documentNumber,
                                sourceEntityId: recipient.sourceEntityId,
                                templateId: docResult.templateId,
                                action: "SHARED_WHATSAPP",
                                userId: userId || null,
                            },
                        });
                    }
                    catch (waErr) {
                        itemResult.whatsappStatus = "FAILED";
                        itemResult.whatsappError = waErr.message || "Failed to deliver WhatsApp message";
                        hasFailure = true;
                    }
                }
            }
            // ──────────────────────────────────────────────
            // EMAIL DISPATCH
            // ──────────────────────────────────────────────
            if (channel === "EMAIL" || channel === "BOTH") {
                if (!recipient.email || !recipient.email.includes("@")) {
                    itemResult.emailStatus = "SKIPPED";
                    itemResult.emailError = "No valid email address provided";
                }
                else if (!emailProvider || !emailContext) {
                    itemResult.emailStatus = "FAILED";
                    itemResult.emailError = "Email provider is not configured for this organization";
                    hasFailure = true;
                }
                else {
                    try {
                        const subject = `${documentType.replace(/_/g, " ")} ${docResult.documentNumber} from ${companyName}`;
                        const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
                <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
                  <h2 style="margin: 0; color: #0f172a; font-size: 20px;">${companyName}</h2>
                  <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Official Electronic Document Delivery</p>
                </div>
                <p style="font-size: 15px; margin-bottom: 16px;">Dear <strong>${recipient.name}</strong>,</p>
                <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                  ${customMessage ? customMessage.replace(/\n/g, "<br/>") : `Please find attached your official <strong>${documentType.replace(/_/g, " ")}</strong> (${docResult.documentNumber}).`}
                </p>
                <div style="margin: 28px 0; text-align: center;">
                  <a href="${documentDownloadUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                    Download ${docResult.documentNumber}
                  </a>
                </div>
                <p style="font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 32px;">
                  This is an automated notification from ${companyName}. If you have any inquiries, please contact our administrative desk.
                </p>
              </div>
            `;
                        const emailRes = await emailProvider.send({
                            to: recipient.email,
                            subject,
                            html: emailHtml,
                            text: `${customMessage || `Please find attached your official document ${docResult.documentNumber} from ${companyName}.`}\n\nDownload Link: ${documentDownloadUrl}`,
                            sender: emailContext.sender,
                            replyTo: emailContext.sender.replyTo || emailContext.sender.fromEmail,
                            attachments: [
                                {
                                    filename: docResult.fileName,
                                    content: docResult.buffer,
                                    contentType: "application/pdf",
                                },
                            ],
                        });
                        if (emailRes.success) {
                            itemResult.emailStatus = "SENT";
                            itemResult.emailMessageId = emailRes.messageId;
                            hasSuccess = true;
                            await prismadb_1.default.generatedDocumentLog.create({
                                data: {
                                    companyId,
                                    documentType,
                                    documentNumber: docResult.documentNumber,
                                    sourceEntityId: recipient.sourceEntityId,
                                    templateId: docResult.templateId,
                                    action: "SHARED_EMAIL",
                                    userId: userId || null,
                                },
                            });
                        }
                        else {
                            itemResult.emailStatus = "FAILED";
                            itemResult.emailError = emailRes.error || "Email delivery failed";
                            hasFailure = true;
                        }
                    }
                    catch (emailErr) {
                        itemResult.emailStatus = "FAILED";
                        itemResult.emailError = emailErr.message || "Failed to dispatch email";
                        hasFailure = true;
                    }
                }
            }
            if (hasSuccess)
                successful++;
            else if (hasFailure)
                failed++;
            else
                skipped++;
        }
        catch (genErr) {
            itemResult.whatsappStatus = "FAILED";
            itemResult.whatsappError = `PDF Generation failed: ${genErr.message}`;
            itemResult.emailStatus = "FAILED";
            itemResult.emailError = `PDF Generation failed: ${genErr.message}`;
            failed++;
        }
        results.push(itemResult);
    }
    return {
        total: recipients.length,
        successful,
        failed,
        skipped,
        results,
    };
}
exports.shareDocuments = shareDocuments;
