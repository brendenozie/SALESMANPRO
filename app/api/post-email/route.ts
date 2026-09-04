import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { EmailService } from "@/lib/email/emailService";

async function postHandler(request: Request) {
  try {
    const body = await request.json();
    const { fname, lname, email, phone, company, message } = body;

    if (!email || !message) {
      return formatResponse(false, null, "Email and message are required", 400);
    }

    const fullName = [fname, lname].filter(Boolean).join(" ") || "Contact Submitter";

    await EmailService.sendEmail({
      tenantType: "PLATFORM",
      template: "CONTACT_SUBMISSION",
      recipient: email,
      replyTo: email,
      data: {
        name: fullName,
        clientName: fullName,
        email,
        phone,
        company,
        message,
      },
      async: true,
    });

    return formatResponse(true, { delivered: true }, "Message sent successfully");
  } catch (err: any) {
    console.error("POST /api/post-email error:", err);
    return formatResponse(
      false,
      null,
      err.message || "Internal server error",
      500
    );
  }
}

export const POST = withApiHandler(postHandler);
