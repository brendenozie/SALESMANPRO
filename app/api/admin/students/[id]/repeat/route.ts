import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/students/[id]/repeat/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function repeatStudent(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = params.id;
    const body = await req.json();
    const { year, term, session, classRoomId, reason } = body;

    if (!year) {
      return formatResponse(false, null, "Year is required", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Get latest academic record
      const current = await tx.studentAcademicLevel.findFirst({
        where: { studentId },
        orderBy: { assignedAt: "desc" },
      });

      if (!current) {
        throw new Error("Student has no academic history");
      }

      // 2️⃣ Prevent duplicate repeat for same year
      const exists = await tx.studentAcademicLevel.findFirst({
        where: {
          studentId,
          academicLevelId: current.academicLevelId,
          year,
        },
      });

      if (exists) {
        throw new Error("Student already assigned to this level for the given year");
      }

      // 3️⃣ Create retention record
      return tx.studentAcademicLevel.create({
        data: {
          studentId,
          academicLevelId: current.academicLevelId,
          classRoomId: classRoomId ?? current.classRoomId,
          year,
          term: term ?? null,
          session: session ?? null,
          levelStatus: current.levelStatus,
          repeatReason: reason || "Retained",
        },
      });
    });

    try { await cacheDel(`admin:students:${result.studentId}:*`); } catch (e) {}
    return formatResponse(true, result, "Student retained successfully", 201);
  } catch (error: any) {
    return formatResponse(false, null, error.message, 500);
  }
}

export const POST = withApiHandler(repeatStudent);
