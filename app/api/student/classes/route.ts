// app/api/student/classes/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId'); // The student whose classes are being viewed
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

  if (!studentId ) {
    return NextResponse.json({ message: 'Missing studentId or companyId' }, { status: 400 });
  }

  try {
    // 1. Fetch Student details
    const student = await prisma.student.findUnique({
      where: { userId: studentId, },
      select: {
        id: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        academicLevel: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!student || !student.user ) {
      return NextResponse.json({ message: 'Student not found or not associated with this company' }, { status: 404 });
    }

    // 2. Fetch all CourseEnrollments for this student
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId: studentId,
        status: 'ENROLLED', // Only active enrollments
      },
      select: {
        courseId: true,
        progress: true,
        grade: true, // Current grade in the course
        course: {
          select: {
            id: true,
            title: true,
            instructor: { // Fetch teacher details
              select: {
                id: true,
                user: {
                  select: { name: true },
                },
              },
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
            Exam: { // Fetch assignments for the course
              select: {
                id: true,
                title: true,
                date: true, // Due date
                type: true, // To filter by assignment types
                totalPoints: true,
              },
              where: {
                // Filter for assignments that are not yet graded or are published
                // You might need more sophisticated logic here based on your ExamType/ExamStatus
                // For simplicity, let's consider HOMEWORK and PROJECT as assignments
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
        const startTime = cs.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const endTime = cs.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
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
        // Consider assignments due in the future and not yet submitted/graded by the student
        // This requires fetching student's submissions for each assignment, which is complex for this API.
        // For simplicity, we'll just filter by future due dates for "upcoming".
        return assignment.date > now;
      }).sort((a, b) => a.date.getTime() - b.date.getTime());

      const upcomingAssignmentsCount = upcomingAssignments.length;
      const nextAssignmentDue = upcomingAssignments.length > 0
        ? upcomingAssignments[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'None';

      studentEnrolledClasses.push({
        id: course.id,
        name: course.title,
        teacher: course.instructor?.user?.name || 'N/A',
        schedule: formattedSchedule || 'No regular schedule',
        // 'room' is not directly on Course or ClassSchedule in your schema,
        // so we'll omit it or derive it from ClassSchedule.topic if that's the intent.
        // For now, let's omit 'room' as it's not a direct field.
        currentGrade: enrollment.grade !== null ? enrollment.grade.toFixed(2) : 'N/A',
        upcomingAssignmentsCount: upcomingAssignmentsCount,
        nextAssignmentDue: nextAssignmentDue,
      });
    }

    return NextResponse.json({
      studentName: student.user.name || student.user.email,
      studentGradeLevel: student.academicLevel?.name || 'N/A',
      enrolledClasses: studentEnrolledClasses,
    });

  } catch (error) {
    console.error('Error fetching student classes:', error);
    return NextResponse.json({ message: 'Failed to fetch student classes' }, { status: 500 });
  }
}
