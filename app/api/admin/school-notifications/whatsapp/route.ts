/**
 * /api/admin/school-notifications/whatsapp
 *
 * Trigger WhatsApp notifications to parents:
 * - attendance alert (single or bulk for absent students)
 * - fee reminder (single or whole classroom)
 * - report card announcement
 */

import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import {
  sendStudentAttendanceAlert,
  sendStudentFeeReminder,
  sendReportCardAlert,
} from "@/lib/school/whatsappSchoolService";
import prisma from "@/server/db/prismadb";

export const POST = withApiHandler(
  async (request: Request, context: any) => {
    const body = await request.json();
    const { action, studentId, studentIds, classroomId, status, date, termName, overallGrade, gpa } = body;

    const companyId = context.user?.companyId;
    if (!companyId) {
      return formatResponse(false, null, "Authentication with company context required", 401);
    }

    if (!action) {
      return formatResponse(false, null, "Action is required (attendance, fee-reminder, report-card)", 400);
    }

    const results: any[] = [];

    // ── 1. Attendance Alert ──────────────────────────────────────────────────
    if (action === "attendance") {
      const targetIds = studentIds && Array.isArray(studentIds) ? studentIds : studentId ? [studentId] : [];
      if (targetIds.length === 0) {
        return formatResponse(false, null, "studentId or studentIds required for attendance alerts", 400);
      }

      const alertStatus = status === "LATE" ? "LATE" : "ABSENT";
      const alertDate = date ? new Date(date) : new Date();

      for (const id of targetIds) {
        const res = await sendStudentAttendanceAlert(id, alertStatus, alertDate);
        results.push({ studentId: id, ...res });
      }

      return formatResponse(true, results, `Sent ${results.filter((r) => r.sent).length}/${results.length} attendance alerts`, 200);
    }

    // ── 2. Fee Reminder ───────────────────────────────────────────────────────
    if (action === "fee-reminder") {
      let targetIds: string[] = [];

      if (classroomId) {
        const classroom = await prisma.classroom.findUnique({
          where: { id: classroomId },
          select: { name: true },
        });

        const students = await prisma.student.findMany({
          where: {
            companyId,
            OR: [
              ...(classroom?.name ? [{ currentClass: classroom.name }] : []),
              {
                enrolledCourses: {
                  some: {
                    course: {
                      classSchedules: { some: { classroomId } },
                    },
                  },
                },
              },
            ],
          },
          select: { id: true },
        });
        targetIds = students.map((s) => s.id);
      } else if (studentIds && Array.isArray(studentIds)) {
        targetIds = studentIds;
      } else if (studentId) {
        targetIds = [studentId];
      }

      if (targetIds.length === 0) {
        return formatResponse(false, null, "No target students identified for fee reminders", 400);
      }

      for (const id of targetIds) {
        const res = await sendStudentFeeReminder(id, termName);
        results.push({ studentId: id, ...res });
      }

      return formatResponse(true, results, `Processed ${results.length} fee reminders`, 200);
    }

    // ── 3. Report Card Alert ──────────────────────────────────────────────────
    if (action === "report-card") {
      if (!studentId || !termName || !overallGrade) {
        return formatResponse(false, null, "studentId, termName, and overallGrade are required", 400);
      }

      const res = await sendReportCardAlert(studentId, termName, overallGrade, Number(gpa) || 0);
      return formatResponse(res.sent, res, res.sent ? "Report card WhatsApp alert sent" : (res.error || "Failed to send"), res.sent ? 200 : 400);
    }

    return formatResponse(false, null, `Unsupported notification action: ${action}`, 400);
  },
  { requireAuth: true }
);
