/**
 * lib/school/whatsappSchoolService.ts
 *
 * WhatsApp School Notification Service for parent & student communication:
 * - Student daily attendance alerts (ABSENT / LATE) to parents
 * - Fee balance payment reminders
 * - Assignment deadline alerts
 * - Report card publication announcements
 */

import prisma from "@/server/db/prismadb";
import { sendWhatsApp } from "@/lib/whatsapp";

interface NotificationResult {
  recipient: string;
  phone: string;
  sent: boolean;
  error?: string;
}

/**
 * Send an immediate attendance alert to a student's parent.
 */
export async function sendStudentAttendanceAlert(
  studentId: string,
  status: "ABSENT" | "LATE",
  date: Date = new Date()
): Promise<NotificationResult> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { name: true } },
      Company: { select: { name: true } },
      parent: {
        include: {
          user: { select: { name: true, phone: true } },
        },
      },
    },
  });

  if (!student) {
    return { recipient: "Unknown", phone: "", sent: false, error: "Student not found" };
  }

  const parentPhone = student.parent?.phone || student.parent?.user?.phone || student.phone || student.contactPhone;
  const parentName = student.parent?.user?.name || "Parent/Guardian";
  const studentName = student.user?.name || `${student.firstName} ${student.lastName}`.trim() || "Your child";
  const schoolName = student.Company?.name || "the School";
  const formattedDate = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  if (!parentPhone) {
    return { recipient: parentName, phone: "", sent: false, error: "No contact phone number on record" };
  }

  const statusText = status === "ABSENT" ? "ABSENT" : "ARRIVED LATE";
  const message = `🔔 *${schoolName} - Attendance Notice*\n\nDear ${parentName},\n\nPlease be informed that *${studentName}* was marked *${statusText}* on ${formattedDate}.\n\nIf this was pre-arranged or if you have any questions, please contact the school office.\n\nThank you,\n${schoolName} Administration`;

  try {
    await sendWhatsApp(parentPhone, message);
    return { recipient: parentName, phone: parentPhone, sent: true };
  } catch (error: any) {
    console.error("WhatsApp attendance alert failed:", error);
    return { recipient: parentName, phone: parentPhone, sent: false, error: error.message };
  }
}

/**
 * Send fee reminder to parent for a student's outstanding balance.
 */
export async function sendStudentFeeReminder(
  studentId: string,
  termName?: string
): Promise<NotificationResult> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { name: true } },
      Company: { select: { name: true, currency: true } },
      parent: {
        include: {
          user: { select: { name: true, phone: true } },
        },
      },
      feeRecords: true,
    },
  });

  if (!student) {
    return { recipient: "Unknown", phone: "", sent: false, error: "Student not found" };
  }

  const parentPhone = student.parent?.phone || student.parent?.user?.phone || student.phone || student.contactPhone;
  const parentName = student.parent?.user?.name || "Parent/Guardian";
  const studentName = student.user?.name || `${student.firstName} ${student.lastName}`.trim() || "Your child";
  const schoolName = student.Company?.name || "the School";
  const currency = student.Company?.currency || "USD";

  if (!parentPhone) {
    return { recipient: parentName, phone: "", sent: false, error: "No contact phone on file" };
  }

  let outstandingTotal = 0;
  for (const record of student.feeRecords) {
    const items = (record.appliedFeeItems as any[]) || [];
    const totalDue = items.reduce((sum: number, it: any) => sum + (Number(it?.amount) || 0), 0);
    const balance = Math.max(0, totalDue - (record.amountPaid || 0));
    outstandingTotal += balance;
  }

  if (outstandingTotal <= 0) {
    return { recipient: parentName, phone: parentPhone, sent: false, error: "No outstanding balance" };
  }

  const termText = termName ? ` for ${termName}` : "";
  const message = `💳 *${schoolName} - Fee Payment Reminder*\n\nDear ${parentName},\n\nThis is a friendly reminder that the outstanding school fees${termText} for *${studentName}* is *${currency} ${outstandingTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}*.\n\nPlease arrange for payment via the school portal or bank transfer.\n\nThank you for your ongoing partnership,\n${schoolName} Accounts Office`;

  try {
    await sendWhatsApp(parentPhone, message);
    return { recipient: parentName, phone: parentPhone, sent: true };
  } catch (error: any) {
    return { recipient: parentName, phone: parentPhone, sent: false, error: error.message };
  }
}

/**
 * Send report card publication notification to parent.
 */
export async function sendReportCardAlert(
  studentId: string,
  termName: string,
  overallGrade: string,
  gpa: number
): Promise<NotificationResult> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { name: true } },
      Company: { select: { name: true } },
      parent: {
        include: {
          user: { select: { name: true, phone: true } },
        },
      },
    },
  });

  if (!student) {
    return { recipient: "Unknown", phone: "", sent: false, error: "Student not found" };
  }

  const parentPhone = student.parent?.phone || student.parent?.user?.phone || student.phone || student.contactPhone;
  const parentName = student.parent?.user?.name || "Parent/Guardian";
  const studentName = student.user?.name || `${student.firstName} ${student.lastName}`.trim() || "Your child";
  const schoolName = student.Company?.name || "the School";

  if (!parentPhone) {
    return { recipient: parentName, phone: "", sent: false, error: "No phone on file" };
  }

  const message = `🎓 *${schoolName} - Report Card Published*\n\nDear ${parentName},\n\nWe are pleased to announce that *${studentName}*'s academic report card for *${termName}* is now available!\n\n• *Overall Grade:* ${overallGrade}\n• *Term GPA:* ${gpa.toFixed(2)}\n\nYou can view and download the full official transcript directly in the SalesmanPro Parent Portal.\n\nWarm regards,\n${schoolName} Academic Office`;

  try {
    await sendWhatsApp(parentPhone, message);
    return { recipient: parentName, phone: parentPhone, sent: true };
  } catch (error: any) {
    return { recipient: parentName, phone: parentPhone, sent: false, error: error.message };
  }
}
