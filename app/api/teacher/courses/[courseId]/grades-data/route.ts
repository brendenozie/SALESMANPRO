// app/api/teacher/courses/[courseId]/grades-data/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure
import { formatResponse } from "@/lib/formatResponse";


// Define GradeStatus enum for validation (must match your Prisma schema enum)
export enum GradeStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

// Define types for API request/response (adjust as needed for frontend)
interface StudentGradeData {
  studentId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface CourseAssessmentData {
  id: string;
  name: string;
  type: string;
  maxScore: number;
  examDate: string;
}

interface StructuredGrades {
  [studentId: string]: {
    [assessmentKey: string]: { // assessmentKey can be examId or courseAssignmentId or a general key
      gradeId: string;
      score: number;
      gradeValue: string | null;
      gradeStatus: GradeStatus | null;
      comments: string | null;
      academicLevelAtTimeOfGradingId: string;
    };
  };
}

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  const educatorUserId = searchParams.get('educatorId'); // The educator viewing/managing grades
  // const companyId = searchParams.get('companyId');     // For multi-tenancy

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'educatorUserId'.
  // 3. Ensure the 'educatorUserId' is authorized to manage grades for this 'courseId' and 'companyId'.
  // const session = await auth();
  // if (!session || session.user.id !== educatorUserId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!courseId || !educatorUserId) {
    return NextResponse.json({ message: 'Missing courseId, educatorId, or companyId' }, { status: 400 });
  }

  try {
    // Resolve educatorUserId to Educator._id for authorization
    const educatorProfile = await prisma.educator.findUnique({
      where: { userId: educatorUserId },
      select: { id: true, companyId: true }
    });

    if (!educatorProfile ) {
      return NextResponse.json({ message: 'Educator not found or not authorized for this company.' }, { status: 403 });
    }

    // 1. Fetch Course details and its associated academic levels
    const course = await prisma.course.findUnique({
      where: { id: courseId, companyId: educatorProfile.companyId }, // Filter by companyId for multi-tenancy
      select: {
        id: true,
        title: true,
        description: true,
        academicLevels: {
          select: {
            academicLevel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found or not associated with this company.' }, { status: 404 });
    }

    // Determine the primary academic level for the course (for display/context, not direct student filtering)
    const primaryAcademicLevel = course.academicLevels.length > 0
      ? course.academicLevels[0].academicLevel
      : undefined;

    // 2. Fetch Students enrolled in this specific course
    const studentsInCourse = await prisma.courseEnrollment.findMany({
      where: {
        courseId: courseId,
        student: { // Ensure student belongs to this company if multi-tenancy is strict on students
          companyId: educatorProfile.companyId,
        }
      },
      select: {
        student: {
          select: {
            id: true,
            profilePicture: true, // Student's specific profile picture
            user: {
              select: {
                name: true,
                email: true,
                image: true, // User's general profile picture (fallback)
              },
            },
          },
        },
      },
      orderBy: { student: { user: { name: 'asc' } } },
    });

    const formattedStudents: StudentGradeData[] = studentsInCourse.map(ce => {
      const student = ce.student;
      return {
        studentId: student.id,
        name: student.user?.name || 'Unknown Student',
        email: student.user?.email || 'N/A',
        avatarUrl: student.profilePicture || student.user?.image || null, // Prioritize student's specific picture
      };
    });

    const studentIdsInCourse = formattedStudents.map(s => s.studentId);


    // 3. Fetch Exams/Assessments and Course Assignments for this course
    const exams = await prisma.exam.findMany({
      where: {
        courseId: courseId,
      },
      select: {
        id: true,
        title: true,
        type: true,
        totalPoints: true,
        date: true,
      },
      orderBy: { date: 'asc' },
    });

    const formattedExams: CourseAssessmentData[] = exams.map(exam => ({
      id: exam.id,
      name: exam.title,
      type: exam.type,
      maxScore: exam.totalPoints,
      examDate: exam.date.toISOString(),
    }));

    const courseAssignments = await prisma.courseAssignment.findMany({
      where: {
        courseId: courseId,
      },
      select: {
        id: true,
        title: true,
        type: true,
        maxGrade: true, // Assuming CourseAssignment has maxPoints
        dueDate: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    const formattedAssignments = courseAssignments.map(assignment => ({
      id: assignment.id,
      name: assignment.title,
      type: assignment.type || 'Assignment', // Default type if not present
      maxScore: assignment.maxGrade,
      examDate: assignment.dueDate ? assignment.dueDate.toISOString() : null, // Use examDate for consistency
    }));

    const allAssessments = [...formattedExams, ...formattedAssignments];


    // 4. Fetch existing Grades for this course and its enrolled students
    const grades = await prisma.grade.findMany({
      where: {
        courseId: courseId,
        companyId: educatorProfile.companyId,
        studentId: { in: studentIdsInCourse }, // Only get grades for students in this course
      },
      select: {
        id: true,
        studentId: true,
        examId: true,
        courseAssignmentId: true, // Include new field
        score: true,
        gradeValue: true,
        gradeStatus: true,
        comments: true,
        academicLevelAtTimeOfGradingId: true, // Crucial for historical context
      },
    });

    // Structure grades for easy frontend consumption: { studentId: { assessmentKey: gradeData } }
    const structuredGrades: StructuredGrades = {};
    grades.forEach(grade => {
      if (!structuredGrades[grade.studentId]) {
        structuredGrades[grade.studentId] = {};
      }
      let gradeKey: string;
      if (grade.examId) {
        gradeKey = grade.examId;
      } else if (grade.courseAssignmentId) {
        gradeKey = grade.courseAssignmentId;
      } else {
        // Fallback for general course grades not tied to a specific exam or assignment
        // A unique key is important here to avoid overwriting if multiple general grades exist for a student.
        // If only one "general" course grade is expected, ensure your frontend handles it.
        // For simplicity, we'll use a combination of student and course ID.
        gradeKey = `general_course_grade_${grade.id}`;
      }

      structuredGrades[grade.studentId][gradeKey] = {
        gradeId: grade.id,
        score: grade.score,
        gradeValue: grade.gradeValue,
        gradeStatus: grade.gradeStatus as GradeStatus,
        comments: grade.comments,
        academicLevelAtTimeOfGradingId: grade.academicLevelAtTimeOfGradingId,
      };
    });

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        academicLevelId: primaryAcademicLevel?.id,
        academicLevelName: primaryAcademicLevel?.name,
      },
      students: formattedStudents,
      assessments: allAssessments, // Combined exams and assignments
      grades: structuredGrades,
    });

  } catch (error) {
    console.error('Error fetching course grades data:', error);
    return NextResponse.json({ message: 'Failed to fetch course grades data', error: (error as Error).message }, { status: 500 });
  }
}


export async function POST(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const {
    studentId,
    courseId,
    examId, // Optional
    courseAssignmentId, // Optional, new field
    score,
    gradeValue, // Optional
    gradeStatus, // Optional
    comments,   // Optional
    recordedById, // Educator ID (User.id)
    companyId,
    academicLevelAtTimeOfGradingId, // Crucial for historical context
  } = await request.json();

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'recordedById'.
  // 3. Ensure the 'recordedById' is authorized to record grades for this student/course/company.
  // const session = await auth();
  // if (!session || session.user.id !== recordedById || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  // Basic input validation
  if (!studentId || !courseId || score === undefined || score === null || !recordedById || !companyId || !academicLevelAtTimeOfGradingId) {
    return NextResponse.json({ message: 'Missing required grade data: studentId, courseId, score, recordedById, companyId, academicLevelAtTimeOfGradingId' }, { status: 400 });
  }

  // Validate score as a number
  const parsedScore = parseFloat(score);
  if (isNaN(parsedScore)) {
    return NextResponse.json({ message: 'Score must be a valid number' }, { status: 400 });
  }

  // Validate gradeStatus if provided
  if (gradeStatus && !(Object.values(GradeStatus) as string[]).includes(gradeStatus)) {
    return NextResponse.json({ message: `Invalid gradeStatus. Must be one of: ${Object.values(GradeStatus).join(', ')}` }, { status: 400 });
  }

  try {
    // Resolve recordedById (User.id) to Educator._id for recordedBy and authorization
    const educatorProfile = await prisma.educator.findUnique({
      where: { userId: recordedById },
      select: { id: true, companyId: true }
    });

    if (!educatorProfile || educatorProfile.companyId !== companyId) {
      return NextResponse.json({ message: 'Educator not found or not authorized for this company.' }, { status: 403 });
    }
    const educatorDbId = educatorProfile.id;

    // Optional: Verify educator is assigned to this course or academic level for additional authorization
    const isAssignedToCourse = await prisma.courseEducatorAssignment.findFirst({
      where: {
        educatorId: educatorDbId,
        courseId: courseId,
      },
    });

    const isAssignedToAcademicLevel = await prisma.educatorAcademicLevelAssignment.findFirst({
      where: {
        educatorId: educatorDbId,
        academicLevelId: academicLevelAtTimeOfGradingId,
      },
    });

    if (!isAssignedToCourse && !isAssignedToAcademicLevel) {
      return NextResponse.json({ message: 'Educator is not assigned to this course or its academic level, or lacks permission.' }, { status: 403 });
    }

    // Use Prisma transaction for atomicity, especially because we need to findFirst before update/create
    const grade = await prisma.$transaction(async (tx) => {
      // Construct the where clause to find a specific grade record.
      // This logic defines what constitutes a "unique" grade for upsert purposes.
      const findWhereClause: any = {
        studentId: studentId,
        courseId: courseId,
        companyId: companyId,
        academicLevelAtTimeOfGradingId: academicLevelAtTimeOfGradingId,
      };

      if (examId) {
        findWhereClause.examId = examId;
        findWhereClause.courseAssignmentId = null; // Ensure it's explicitly not a course assignment grade
      } else if (courseAssignmentId) {
        findWhereClause.courseAssignmentId = courseAssignmentId;
        findWhereClause.examId = null; // Ensure it's explicitly not an exam grade
      } else {
        // This handles "general" course grades not tied to a specific exam or assignment
        findWhereClause.examId = null;
        findWhereClause.courseAssignmentId = null;
      }

      const existingGrade = await tx.grade.findFirst({
        where: findWhereClause,
      });

      if (existingGrade) {
        // Update the existing grade record
        return tx.grade.update({
          where: { id: existingGrade.id },
          data: {
            score: parsedScore,
            gradeValue: gradeValue,
            gradeStatus: gradeStatus as GradeStatus,
            comments: comments,
            recordedById: educatorDbId, // Use the resolved educator ID
            updatedAt: new Date(),
          },
        });
      } else {
        // Create a new grade record
        return tx.grade.create({
          data: {
            studentId: studentId,
            courseId: courseId,
            examId: examId,
            courseAssignmentId: courseAssignmentId, // Include new field
            score: parsedScore,
            gradeValue: gradeValue,
            gradeStatus: gradeStatus as GradeStatus,
            comments: comments,
            recordedById: educatorDbId, // Use the resolved educator ID
            companyId: companyId,
            academicLevelAtTimeOfGradingId: academicLevelAtTimeOfGradingId,
          },
        });
      }
    });

    return NextResponse.json(grade, { status: 200 });
  } catch (error: any) {
    console.error('Error saving grade:', error);
    // You might want to handle specific Prisma errors like 'P2002' (Unique constraint violation)
    // if you add @@unique constraints to your Grade model in the future.
    return NextResponse.json({ message: 'Failed to save grade', error: error.message }, { status: 500 });
  }
}