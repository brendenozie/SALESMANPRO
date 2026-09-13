/**
 * lib/email/templates/renderer.ts
 *
 * Centralized email rendering engine with modern responsive layouts and dynamic branding.
 */

import { EmailBrandingContext, EmailTemplateId } from "../types";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/**
 * Escapes HTML entities to prevent HTML injection in emails.
 */
function escapeHtml(str: any): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Wraps email content in a consistent, modern, responsive HTML container with dynamic branding.
 */
function wrapInLayout(
  content: string,
  branding: EmailBrandingContext,
  title: string
): string {
  const primaryColor = branding.primaryColor || "#ea580c";
  const brandName = escapeHtml(branding.brandName);
  const websiteUrl = branding.websiteUrl || "#";
  const supportEmail = branding.supportEmail || "support@salesmanpro.site";
  const year = new Date().getFullYear();

  const logoMarkup = branding.logoUrl
    ? `<img src="${branding.logoUrl}" alt="${brandName}" style="max-height: 48px; max-width: 180px; display: block; margin: 0 auto; object-fit: contain;" />`
    : `<span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">${brandName}</span>`;

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    td {
      padding: 0;
    }
    img {
      border: 0;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    .btn-primary {
      display: inline-block;
      background-color: ${primaryColor};
      color: #ffffff !important;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    @media only screen and (max-width: 600px) {
      .main-container {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .content-padding {
        padding: 24px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" class="main-container" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; border-bottom: 3px solid ${primaryColor}; padding: 28px 32px; text-align: center;">
              <a href="${websiteUrl}" target="_blank" style="text-decoration: none;">
                ${logoMarkup}
              </a>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td class="content-padding" style="padding: 36px 36px 28px 36px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 36px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                Sent on behalf of <strong>${brandName}</strong>
              </p>
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #94a3b8;">
                Need assistance? Contact <a href="mailto:${supportEmail}" style="color: ${primaryColor}; text-decoration: none;">${supportEmail}</a>
                ${branding.supportPhone ? ` &bull; ${escapeHtml(branding.supportPhone)}` : ""}
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                &copy; ${year} ${brandName}. All rights reserved.
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
}

/**
 * Main template dispatch function.
 */
export function renderEmailTemplate(
  templateId: EmailTemplateId,
  data: Record<string, any>,
  branding: EmailBrandingContext
): RenderedEmail {
  switch (templateId) {
    case "ACCOUNT_VERIFICATION": {
      const verificationLink = data.verificationLink || "#";
      const subject = `Verify your ${branding.brandName} email`;
      const htmlContent = `
        <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a; text-align: center;">
          Verify your email address
        </h1>
        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;">
          Welcome to <strong>${escapeHtml(branding.brandName)}</strong>! Please confirm your email address to activate your account.
        </p>
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
          <tr>
            <td align="center">
              <a href="${verificationLink}" target="_blank" class="btn-primary">
                Verify Email Address
              </a>
            </td>
          </tr>
        </table>
        <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.5; color: #64748b; text-align: center;">
          This link will expire in <strong>24 hours</strong>. If you did not create this account, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="margin: 0; font-size: 12px; color: #94a3b8; word-break: break-all;">
          Button not working? Copy and paste this link: <a href="${verificationLink}" style="color: ${branding.primaryColor || "#ea580c"};">${verificationLink}</a>
        </p>
      `;
      return {
        subject,
        html: wrapInLayout(htmlContent, branding, subject),
        text: `Verify your email for ${branding.brandName}: ${verificationLink}`,
      };
    }

    case "PASSWORD_RESET": {
      const resetLink = data.resetLink || "#";
      const subject = `Password Reset Request - ${branding.brandName}`;
      const htmlContent = `
        <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a; text-align: center;">
          Reset Your Password
        </h1>
        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;">
          We received a request to reset the password for your <strong>${escapeHtml(branding.brandName)}</strong> account.
        </p>
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
          <tr>
            <td align="center">
              <a href="${resetLink}" target="_blank" class="btn-primary">
                Reset Password
              </a>
            </td>
          </tr>
        </table>
        <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.5; color: #64748b; text-align: center;">
          This link is valid for <strong>1 hour</strong>. If you did not request a password reset, no further action is needed.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="margin: 0; font-size: 12px; color: #94a3b8; word-break: break-all;">
          Direct link: <a href="${resetLink}" style="color: ${branding.primaryColor || "#ea580c"};">${resetLink}</a>
        </p>
      `;
      return {
        subject,
        html: wrapInLayout(htmlContent, branding, subject),
        text: `Reset your password for ${branding.brandName}: ${resetLink}`,
      };
    }

    case "ORDER_CONFIRMED": {
      const orderId = escapeHtml(data.orderId || data.id || "N/A");
      const totalAmount = escapeHtml(data.totalAmount || data.totalFinalPrice || "0.00");
      const currency = escapeHtml(data.currency || branding.currency || "KES");
      const subject = `Order Confirmed #${orderId} - ${branding.brandName}`;

      const itemsHtml = Array.isArray(data.items) && data.items.length > 0
        ? `
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <tr style="background-color: #f1f5f9; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">
              <th style="padding: 10px 16px; text-align: left;">Item</th>
              <th style="padding: 10px 16px; text-align: center;">Qty</th>
              <th style="padding: 10px 16px; text-align: right;">Price</th>
            </tr>
            ${data.items
              .map(
                (item: any) => `
              <tr style="border-top: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">
                <td style="padding: 12px 16px;">${escapeHtml(item.name || item.title || "Product")}</td>
                <td style="padding: 12px 16px; text-align: center;">${escapeHtml(item.quantity || 1)}</td>
                <td style="padding: 12px 16px; text-align: right; font-weight: 600;">${currency} ${escapeHtml(item.price || 0)}</td>
              </tr>
            `
              )
              .join("")}
          </table>
        `
        : "";

      const htmlContent = `
        <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #0f172a; text-align: center;">
          Thank you for your order!
        </h1>
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #475569; text-align: center;">
          Your order <strong>#${orderId}</strong> is confirmed and is being processed.
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 24px; margin: 20px 0;">
          <table width="100%">
            <tr>
              <td style="font-size: 14px; color: #64748b;">Order ID:</td>
              <td style="font-size: 14px; font-weight: 700; color: #0f172a; text-align: right;">#${orderId}</td>
            </tr>
            <tr>
              <td style="font-size: 14px; color: #64748b; padding-top: 8px;">Order Total:</td>
              <td style="font-size: 16px; font-weight: 800; color: #0f172a; text-align: right; padding-top: 8px;">${currency} ${totalAmount}</td>
            </tr>
          </table>
        </div>

        ${itemsHtml}

        <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 1.5; color: #475569; text-align: center;">
          We will notify you as soon as your items are dispatched.
        </p>
      `;

      return {
        subject,
        html: wrapInLayout(htmlContent, branding, subject),
        text: `Thank you for your order #${orderId} with ${branding.brandName}. Total: ${currency} ${totalAmount}.`,
      };
    }

    case "ORDER_STATUS_UPDATE": {
      const orderId = escapeHtml(data.orderId || data.id || "N/A");
      const status = escapeHtml(data.orderStatus || data.status || "Updated");
      const trackingNumber = data.trackingNumber ? escapeHtml(data.trackingNumber) : null;
      const subject = `Order #${orderId} Status: ${status} - ${branding.brandName}`;

      const htmlContent = `
        <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #0f172a; text-align: center;">
          Order Status Update
        </h1>
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #475569; text-align: center;">
          Your order <strong>#${orderId}</strong> has been updated to:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 16px; font-weight: 800; padding: 8px 24px; border-radius: 9999px; border: 1px solid #a7f3d0;">
            ${status}
          </span>
        </div>
        ${
          trackingNumber
            ? `<p style="text-align: center; font-size: 14px; color: #64748b;">Tracking Number: <strong>${trackingNumber}</strong></p>`
            : ""
        }
      `;

      return {
        subject,
        html: wrapInLayout(htmlContent, branding, subject),
        text: `Your order #${orderId} at ${branding.brandName} status is now: ${status}.`,
      };
    }

    case "INQUIRY_REPLY": {
      const clientName = escapeHtml(data.clientName || "Customer");
      const replyMessage = escapeHtml(data.replyMessage || data.message || "");
      const propertyOrTopic = data.propertyName ? ` regarding "${escapeHtml(data.propertyName)}"` : "";
      const subject = `Response to your inquiry${propertyOrTopic} - ${branding.brandName}`;

      const htmlContent = `
        <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          Hello ${clientName},
        </h1>
        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
          Thank you for reaching out to <strong>${escapeHtml(branding.brandName)}</strong>. Here is the response to your inquiry:
        </p>
        <div style="background-color: #f8fafc; border-left: 4px solid ${branding.primaryColor || "#ea580c"}; padding: 18px 20px; border-radius: 4px; margin: 24px 0;">
          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${replyMessage}</p>
        </div>
        <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
          You can reply directly to this email if you have any further questions.
        </p>
      `;

      return {
        subject,
        html: wrapInLayout(htmlContent, branding, subject),
        text: `Hello ${clientName},\n\n${replyMessage}\n\nBest regards,\n${branding.brandName}`,
      };
    }

    case "DIRECT_MESSAGE": {
      const recipientName = escapeHtml(data.recipientName || data.clientName || "there");
      const senderName = escapeHtml(data.senderName || branding.brandName);
      const messageContent = escapeHtml(data.message || data.content || "");
      const conversationTitle = data.conversationTitle ? escapeHtml(data.conversationTitle) : null;
      const actionUrl = data.actionUrl || branding.websiteUrl || "#";
      const subject = data.subject || `New message from ${senderName} - ${branding.brandName}`;

      const htmlContent = `
        <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
          Hello ${recipientName},
        </h1>
        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
          You received a direct message from <strong>${senderName}</strong>${
            conversationTitle ? ` regarding <em>${conversationTitle}</em>` : ""
          } on <strong>${escapeHtml(branding.brandName)}</strong>:
        </p>
        <div style="background-color: #f8fafc; border-left: 4px solid ${branding.primaryColor || "#3b82f6"}; padding: 18px 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${messageContent}</p>
        </div>
        ${
          actionUrl && actionUrl !== "#"
            ? `
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
          <tr>
            <td align="center">
              <a href="${actionUrl}" target="_blank" class="btn-primary">
                View & Reply in Platform
              </a>
            </td>
          </tr>
        </table>
        `
            : ""
        }
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; text-align: center;">
          You can also reply directly to this email to communicate with ${senderName}.
        </p>
      `;

      return {
        subject,
        html: wrapInLayout(htmlContent, branding, subject),
        text: `Hello ${recipientName},\n\nNew message from ${senderName}:\n\n${messageContent}\n\nBest regards,\n${branding.brandName}`,
      };
    }

    case "CONTACT_SUBMISSION": {
      const name = escapeHtml(data.name || data.clientName || "Visitor");
      const email = escapeHtml(data.email || data.clientEmail || "N/A");
      const phone = data.phone ? escapeHtml(data.phone) : null;
      const message = escapeHtml(data.message || "");
      const subject = `[Contact Form] Submission from ${name}`;

      const htmlContent = `
        <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
          New Contact Submission
        </h1>
        <table width="100%" style="font-size: 14px; margin-bottom: 20px;">
          <tr>
            <td style="width: 80px; color: #64748b; padding: 4px 0;"><strong>Name:</strong></td>
            <td style="color: #0f172a; padding: 4px 0;">${name}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 4px 0;"><strong>Email:</strong></td>
            <td style="color: #0f172a; padding: 4px 0;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          ${
            phone
              ? `<tr>
            <td style="color: #64748b; padding: 4px 0;"><strong>Phone:</strong></td>
            <td style="color: #0f172a; padding: 4px 0;">${phone}</td>
          </tr>`
              : ""
          }
        </table>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 8px;">Message:</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${message}</p>
        </div>
      `;

      return {
        subject,
        html: wrapInLayout(htmlContent, branding, subject),
        text: `New contact submission from ${name} (${email}):\n\n${message}`,
      };
    }

    case "BACKUP_ALERT": {
      const alertSubject = escapeHtml(data.subject || "Database Reliability Alert");
      const message = escapeHtml(data.message || "");
      const subject = `[SalesmanPro DB Alert] ${alertSubject}`;

      const htmlContent = `
        <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #dc2626;">
          Database Reliability Alert
        </h1>
        <p style="font-size: 14px; color: #64748b; margin-bottom: 12px;">
          <strong>Event:</strong> ${alertSubject}
        </p>
        <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #991b1b; white-space: pre-wrap;">${message}</p>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">
          Timestamp: ${new Date().toISOString()}
        </p>
      `;

      return {
        subject,
        html: wrapInLayout(htmlContent, branding, subject),
        text: `[Database Reliability Alert] ${alertSubject}\n\n${message}`,
      };
    }

    case "PROMOTIONAL_ANNOUNCEMENT": {
      const recipientName = data.recipientName ? escapeHtml(data.recipientName) : "valued partner";
      const headline = escapeHtml(data.headline || data.title || `Special Announcement from ${branding.brandName}`);
      const badgeText = escapeHtml(data.badgeText || "✨ Exclusive Announcement");
      const subject = data.subject || `${badgeText}: ${headline}`;
      const rawBody = (data.bodyText || data.message || data.content || "").replace(/{{name}}/gi, recipientName);

      const bodyParagraphs = rawBody
        .split(/\n\s*\n/)
        .map((para: string) => `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #334155;">${escapeHtml(para).replace(/\n/g, "<br/>")}</p>`)
        .join("");

      const highlightBox = data.highlightText
        ? `
        <div style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border: 1px solid #fed7aa; border-radius: 12px; padding: 18px 22px; margin: 24px 0;">
          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #9a3412;">${escapeHtml(data.highlightText)}</p>
        </div>`
        : "";

      const ctaButton = data.ctaUrl && data.ctaLabel
        ? `
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0 20px 0;">
          <tr>
            <td align="center">
              <a href="${escapeHtml(data.ctaUrl)}" target="_blank" class="btn-primary" style="background: ${branding.primaryColor || "#ea580c"}; display: inline-block;">
                ${escapeHtml(data.ctaLabel)}
              </a>
            </td>
          </tr>
        </table>`
        : "";

      const htmlContent = `
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="display: inline-block; padding: 6px 14px; background-color: #ffedd5; color: #c2410c; font-size: 12px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #fed7aa;">
            ${badgeText}
          </span>
          <h1 style="margin: 16px 0 8px 0; font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.3;">
            ${headline}
          </h1>
          <p style="margin: 0; font-size: 14px; color: #64748b;">
            Hello ${recipientName},
          </p>
        </div>

        <div style="margin: 20px 0;">
          ${bodyParagraphs}
        </div>

        ${highlightBox}
        ${ctaButton}

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 16px 0;" />
        <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
          You are receiving this promotional update because you have an active account on <strong>${escapeHtml(branding.brandName)}</strong>.
        </p>
      `;

      return {
        subject,
        html: wrapInLayout(htmlContent, branding, subject),
        text: `${headline}\n\nHello ${recipientName},\n\n${rawBody}\n\n${data.ctaLabel ? `${data.ctaLabel}: ${data.ctaUrl}\n\n` : ""}Best regards,\n${branding.brandName}`,
      };
    }

    case "SYSTEM_COMMUNICATION": {
      const recipientName = data.recipientName ? escapeHtml(data.recipientName) : "user";
      const headline = escapeHtml(data.headline || data.title || `Important Notice from ${branding.brandName}`);
      const badgeText = escapeHtml(data.badgeText || "📢 Official Communication");
      const subject = data.subject || `${badgeText}: ${headline}`;
      const rawBody = (data.bodyText || data.message || data.content || "").replace(/{{name}}/gi, recipientName);

      const bodyParagraphs = rawBody
        .split(/\n\s*\n/)
        .map((para: string) => `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #334155;">${escapeHtml(para).replace(/\n/g, "<br/>")}</p>`)
        .join("");

      const noticeCallout = data.noticeBox
        ? `
        <div style="background-color: #f1f5f9; border-left: 4px solid #0284c7; border-radius: 6px; padding: 14px 18px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0369a1;">${escapeHtml(data.noticeBox)}</p>
        </div>`
        : "";

      const ctaButton = data.ctaUrl && data.ctaLabel
        ? `
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 16px 0;">
          <tr>
            <td align="center">
              <a href="${escapeHtml(data.ctaUrl)}" target="_blank" class="btn-primary" style="background-color: #0f172a; display: inline-block;">
                ${escapeHtml(data.ctaLabel)}
              </a>
            </td>
          </tr>
        </table>`
        : "";

      const htmlContent = `
        <div style="margin-bottom: 20px;">
          <span style="display: inline-block; padding: 5px 12px; background-color: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 700; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
            ${badgeText}
          </span>
          <h1 style="margin: 14px 0 6px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.35;">
            ${headline}
          </h1>
          <p style="margin: 0; font-size: 14px; color: #64748b;">
            Hello ${recipientName},
          </p>
        </div>

        <div style="margin: 20px 0;">
          ${bodyParagraphs}
        </div>

        ${noticeCallout}
        ${ctaButton}

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 16px 0;" />
        <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
          This is an administrative communication regarding your <strong>${escapeHtml(branding.brandName)}</strong> account.
        </p>
      `;

      return {
        subject,
        html: wrapInLayout(htmlContent, branding, subject),
        text: `${headline}\n\nHello ${recipientName},\n\n${rawBody}\n\n${data.ctaLabel ? `${data.ctaLabel}: ${data.ctaUrl}\n\n` : ""}Best regards,\n${branding.brandName} Team`,
      };
    }

    case "TEST_EMAIL":
    default: {
      const subject = `Test Email from ${branding.brandName}`;
      const provider = escapeHtml(data.provider || "SMTP");
      const htmlContent = `
        <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a; text-align: center;">
          Email Configuration Verified!
        </h1>
        <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;">
          This is a test message to confirm that your email provider (<strong>${provider}</strong>) and sender identity are working properly for <strong>${escapeHtml(branding.brandName)}</strong>.
        </p>
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
          <span style="font-size: 14px; font-weight: 700; color: #065f46;">
            &check; Status: Connection Active & Verified
          </span>
        </div>
        <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
          Timestamp: ${new Date().toISOString()}
        </p>
      `;

      return {
        subject,
        html: wrapInLayout(htmlContent, branding, subject),
        text: `Test email from ${branding.brandName}. Your ${provider} email provider is configured successfully.`,
      };
    }
  }
}
