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
      nextAcademicLevelId,
      nextClassRoomId,
      year,
      term,
      session,
      levelStatus,
    } = body;

    if (!nextAcademicLevelId || !year) {
      return formatResponse(false, null, "Next academic level and year are required", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Validate student
      const student = await tx.student.findUnique({ where: { id: studentId } });
      if (!student) throw new Error("Student not found");

      // 2️⃣ Validate academic level
      const academicLevel = await tx.academicLevel.findUnique({
        where: { id: nextAcademicLevelId },
      });
      if (!academicLevel) throw new Error("Invalid academic level");

      // 3️⃣ Validate classroom (optional)
      if (nextClassRoomId) {
        const classroom = await tx.classroom.findUnique({
          where: { id: nextClassRoomId },
        });
        if (!classroom) throw new Error("Invalid classroom");
      }

      // 4️⃣ Prevent duplicate promotion for same year + level
      const exists = await tx.studentAcademicLevel.findFirst({
        where: {
          studentId,
          academicLevelId: nextAcademicLevelId,
          year,
        },
      });

      if (exists) {
        throw new Error("Student already promoted to this level for the given year");
      }

      // 5️⃣ Create promotion record
      const promotion = await tx.studentAcademicLevel.create({
        data: {
          studentId,
          academicLevelId: nextAcademicLevelId,
          classRoomId: nextClassRoomId || null,
          year,
          term: term || null,
          session: session || null,
          levelStatus: levelStatus || null,
        },
      });

      // 6️⃣ Update quick-access student status (optional but useful)
      await tx.student.update({
        where: { id: studentId },
        data: {
          academicLevel: levelStatus || student.academicLevel,
          currentClass: null, // optional: deprecate this field
        },
      });

      return promotion;
    });

    return formatResponse(true, result, "Student promoted successfully", 201);
  } catch (error: any) {
    return formatResponse(false, null, error.message, 500);
  }
}

export const POST = withApiHandler(promoteStudent);
