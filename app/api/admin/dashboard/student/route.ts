/**
 * GET /api/admin/dashboard/student?companyId=xxx&studentId=xxx
 *
 * Student overview dashboard data — live from DB.
 * Returns: enrolled courses, pending assignments, grades, attendance, schedule.
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { findCompanyCached } from "@/lib/company-fetcher";
import { getStudentOverview } from "@/lib/school/schoolService";
import prisma from "@/server/db/prismadb";

export const GET = withApiHandler(
  async (request: NextRequest, context) => {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const slug = searchParams.get("slug");
    const studentId = searchParams.get("studentId");

    const userId = context.user?.id;

    let resolvedCompanyId = companyId;
    if (!resolvedCompanyId && slug) {
      const company = await findCompanyCached(slug);
      if (!company) return formatResponse(false, null, "Company not found", 404);
      resolvedCompanyId = company.id;
    }

    if (!resolvedCompanyId) {
      return formatResponse(false, null, "companyId or slug is required", 400);
    }

    // Resolve student ID
    let resolvedStudentId = studentId;
    if (!resolvedStudentId && userId) {
      const student = await prisma.student.findFirst({
        where: { userId, companyId: resolvedCompanyId },
        select: { id: true },
      });
      resolvedStudentId = student?.id ?? null;
    }

    if (!resolvedStudentId) {
      return formatResponse(false, null, "Student profile not found", 404);
    }

    const overview = await getStudentOverview(resolvedStudentId, resolvedCompanyId);

    return formatResponse(true, overview, "Student dashboard data retrieved", 200);
  },
  { requireAuth: true }
);
