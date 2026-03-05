import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import prisma from "@/server/db/prismadb";
import { NextRequest, NextResponse } from 'next/server';
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// Define the type for the dynamic segment 'id' from the URL
interface Params {
  params: { id: string };
}

// Helper to transform the Prisma submission object into the desired API structure
// import { prisma } from '@/lib/prisma'; // Ensure this matches your project structure

/**
 * GET /api/exams/[examId]/eligible-students
 * Fetches students associated with a course/classroom and joins their existing grades.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get('classroomId');

    if (!examId) {
      return NextResponse.json({ success: false, error: "Exam ID is required" }, { status: 400 });
    }

    // 1. Fetch the assignment to verify its existence and get the courseId
    const assignment = await prisma.courseAssignment.findUnique({
      where: { id: examId },
      select: { courseId: true, classroomId: true }
    });

    if (!assignment) {
      return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    }

    // 2. Determine target group (Specific Classroom OR all students in the Course)
    // We prioritize the classroomId from the query string, then the assignment's classroomId, 
    // then fall back to the course.
    const targetClassroomId = classroomId || assignment.classroomId;

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
            admissionNumber: true
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
    //     ...(targetClassroomId 
    //       ? { classroomId: targetClassroomId } 
    //       : { courses: { some: { id: assignment.courseId } } }
    //     ),
    //   },
    //   select: {
    //     id: true,
    //     name: true,
    //     admissionNumber: true,
    //     // 3. Left Join existing grades for THIS specific exam only
        // grades: {
        //   where: { examId: examId },
        //   select: {
        //     id: true,
        //     score: true,
        //   },
        //   take: 1, 
        // }
    //   },
    //   orderBy: { name: 'asc' }
    // });

    // 4. Format data for the client: flatten the grades array to a single object
    const formattedStudents = students.map(student => ({
      id: student.id,
      name: student.user.name,
      admissionNumber: student.admissionNumber,
      existingGrade: "B"//student.grades[0] || null
    }));

    return NextResponse.json({ 
      success: true, 
      data: formattedStudents 
    });

  } catch (error: any) {
    console.error("[ELIGIBLE_STUDENTS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}