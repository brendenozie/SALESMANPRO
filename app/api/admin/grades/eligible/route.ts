import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const examId = searchParams.get('examId');
  const assignmentId = searchParams.get('assignmentId');
  const classroomId = searchParams.get('classroomId');

  if (!classroomId) {
    return formatResponse(false, null, "classroomId is required", 400);
  }

  // 1. Get Student IDs mapped to this classroom
  const studentMappings = await prisma.studentAcademicLevel.findMany({
    where: {
      classRoomId: classroomId,
    },
    select: { studentId: true },
  });

  const studentIds = studentMappings.map((m) => m.studentId);

  // 2. Fetch Students + The specific grade record for this exam/assignment
  const students = await prisma.student.findMany({
    where: {
      id: { in: studentIds },
    },
    select: {
      id: true,
      admissionNumber: true,
      user: { select: { name: true } },
      // Important: We only fetch the ONE grade relevant to this current view
      Grade: {
        where: {
          OR: [
            ...(examId ? [{ examId }] : []),
            ...(assignmentId ? [{ courseAssignmentId: assignmentId }] : []),
          ],
        },
        take: 1, // Ensures only the specific grade is returned
      },
    },
    orderBy: {
      user: { name: "asc" },
    },
  });

  // 3. Transform for the Frontend Client Interface
  const formattedData = students.map(student => {
    const grade = student.Grade[0];
    return {
      id: student.id,
      name: student.user?.name || "Unknown Student",
      admissionNumber: student.admissionNumber,
      currentScore: grade?.score ?? "", // Use empty string for empty inputs
      gradeId: grade?.id || null,
      status: 'idle' // Matches your StudentGradeRow interface
    };
  });

  return formatResponse(true, formattedData, "Students retrieved successfully");
}, { requireAuth: true });
// import { NextRequest, NextResponse } from 'next/server';
// import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // // app/api/sales-agents/[agentId]/route.ts
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const examId = searchParams.get('examId');
//     const courseAssignmentId = searchParams.get('assignmentId');
//     const classroomId = searchParams.get('classroomId');
//     const academicYearId = searchParams.get('academicYearId');
//     const termId = searchParams.get('termId');

//     // if (!examId) {
//     //   return NextResponse.json({ success: false, error: "Missing examId" }, { status: 400 });
//     // }

//     // 1. Get the assignment details to find the courseId if classroomId is missing
//     // const assignment = await prisma.courseAssignment.findUnique({
//     //   where: { id: examId },
//     //   select: { courseId: true, classroomId: true }
//     // });

//     // if (!assignment) {
//     //   return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
//     // }

//     // 2. Fetch all students belonging to the classroom OR course
//     // / 2. Determine target group (Specific Classroom OR all students in the Course)
//         // We prioritize the classroomId from the query string, then the assignment's classroomId, 
//         // then fall back to the course.
//         const targetClassroomId = classroomId;// || assignment.classroomId;
    
//          // We don't use 'include' here because if a student was deleted, Prisma will crash.
//             const studentMappings = await prisma.studentAcademicLevel.findMany({
//               where: {
//                 // academicLevelId,
//                 // Using classroomId (lowercase 'r') to match your DB sample
//                 ...(targetClassroomId && targetClassroomId.length === 24 ? {  classRoomId: targetClassroomId } : {}),
//               },
//               select: { studentId: true },
//             });
        
//             const studentIds = studentMappings.map((m) => m.studentId);
        
//             // 4. Fetch the actual Student records
//             // This effectively filters out any orphaned records automatically
//             const students = await prisma.student.findMany({
//               where: {
//                 id: { in: studentIds },
//                 // companyId: companyId,
//               },
//               select: {
//                 id: true,
//                 parentId: true,
//                 user: { select: { name: true, email: true } },
//                 parent: { select: { user: { select: { name: true, email: true } } } },
//                 admissionNumber: true,
//                 Grade: {
//                   where: {
//                     OR: [
//                       {academicYearId: academicYearId},
//                       {termId: termId},
//                       { examId: null }, // Include students with no grade record for this exam
//                       { examId: examId }, // Replace with actual examId to include existing grades
//                       { courseAssignmentId: null }, // Include students with a grade record but no examId yet
//                       { courseAssignmentId: courseAssignmentId }, // Include students with a grade record but no score yet
//                     ]
//                   },
//                 },
//               },
//               orderBy: {
//                 user: { name: "asc" },
//               },
//             });
//     // const students = await prisma.student.findMany({
//     //   where: {
//     //     // If classroomId is provided, filter by it; otherwise, filter by course enrollment
//     //     ...(classroomId || assignment.classroomId 
//     //       ? { classroomId: classroomId || assignment.classroomId } 
//     //       : { courses: { some: { id: assignment.courseId } } }
//     //     ),
//     //   },
//     //   select: {
//     //     id: true,
//     //     name: true,
//     //     admissionNumber: true,
//     //     // 3. Include existing grades for this specific exam
//     //     grades: {
//     //       where: { examId: examId },
//     //       select: {
//     //         id: true,
//     //         score: true,
//     //       },
//     //       take: 1, // One student should only have one grade per exam
//     //     }
//     //   },
//     //   orderBy: { name: 'asc' }
//     // });

//     // 4. Transform data for the frontend
//     const formattedData = students.map(student => ({
//       id: student.id,
//       name: student.user.name,
//       admissionNumber: student.admissionNumber,
//       existingGrade: student.Grade[0] || null
//     }));

//     return NextResponse.json({ success: true, data: formattedData });

//   } catch (error: any) {
//     console.error("Eligible Students Fetch Error:", error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }