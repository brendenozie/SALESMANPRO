import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { EmailService } from "@/lib/email/emailService";

export async function POST(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const companyId = auth.companyId;
    const body = await req.json();
    const { toEmail } = body;

    const recipient = toEmail || auth.userEmail;

    if (!recipient || !recipient.includes("@")) {
      return formatResponse(false, null, "A valid recipient email is required to send a test email", 400);
    }

    // Send test email directly and synchronously
    const result = await EmailService.sendTestEmail({
      tenantType: "STORE",
      companyId,
      toEmail: recipient,
    });

    // Update verification status in DB for the store's email config
    if (result.success) {
      await prisma.emailConfiguration.updateMany({
        where: { companyId, scope: "STORE" },
        data: {
          verified: true,
          verificationStatus: "VERIFIED",
          lastVerifiedAt: new Date(),
          lastError: null,
        },
      });
    } else {
      await prisma.emailConfiguration.updateMany({
        where: { companyId, scope: "STORE" },
        data: {
          verified: false,
          verificationStatus: "FAILED",
          lastError: result.error || "Failed to send test email",
        },
      });
    }

    if (!result.success) {
      return formatResponse(false, { error: result.error }, result.error || "Test email delivery failed", 400);
    }

    return formatResponse(
      true,
      {
        recipient,
        messageId: result.messageId,
        provider: result.provider,
      },
      `Test email successfully dispatched to ${recipient}!`,
      200
    );
  } catch (err: any) {
    console.error("[EmailTest API] Error:", err);
    return formatResponse(false, null, err.message || "Failed to dispatch test email", err.statusCode || 500);
  }
}
