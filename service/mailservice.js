/**
 * service/mailservice.js
 *
 * Backward-compatibility wrapper delegating to the unified EmailService.
 */

import { EmailService } from "@/lib/email/emailService";

export default async function SendMail(params = {}) {
  const recipient = params.to || params.email;
  if (!recipient) {
    console.warn("[SendMail Legacy] No recipient provided");
    return { success: false, error: "No recipient provided" };
  }

  const fullName = [params.fname, params.lname].filter(Boolean).join(" ") || "Contact Submitter";

  return EmailService.sendEmail({
    tenantType: "PLATFORM",
    template: "CONTACT_SUBMISSION",
    recipient,
    replyTo: params.email || recipient,
    data: {
      name: fullName,
      clientName: fullName,
      email: params.email || recipient,
      phone: params.phone,
      company: params.company,
      message: params.message || params.text || "",
    },
    async: true,
  });
}