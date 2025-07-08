// app/api/teacher/courses/[courseId]/grades-data/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get('educatorId'); // The educator viewing/managing grades
  const companyId = searchParams.get('companyId');   // For multi-tenancy

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'educatorId'.
  // 3. Ensure the 'educatorId' is authorized to manage grades for this 'courseId' and 'companyId'.
  // const session = await auth();
  // if (!session || session.user.id !== educatorId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!courseId || !educatorId ) {
    return NextResponse.json({ message: 'Missing courseId, educatorId, or companyId' }, { status: 400 });
  }

  try {
    // 1. Fetch Course details and its associated academic levels
    const course = await prisma.course.findUnique({
      where: { id: courseId,},
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
      return NextResponse.json({ message: 'Course not found or not associated with this company' }, { status: 404 });
    }

    // Determine the primary academic level for the course.
    // Assuming a course is primarily tied to one academic level for student roster.
    const academicLevel = course.academicLevels.length > 0
      ? course.academicLevels[0].academicLevel
      : null;

    if (!academicLevel) {
      // A course must be linked to an academic level to fetch students
      return NextResponse.json({ message: 'Course is not linked to an academic level. Cannot fetch students for grades.' }, { status: 400 });
    }

    // 2. Fetch Students enrolled in this course's academic level
    const students = await prisma.student.findMany({
      where: {
        academicLevelId: academicLevel.id,
        companyId: companyId,
      },
      select: {
        id: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true, // For avatarUrl
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });

    const formattedStudents = students.map(student => ({
      studentId: student.id,
      name: student.user?.name || 'Unknown Student',
      email: student.user?.email || 'N/A',
      avatarUrl: student.user?.image || null,
    }));

    // 3. Fetch Exams/Assessments for this course
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
      orderBy: { date: 'asc' }, // Order assessments by date
    });

    const formattedExams = exams.map(exam => ({
      id: exam.id,
      name: exam.title,
      type: exam.type,
      maxScore: exam.totalPoints,
      examDate: exam.date.toISOString(),
    }));

    // 4. Fetch existing Grades for this course and its students
    const grades = await prisma.grade.findMany({
      where: {
        courseId: courseId,
        student: {
          academicLevelId: academicLevel.id, // Ensure we only get grades for students in this academic level
        },
      },
      select: {
        id: true,
        studentId: true,
        examId: true,
        score: true,
        gradeValue: true,
        gradeStatus: true,
        comments: true,
        academicLevelAtTimeOfGradeId: true, // Crucial for historical context
      },
    });

    // Structure grades for easy frontend consumption: { studentId: { examId: gradeData } }
    const structuredGrades: { [studentId: string]: { [examId: string]: any } } = {};
    grades.forEach(grade => {
      if (!structuredGrades[grade.studentId]) {
        structuredGrades[grade.studentId] = {};
      }
      // If grade is linked to an exam, use examId as key. Otherwise, use a generic key.
      const gradeKey = grade.examId || `course_grade_${grade.id}`; // Fallback for general course grades not tied to a specific exam
      structuredGrades[grade.studentId][gradeKey] = {
        gradeId: grade.id, // The actual Grade record ID
        score: grade.score,
        gradeValue: grade.gradeValue,
        gradeStatus: grade.gradeStatus,
        comments: grade.comments,
        academicLevelAtTimeOfGradeId: grade.academicLevelAtTimeOfGradeId,
      };
    });

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        academicLevelId: academicLevel.id,
        academicLevelName: academicLevel.name,
      },
      students: formattedStudents,
      assessments: formattedExams, // Renamed to assessments for frontend clarity
      grades: structuredGrades,
    });

  } catch (error) {
    console.error('Error fetching course grades data:', error);
    return NextResponse.json({ message: 'Failed to fetch course grades data' }, { status: 500 });
  }
}

// app/api/teacher/grades/route.ts
// import { NextResponse } from 'next/server';
// import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

// Define GradeStatus enum for validation
enum GradeStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export async function POST(request: Request) {
  const {
    studentId,
    courseId,
    examId, // Optional
    score,
    gradeValue, // Optional
    gradeStatus, // Optional
    comments,   // Optional
    recordedById, // Educator ID
    companyId,
    academicLevelAtTimeOfGradeId, // Crucial for historical context
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

  if (!studentId || !courseId || score === undefined || score === null || !recordedById || !companyId || !academicLevelAtTimeOfGradeId) {
    return NextResponse.json({ message: 'Missing required grade data: studentId, courseId, score, recordedById, companyId, academicLevelAtTimeOfGradeId' }, { status: 400 });
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
    // Determine unique identifier for upsert.
    // If examId is provided, the combination of studentId, courseId, and examId should be unique.
    // If no examId, we might need a different strategy, or assume a grade is always tied to an exam/assessment.
    // For simplicity, let's assume if examId is present, it's the unique key.
    // If not, we might need to create a new grade or update a "general" course grade.
    // The schema allows examId to be optional, so we need a robust upsert strategy.
    // A common pattern for non-exam specific grades is to have a single grade record per student per course.

    const whereClause: any = {
      studentId: studentId,
      courseId: courseId,
      companyId: companyId,
      academicLevelAtTimeOfGradeId: academicLevelAtTimeOfGradeId, // Ensure we're targeting the correct historical context
    };

    if (examId) {
      whereClause.examId = examId;
    } else {
      // If no examId, ensure we're not trying to upsert on a non-existent unique constraint.
      // For general course grades, you might need to find an existing one or create a new one.
      // For this implementation, we'll allow creating a new grade if no examId is provided
      // and no existing grade matches studentId, courseId, companyId, and academicLevelAtTimeOfGradeId without an examId.
      // This is a simplified approach. A more robust system might have a specific "overall course grade" examType.
      const existingGeneralGrade = await prisma.grade.findFirst({
        where: {
          ...whereClause,
          examId: null, // Look for grades specifically not tied to an exam
        }
      });

      if (existingGeneralGrade) {
        // If a general grade exists, update it
        const updatedGrade = await prisma.grade.update({
          where: { id: existingGeneralGrade.id },
          data: {
            score: parsedScore,
            gradeValue: gradeValue,
            gradeStatus: gradeStatus as GradeStatus,
            comments: comments,
            recordedById: recordedById,
            updatedAt: new Date(),
          },
        });
        return NextResponse.json(updatedGrade, { status: 200 });
      }
      // If no examId and no existing general grade, proceed to create a new one.
    }

    const grade = await prisma.grade.upsert({
      where: {
        // This unique constraint is for grades tied to an exam.
        // Prisma doesn't support partial unique constraints directly on `where` for `upsert`
        // that depend on whether `examId` is null or not.
        // So, we use a findFirst and then update/create.
        // The unique constraint in schema is `@@unique([studentId, courseId, examId])` if you had one.
        // But your schema has `@@index([studentId])`, `@@index([courseId])`, `@@index([examId])`.
        // To ensure uniqueness for exam-specific grades, we manually check.
        // For simplicity, we'll try to find an existing one first.
        studentId_courseId_examId_academicLevelAtTimeOfGradeId: { // This needs to be a unique compound index in your schema for upsert to work like this
          studentId: studentId,
          courseId: courseId,
          examId: examId || "", // Provide a default for unique constraint if examId is null
          academicLevelAtTimeOfGradeId: academicLevelAtTimeOfGradeId,
        },
      },
      update: {
        score: parsedScore,
        gradeValue: gradeValue,
        gradeStatus: gradeStatus as GradeStatus,
        comments: comments,
        recordedById: recordedById,
        updatedAt: new Date(),
      },
      create: {
        studentId: studentId,
        courseId: courseId,
        examId: examId,
        score: parsedScore,
        gradeValue: gradeValue,
        gradeStatus: gradeStatus as GradeStatus,
        comments: comments,
        recordedById: recordedById,
        companyId: companyId,
        academicLevelAtTimeOfGradeId: academicLevelAtTimeOfGradeId,
      },
    });

    return NextResponse.json(grade, { status: 200 });
  } catch (error: any) {
    // Handle unique constraint violation specifically if applicable
    if (error.code === 'P2002') { // Prisma unique constraint violation code
      return NextResponse.json({ message: 'A grade for this student, course, and assessment already exists.' }, { status: 409 });
    }
    console.error('Error saving grade:', error);
    return NextResponse.json({ message: 'Failed to save grade', error: error.message }, { status: 500 });
  }
}
