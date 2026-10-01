import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { EmailService } from "@/lib/email/emailService";
import { hashPOSCode } from "@/lib/pos/posStaffService";

export const dynamic = "force-dynamic";

function generateSecure6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/admin/share-login-code
 * Shares access login code to the email address of a store staff member, teacher, or student.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { companyId, targetType, targetId, email: overrideEmail } = body;

    if (!companyId) {
      return formatResponse(false, null, "Missing companyId parameter", 400);
    }
    if (!targetType || !["STAFF", "TEACHER", "STUDENT"].includes(targetType)) {
      return formatResponse(false, null, "targetType must be STAFF, TEACHER, or STUDENT", 400);
    }
    if (!targetId) {
      return formatResponse(false, null, "Missing targetId parameter", 400);
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        contactEmail: true,
      },
    });

    const companyName = company?.name || "SalesmanPro Organization";

    let recipientName = "";
    let recipientEmail = overrideEmail?.trim() || "";
    let loginCode = "";
    let roleTitle = "";

    // 1. Target: STAFF
    if (targetType === "STAFF") {
      let staff = await prisma.staffProfile.findFirst({
        where: {
          OR: [{ id: targetId }, { userId: targetId }],
          companyId,
        },
        include: { user: true },
      });

      if (!staff) {
        return formatResponse(false, null, "Staff profile not found", 404);
      }

      // Generate login code if not already set
      if (!staff.loginCode) {
        const newPin = generateSecure6DigitCode();
        staff = await prisma.staffProfile.update({
          where: { id: staff.id },
          data: {
            loginCode: newPin,
            codeHash: hashPOSCode(newPin),
          },
          include: { user: true },
        });
      }

      loginCode = staff.loginCode || "";
      recipientName = staff.user?.name || "Staff Member";
      roleTitle = staff.jobTitle || staff.posRole || "Staff Operator";
      if (!recipientEmail) {
        recipientEmail = staff.user?.email || "";
      }
    }

    // 2. Target: TEACHER / EDUCATOR
    else if (targetType === "TEACHER") {
      let educator = await prisma.educator.findFirst({
        where: {
          OR: [{ id: targetId }, { userId: targetId }],
          companyId,
        },
        include: { user: true },
      });

      if (!educator) {
        return formatResponse(false, null, "Educator profile not found", 404);
      }

      if (!educator.loginCode) {
        const newPin = generateSecure6DigitCode();
        educator = await prisma.educator.update({
          where: { id: educator.id },
          data: { loginCode: newPin },
          include: { user: true },
        });
      }

      loginCode = educator.loginCode;
      recipientName = educator.user?.name || "Teacher / Educator";
      roleTitle = "Educator / Teacher";
      if (!recipientEmail) {
        recipientEmail = educator.user?.email || "";
      }
    }

    // 3. Target: STUDENT
    else if (targetType === "STUDENT") {
      let student = await prisma.student.findFirst({
        where: {
          OR: [{ id: targetId }, { userId: targetId }],
          companyId,
        },
        include: {
          user: true,
          parent: { include: { user: true } },
        },
      });

      if (!student) {
        return formatResponse(false, null, "Student profile not found", 404);
      }

      if (!student.loginCode) {
        const newPin = generateSecure6DigitCode();
        student = await prisma.student.update({
          where: { id: student.id },
          data: { loginCode: newPin },
          include: {
            user: true,
            parent: { include: { user: true } },
          },
        });
      }

      loginCode = student.loginCode;
      recipientName = student.firstName
        ? `${student.firstName} ${student.lastName}`
        : student.user?.name || "Student";
      roleTitle = "Student";
      if (!recipientEmail) {
        recipientEmail =
          student.user?.email || student.parent?.user?.email || "";
      }
    }

    if (!recipientEmail || !recipientEmail.includes("@")) {
      return formatResponse(
        false,
        { loginCode },
        `No valid email address found for ${recipientName}. Current login code is: ${loginCode}. Please configure an email address first.`,
        400
      );
    }

    // Compose formatted notification email
    const subject = `Your ${companyName} Login Access Code: ${loginCode}`;
    const noticeCallout = `
      <div style="background-color: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #15803d; display: block; margin-bottom: 6px;">
          Your Secure Login PIN / Code
        </span>
        <div style="font-family: monospace, monospace; font-size: 36px; font-weight: 900; letter-spacing: 6px; color: #166534; padding: 6px 0;">
          ${loginCode}
        </div>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #4b5563;">
          Use this code to log in immediately on Mobile (Android) or Desktop (WPF).
        </p>
      </div>
    `;

    const bodyParagraphs = `
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 14px 0;">
        You have been granted access to <strong>${companyName}</strong> as a <strong>${roleTitle}</strong>.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 14px 0;">
        To sign in using this code:
      </p>
      <ol style="font-size: 13px; line-height: 1.8; color: #475569; padding-left: 20px; margin: 0 0 14px 0;">
        <li>Open the <strong>SalesmanPro</strong> Mobile app or Desktop application.</li>
        <li>Select <strong>Staff / Quick PIN Login</strong>.</li>
        <li>Enter your 6-digit access code: <strong style="font-family: monospace; color: #16a34a;">${loginCode}</strong>.</li>
        <li>You will be signed into your store and POS terminal automatically.</li>
      </ol>
      <p style="font-size: 13px; color: #64748b; margin: 0;">
        Please keep this code secure and do not share it with unauthorized personnel.
      </p>
    `;

    let emailSent = false;
    let emailError: string | null = null;

    try {
      await EmailService.sendEmail({
        tenantType: "STORE",
        companyId,
        template: "SYSTEM_COMMUNICATION",
        recipient: recipientEmail,
        async: false,
        data: {
          subject,
          headline: `Welcome to ${companyName}`,
          badgeText: `${roleTitle} ACCESS`,
          recipientName,
          bodyParagraphs,
          noticeCallout,
          ctaLabel: "Download Apps & Access",
          ctaUrl: "https://salesmanpro.site/dashboard",
        },
      });
      emailSent = true;
    } catch (err: any) {
      console.warn("[SHARE_LOGIN_CODE_EMAIL_WARNING]", err.message);
      emailError = err.message;
    }

    return formatResponse(
      true,
      {
        loginCode,
        recipientName,
        recipientEmail,
        emailSent,
        warning: emailError ? `Code ready (${loginCode}), email queued: ${emailError}` : undefined,
      },
      emailSent
        ? `Access code (${loginCode}) sent successfully to ${recipientEmail}!`
        : `Access code is ${loginCode}. Email delivery logged for ${recipientEmail}.`,
      200
    );
  } catch (error: any) {
    console.error("[SHARE_LOGIN_CODE_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to share login code", 500);
  }
}
