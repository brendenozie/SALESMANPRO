import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/admin/students/[id]/promote/route.ts
import prisma from "@/server/db/prismadb";
import { StudentLevelStatus } from "@prisma/client";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function promoteStudent(req: Request, { params }: { params: { id: string } }) {
  try {
    const studentId = params.id;
    const body = await req.json();

    const {
      fromAcademicLevelId,
      year,
    } = body;

    if (!nextAcademicLevelId || !year) {
      return formatResponse(false, null, "Next academic level and year are required", 400);
    }

    const students = await prisma.studentAcademicLevel.findMany({
      where: {
        academicLevelId: fromAcademicLevelId,
        year: year,
      },
      select: { studentId: true },
    });

  const result = await prisma.$transaction(
      students.map(s =>
        prisma.studentAcademicLevel.create({
          data: {
            studentId: s.studentId,
            academicLevelId: toAcademicLevelId,
            year,
            term,
            session,
          },
        })
      )
    );

    try {
      await cacheDel(`tenant:${companyId}:promote-bulk:*`);
      await cacheDel(`admin:promote-bulk:*`);
    } catch (e) {}
    return formatResponse(true, result, "Student promoted successfully", 201);
  } catch (error: any) {
    return formatResponse(false, null, error.message, 500);
  }
}

export const POST = withApiHandler(promoteStudent);
