import { NextRequest } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import { EmailService } from "@/lib/email/emailService";
import { EmailTenantType } from "@/lib/email/types";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireSuperAdmin(req);
    const body = await req.json();
    const { tenantType = "PLATFORM", toEmail } = body;

    const recipient = toEmail || admin.email;

    if (!recipient || !recipient.includes("@")) {
      return formatResponse(false, null, "Valid recipient email address is required", 400);
    }

    const result = await EmailService.sendTestEmail({
      tenantType: tenantType as EmailTenantType,
      toEmail: recipient,
    });

    if (!result.success) {
      return formatResponse(false, { error: result.error }, result.error || "Platform test email failed", 400);
    }

    return formatResponse(
      true,
      {
        tenantType,
        recipient,
        messageId: result.messageId,
        provider: result.provider,
      },
      `Platform test email (${tenantType}) delivered successfully to ${recipient}`,
      200
    );
  } catch (err: any) {
    console.error("[SuperAdmin Email Test] POST error:", err);
    return formatResponse(false, null, err.message || "Failed to dispatch test email", err.statusCode || 500);
  }
}
