// app/api/student/classes/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

export async function GET(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId'); // This is the User.id associated with the Student
  // const companyId = searchParams.get('companyId');   // For multi-tenancy

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Resolve the student's ID from the session (e.g., session.user.studentId).
  // 3. Verify the student is authorized to view their classes for this company.
  // const session = await auth();
  // if (!session || session.user.studentId !== studentId || session.user.role !== 'STUDENT') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!studentId) {
    return NextResponse.json({ message: 'Missing studentId (User ID) or companyId' }, { status: 400 });
  }

  try {
    // 1. Fetch Student details, filtering by userId (which is studentId from query) and companyId
    const student = await prisma.student.findUnique({
      where: {
        userId: studentId, // Query Student by their associated User ID
        // companyId: companyId, // Filter by companyId for multi-tenancy
      },
      select: {
        id: true, // Crucial: Get the actual Student model's ID
        companyId: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        // NEW: Fetch academic level through the StudentAcademicLevel junction table
        StudentAcademicLevel: {
          select: {
            academicLevel: {
              select: {
                name: true,
              },
            },
          },
          // Assuming a student has one primary academic level for display, take the first one.
          take: 1,
          orderBy: { assignedAt: 'desc' } // Optionally order to get the most recent if multiple exist
        },
      },
    });

    if (!student || !student.user) {
      return NextResponse.json({ message: 'Student not found or not associated with this company' }, { status: 404 });
    }

    // 2. Fetch all CourseEnrollments for this student, filtering by companyId on the enrollment itself
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId: student.id, // Use the actual Student.id from the fetched student object
        status: 'ENROLLED', // Only active enrollments
        companyId: student.companyId, // NEW: Filter directly on CourseEnrollment by companyId
      },
      select: {
        courseId: true,
        progress: true,
        grade: true, // Current grade in the course
        course: {
          select: {
            id: true,
            title: true,
            // NEW: Fetch educator through the CourseEducatorAssignment junction table
            CourseEducatorAssignment: {
              select: {
                educator: {
                  select: {
                    user: {
                      select: { name: true },
                    },
                  },
                },
              },
              // Assuming one primary educator for display, take the first.
              take: 1,
              orderBy: { createdAt: 'asc' } // Or by a role field if available
            },
            classSchedules: { // Fetch recurring schedule for the course
              select: {
                dayOfWeek: true,
                startTime: true,
                endTime: true,
                topic: true,
                meetingLink: true,
              },
              orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' },
              ],
            },
            Exam: { // Fetch exams/assignments for the course
              select: {
                id: true,
                title: true,
                date: true, // Due date
                type: true, // To filter by assignment types
                totalPoints: true,
              },
              where: {
                OR: [
                  { type: 'HOMEWORK' },
                  { type: 'PROJECT' },
                  { type: 'QUIZ' },
                ],
              },
            },
          },
        },
      },
    });

    const studentEnrolledClasses = [];
    for (const enrollment of enrollments) {
      const course = enrollment.course;
      if (!course) continue;

      // Format schedule string
      const scheduleParts: string[] = [];
      const daysMap: { [key: string]: string[] } = {}; // { DayOfWeek: [HH:MM-HH:MM, ...] }

      course.classSchedules.forEach(cs => {
        const dayName = cs.dayOfWeek;
        // Ensure startTime and endTime are Date objects before calling toLocaleTimeString
        const startTime = new Date(cs.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const endTime = new Date(cs.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        if (!daysMap[dayName]) {
          daysMap[dayName] = [];
        }
        daysMap[dayName].push(`${startTime} - ${endTime}`);
      });

      // Sort days for consistent output (Mon, Tue, Wed...)
      const sortedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      sortedDays.forEach(day => {
        if (daysMap[day]) {
          scheduleParts.push(`${day.substring(0, 3)}, ${daysMap[day].join(', ')}`);
        }
      });
      const formattedSchedule = scheduleParts.join(' | ');

      // Calculate upcoming assignments
      const now = new Date();
      const upcomingAssignments = course.Exam.filter(assignment => {
        // Ensure assignment.date is a Date object
        return new Date(assignment.date) > now;
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const upcomingAssignmentsCount = upcomingAssignments.length;
      const nextAssignmentDue = upcomingAssignments.length > 0
        ? new Date(upcomingAssignments[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'None';

      studentEnrolledClasses.push({
        id: course.id,
        name: course.title,
        // NEW: Access educator name through CourseEducatorAssignment junction table
        teacher: course.CourseEducatorAssignment[0]?.educator?.user?.name || 'N/A',
        schedule: formattedSchedule || 'No regular schedule',
        currentGrade: enrollment.grade !== null ? enrollment.grade.toFixed(2) : 'N/A',
        progress: enrollment.progress, // Added progress from enrollment
        upcomingAssignmentsCount: upcomingAssignmentsCount,
        nextAssignmentDue: nextAssignmentDue,
      });
    }

    return NextResponse.json({
      studentName: student.user.name || student.user.email,
      // NEW: Access academic level name through StudentAcademicLevel junction table
      studentGradeLevel: student.StudentAcademicLevel[0]?.academicLevel?.name || 'N/A',
      enrolledClasses: studentEnrolledClasses,
    });

  } catch (error) {
    console.error('Error fetching student classes:', error);
    return NextResponse.json({ message: 'Failed to fetch student classes Unknown error' }, { status: 500 });
  }
}