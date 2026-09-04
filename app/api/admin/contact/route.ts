import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { EmailService } from "@/lib/email/emailService";

export const POST = withApiHandler(
  async (request) => {
    const { name, email, message, _honeypot } = await request.json();

    // 1. Spam Prevention: Honeypot check
    if (_honeypot) {
      console.warn("[ContactRoute] Spam detected via honeypot field.");
      return formatResponse(true, null, "Message sent successfully!");
    }

    // 2. Validation
    if (!name || !email || !message) {
      return formatResponse(false, null, "All fields are required", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return formatResponse(false, null, "Invalid email address", 400);
    }

    try {
      const recipient =
        process.env.EMAIL_RECEIVER ||
        process.env.DEFAULT_REPLY_TO ||
        process.env.DEFAULT_FROM_EMAIL ||
        "support@salesmanpro.site";

      // 3. Dispatch via unified EmailService
      await EmailService.sendEmail({
        tenantType: "PLATFORM",
        template: "CONTACT_SUBMISSION",
        recipient,
        replyTo: email,
        data: {
          name,
          email,
          message,
        },
        async: true,
      });

      return formatResponse(true, null, "Message sent successfully!");
    } catch (error) {
      console.error("[ContactRoute] Email send error:", error);
      return formatResponse(false, null, "Internal server error.", 500);
    }
  },
  { requireAuth: false, requireRateLimit: true }
);