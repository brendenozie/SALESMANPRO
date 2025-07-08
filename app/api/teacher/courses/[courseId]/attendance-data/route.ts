// app/api/teacher/courses/[courseId]/attendance-data/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get('educatorId'); // The educator taking attendance
  const companyId = searchParams.get('companyId');   // For multi-tenancy
  const attendanceDate = searchParams.get('date');   // Optional: specific date for existing records

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'educatorId'.
  // 3. Ensure the 'educatorId' is authorized to take attendance for this 'courseId' and 'companyId'.
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
    // Assuming a course is primarily tied to one academic level for attendance purposes.
    const academicLevel = course.academicLevels.length > 0
      ? course.academicLevels[0].academicLevel
      : null;

    if (!academicLevel) {
      // A course must be linked to an academic level to fetch students for attendance
      return NextResponse.json({ message: 'Course is not linked to an academic level. Cannot fetch students for attendance.' }, { status: 400 });
    }

    // 2. Fetch Students enrolled in this course's academic level
    const students = await prisma.student.findMany({
      where: {
        academicLevelId: academicLevel.id,
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

    // 3. Fetch existing attendance records for the specified date, course, and academic level
    let existingAttendance: { [studentId: string]: string } = {};
    if (attendanceDate) {
      const records = await prisma.attendanceRecord.findMany({
        where: {
          courseId: courseId,
          academicLevelId: academicLevel.id,
          date: new Date(attendanceDate), // Filter by date
          companyId: companyId,
        },
        select: {
          studentId: true,
          status: true,
        },
      });

      records.forEach(record => {
        existingAttendance[record.studentId] = record.status;
      });
    }

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        academicLevelId: academicLevel.id,
        academicLevelName: academicLevel.name,
      },
      students: formattedStudents,
      existingAttendance: existingAttendance,
    });

  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return NextResponse.json({ message: 'Failed to fetch attendance data' }, { status: 500 });
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

  if (!courseId || !academicLevelId || !attendanceDate || !educatorId || !attendance) {
    return NextResponse.json({ message: 'Missing required attendance data' }, { status: 400 });
  }

  try {
    const recordDate = new Date(attendanceDate);

    // Prepare operations to upsert (update or insert) attendance records
    const operations = Object.entries(attendance).map(([studentId, status]) => {
      return prisma.attendanceRecord.upsert({
        where: {
          // Unique constraint: studentId, recordDate, classScheduleId (if applicable)
          // Since we are managing attendance per course/academic level and date,
          // we use a composite key for upsert.
          // Note: If you have ClassScheduleId for specific sessions, you'd add it here.
          // For now, it's per day per course/academic level.
          studentId_date_academicLevelId: {
            studentId: studentId,
            date: recordDate,
            academicLevelId: academicLevelId,
          },
        },
        update: {
          status: status as any, // Cast to AttendanceStatus enum
          recordedById: educatorId,
          updatedAt: new Date(),
        },
        create: {
          studentId: studentId,
          courseId: courseId,
          academicLevelId: academicLevelId,
          date: recordDate,
          status: status as any, // Cast to AttendanceStatus enum
          recordedById: educatorId,
          companyId: companyId,
        },
      });
    });

    await prisma.$transaction(operations); // Execute all upsert operations in a transaction

    return NextResponse.json({ message: 'Attendance saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error saving attendance:', error);
    return NextResponse.json({ message: 'Failed to save attendance' }, { status: 500 });
  }
}
