import { NextRequest, NextResponse } from 'next/server';
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/sales-agents/[agentId]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');
    const classroomId = searchParams.get('classroomId');

    if (!examId) {
      return NextResponse.json({ success: false, error: "Missing examId" }, { status: 400 });
    }

    // 1. Get the assignment details to find the courseId if classroomId is missing
    // const assignment = await prisma.courseAssignment.findUnique({
    //   where: { id: examId },
    //   select: { courseId: true, classroomId: true }
    // });

    // if (!assignment) {
    //   return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    // }

    // 2. Fetch all students belonging to the classroom OR course
    // / 2. Determine target group (Specific Classroom OR all students in the Course)
        // We prioritize the classroomId from the query string, then the assignment's classroomId, 
        // then fall back to the course.
        const targetClassroomId = classroomId;// || assignment.classroomId;
    
         // We don't use 'include' here because if a student was deleted, Prisma will crash.
            const studentMappings = await prisma.studentAcademicLevel.findMany({
              where: {
                // academicLevelId,
                // Using classroomId (lowercase 'r') to match your DB sample
                ...(targetClassroomId && targetClassroomId.length === 24 ? {  classRoomId: targetClassroomId } : {}),
              },
              select: { studentId: true },
            });
        
            const studentIds = studentMappings.map((m) => m.studentId);
        
            // 4. Fetch the actual Student records
            // This effectively filters out any orphaned records automatically
            const students = await prisma.student.findMany({
              where: {
                id: { in: studentIds },
                // companyId: companyId,
              },
              select: {
                id: true,
                parentId: true,
                user: { select: { name: true, email: true } },
                parent: { select: { user: { select: { name: true, email: true } } } },
                admissionNumber: true,
                //  grades: {
                //     where: { examId: examId },
                //     select: {
                //       id: true,
                //       score: true,
                //     },
                //     take: 1, 
                //   }
              },
              orderBy: {
                user: { name: "asc" },
              },
            });
    // const students = await prisma.student.findMany({
    //   where: {
    //     // If classroomId is provided, filter by it; otherwise, filter by course enrollment
    //     ...(classroomId || assignment.classroomId 
    //       ? { classroomId: classroomId || assignment.classroomId } 
    //       : { courses: { some: { id: assignment.courseId } } }
    //     ),
    //   },
    //   select: {
    //     id: true,
    //     name: true,
    //     admissionNumber: true,
    //     // 3. Include existing grades for this specific exam
    //     grades: {
    //       where: { examId: examId },
    //       select: {
    //         id: true,
    //         score: true,
    //       },
    //       take: 1, // One student should only have one grade per exam
    //     }
    //   },
    //   orderBy: { name: 'asc' }
    // });

    // 4. Transform data for the frontend
    const formattedData = students.map(student => ({
      id: student.id,
      name: student.user.name,
      admissionNumber: student.admissionNumber,
      existingGrade: "B"//student.grades[0] || null
    }));

    return NextResponse.json({ success: true, data: formattedData });

  } catch (error: any) {
    console.error("Eligible Students Fetch Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}