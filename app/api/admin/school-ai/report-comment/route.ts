/**
 * POST /api/admin/school-ai/report-comment
 *
 * Generates a draft end-of-term report card narrative comment.
 * Teacher must review and approve before saving to the grade/report record.
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { schoolAIService, ReportCommentInput } from "@/lib/school/schoolAIService";
import { v4 as uuidv4 } from "uuid";

export const POST = withApiHandler(
  async (request: NextRequest, context) => {
    const body = await request.json();
    const {
      studentName,
      subject,
      averageScore,
      letterGrade,
      absences,
      strengths,
      areasForImprovement,
      teacherName,
      companyId,
    } = body;

    if (!studentName || !subject || averageScore === undefined || !letterGrade || !companyId) {
      return formatResponse(
        false,
        null,
        "studentName, subject, averageScore, letterGrade, and companyId are required",
        400
      );
    }

    const userId = context.user?.id;
    if (!userId) return formatResponse(false, null, "Authentication required", 401);

    const input: ReportCommentInput = {
      studentName,
      subject,
      averageScore: Number(averageScore),
      letterGrade,
      absences: Number(absences ?? 0),
      strengths,
      areasForImprovement,
      teacherName,
    };

    const draft = await schoolAIService.generateReportComment(
      input,
      companyId,
      userId,
      `report_comment_${uuidv4()}`
    );

    return formatResponse(
      true,
      { ...draft, isDraft: true },
      "Report comment draft generated. Please review before saving.",
      200
    );
  },
  { requireAuth: true }
);
