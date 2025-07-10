// app/api/teacher/courses/[courseId]/attendance-data/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

// Define AttendanceStatus to match your Prisma schema
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'TARDY' | 'EXCUSED';

// Define types for API request/response (adjust as needed for frontend)
interface StudentAttendanceData {
  studentId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  currentStatus: AttendanceStatus; // For GET response
}

interface CourseAttendancePageData {
  course: {
    id: string;
    title: string;
    academicLevelId?: string; // Optional if a course can have multiple
    academicLevelName?: string; // Optional
  };
  students: StudentAttendanceData[];
}


export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  const educatorUserId = searchParams.get('educatorId'); // The educator's User.id
  const companyId = searchParams.get('companyId');     // For multi-tenancy
  const dateStr = searchParams.get('date');           // Optional: specific date for existing records

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'educatorUserId'.
  // 3. Ensure the 'educatorUserId' is authorized to take attendance for this 'courseId' and 'companyId'.
  // const session = await auth();
  // if (!session || session.user.id !== educatorUserId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!courseId || !educatorUserId || !companyId) {
    return NextResponse.json({ message: 'Missing courseId, educatorId, or companyId' }, { status: 400 });
  }

  try {
    // Resolve educatorUserId to Educator._id for authorization and recordedById
    const educatorProfile = await prisma.educator.findUnique({
      where: { userId: educatorUserId },
      select: { id: true, companyId: true }
    });

    if (!educatorProfile || educatorProfile.companyId !== companyId) {
      return NextResponse.json({ message: 'Educator not found or not authorized for this company.' }, { status: 403 });
    }
    // const educatorDbId = educatorProfile.id; // Not directly used in GET, but good for context

    // 1. Fetch Course details
    const course = await prisma.course.findUnique({
      where: { id: courseId, companyId: companyId }, // Filter by companyId for multi-tenancy
      select: {
        id: true,
        title: true,
        academicLevels: { // Include academic levels associated with the course
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

    // Determine a primary academic level for display purposes if needed.
    // Note: A course can be linked to multiple academic levels.
    const primaryAcademicLevel = course.academicLevels.length > 0
      ? course.academicLevels[0].academicLevel
      : undefined; // Use undefined if no academic level is found

    // 2. Fetch Students enrolled in this specific course
    const studentsInCourse = await prisma.courseEnrollment.findMany({
      where: {
        courseId: courseId,
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
                image: true, // User's general profile picture
              },
            },
          },
        },
      },
      orderBy: { student: { user: { name: 'asc' } } },
    });

    const studentIdsInCourse = studentsInCourse.map(ce => ce.student.id);

    // Normalize attendance date for querying
    let normalizedAttendanceDate: Date | undefined;
    if (dateStr) {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) { // Check for valid date
        normalizedAttendanceDate = new Date(parsedDate.setUTCHours(0, 0, 0, 0));
      }
    }

    // 3. Fetch existing attendance records for these students for the specified date and course
    const existingAttendanceRecords: { [studentId: string]: AttendanceStatus } = {};
    if (normalizedAttendanceDate) {
      const records = await prisma.attendanceRecord.findMany({
        where: {
          studentId: { in: studentIdsInCourse }, // Only fetch for students in this course
          courseId: courseId, // Filter by course
          date: normalizedAttendanceDate, // Filter by normalized date
          companyId: companyId, // Filter by company
          classScheduleId: null, // As this is for general course attendance, not a specific class session
        },
        select: {
          studentId: true,
          status: true,
          createdAt: true, // To get the latest if multiple exist for some reason
        },
        orderBy: { createdAt: 'desc' }, // Order by creation to get the most recent for a student/course/date
      });

      // Process records to get the most recent status for each student
      records.forEach(record => {
        // If multiple records exist for student/course/date, pick the most recent one (due to orderBy)
        if (!existingAttendanceRecords[record.studentId]) {
            existingAttendanceRecords[record.studentId] = record.status as AttendanceStatus;
        }
      });
    }

    const formattedStudents: StudentAttendanceData[] = studentsInCourse.map(ce => {
      const student = ce.student;
      return {
        studentId: student.id,
        name: student.user?.name || 'Unknown Student',
        email: student.user?.email || 'N/A',
        avatarUrl: student.profilePicture || student.user?.image || null, // Prioritize student's specific picture
        currentStatus: existingAttendanceRecords[student.id] || 'ABSENT', // Default to ABSENT if no record
      };
    });

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        academicLevelId: primaryAcademicLevel?.id,
        academicLevelName: primaryAcademicLevel?.name,
      },
      students: formattedStudents,
    });

  } catch (error) {
    console.error('Error fetching course attendance data:', error);
    return NextResponse.json({ message: 'Failed to fetch course attendance data', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { courseId, academicLevelId, attendanceDate, educatorId, companyId, attendance } = await request.json();

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'educatorId'.
  // 3. Ensure the 'educatorId' is authorized to record attendance for this course/academic level/company.
  // const session = await auth();
  // if (!session || session.user.id !== educatorId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!courseId || !academicLevelId || !attendanceDate || !educatorId || !companyId || !attendance) {
    return NextResponse.json({ message: 'Missing required attendance data' }, { status: 400 });
  }

  try {
    const recordDate = new Date(attendanceDate);
    recordDate.setUTCHours(0, 0, 0, 0); // Normalize to start of day UTC

    // Resolve educatorId (User.id) to Educator._id for recordedById and authorization
    const educatorProfile = await prisma.educator.findUnique({
      where: { userId: educatorId },
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
        academicLevelId: academicLevelId,
      },
    });

    if (!isAssignedToCourse && !isAssignedToAcademicLevel) {
      return NextResponse.json({ message: 'Educator is not assigned to this course or its academic level, or lacks permission.' }, { status: 403 });
    }

    // Use the transaction callback overload for Prisma to handle findFirst, update, or create atomically.
    await prisma.$transaction(async (tx) => {
      const operations: Promise<any>[] = []; // Collect individual promises

      for (const [studentId, status] of Object.entries(attendance)) {
        // Look for an existing attendance record for this student, course, academic level, and date
        const existingRecord = await tx.attendanceRecord.findFirst({
          where: {
            studentId: studentId,
            courseId: courseId,
            academicLevelId: academicLevelId, // Include academicLevelId as it's passed in the payload
            date: recordDate,
            companyId: companyId,
            classScheduleId: null, // Explicitly target non-class-schedule specific records
          },
        });

        if (existingRecord) {
          // If a record exists, add an update operation to the batch
          operations.push(tx.attendanceRecord.update({
            where: { id: existingRecord.id }, // Update using the unique ID of the found record
            data: {
              status: status as AttendanceStatus,
              recordedById: educatorDbId,
              updatedAt: new Date(),
            },
          }));
        } else {
          // If no record exists, add a create operation to the batch
          operations.push(tx.attendanceRecord.create({
            data: {
              studentId: studentId,
              courseId: courseId,
              academicLevelId: academicLevelId,
              date: recordDate,
              status: status as AttendanceStatus,
              recordedById: educatorDbId,
              companyId: companyId,
              classScheduleId: null, // Explicitly set to null for course-level attendance
            },
          }));
        }
      }
      // Await all collected operations within the transaction
      await Promise.all(operations);
    });

    return NextResponse.json({ message: 'Attendance saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error saving attendance:', error);
    return NextResponse.json({ message: 'Failed to save attendance', error: (error as Error).message }, { status: 500 });
  }
}