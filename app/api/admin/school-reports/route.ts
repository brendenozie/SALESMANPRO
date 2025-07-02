// app/api/reports/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Helper function to get the start of the current month
const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// Helper function to get the end of the current month
const getEndOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
};

// GET /api/reports
// Fetches comprehensive report data for a given company.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ message: "Company ID is required to fetch reports." }, { status: 400 });
    }

    // --- Overall School Metrics ---
    // In a real application, you'd fetch these from your User, Student, Educator, Class models.
    // For now, we'll use mock data.
    let totalStudents = 0;
    let totalTeachers = 0;
    let totalClasses = 0;
    let averageAttendance = 'N/A'; // Requires Attendance model

    try {
      // Example: Fetch actual counts if User/Student/Educator models are available and roles are defined
      // const usersCount = await prisma.user.count({ where: { companyId } });
      // Assuming 'Student' and 'Educator' are separate models or roles within 'User'
      const studentsCount = await prisma.student.count({ where: { companyId } });
      const educatorsCount = await prisma.educator.count({ where: { companyId } });
      // Assuming 'Class' or 'Course' count can represent total classes
      const coursesCount = await prisma.course.count({ where: { companyId } });

      totalStudents = studentsCount;
      totalTeachers = educatorsCount;
      totalClasses = coursesCount; // Using courses as a proxy for classes
      // averageAttendance would need an Attendance model to calculate
    } catch (dbError: any) {
      console.warn("Could not fetch real counts for overall metrics, using mock data:", dbError.message);
      // Fallback to static mock data if DB operations fail or models are not fully set up
      totalStudents = 1245;
      totalTeachers = 86;
      totalClasses = 55;
      averageAttendance = '92.5%';
    }

    const overallStats = {
      totalStudents: totalStudents.toLocaleString(),
      totalTeachers: totalTeachers.toLocaleString(),
      totalClasses: totalClasses.toLocaleString(),
      averageAttendance: averageAttendance,
    };

    // --- Student Performance Data (Mock Data) ---
    const studentPerformanceData = {
      gradeDistribution: [
        { label: 'A', value: 300 },
        { label: 'B', value: 500 },
        { label: 'C', value: 350 },
        { label: 'D', value: 70 },
        { label: 'F', value: 25 },
      ],
      attendanceTrend: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        data: [90, 91, 92, 93, 92, 94, 93], // Example percentages
      },
      topPerformingGrades: [
        { grade: 'Grade 8', avgGPA: 3.9 },
        { grade: 'Grade 10', avgGPA: 3.7 },
        { grade: 'Grade 7', avgGPA: 3.6 },
      ],
      lowPerformingStudents: [
        { name: 'Student A', grade: '9', gpa: 1.8 },
        { name: 'Student B', grade: '7', gpa: 2.1 },
      ]
    };

    // --- Staff Reports Data (Mock Data) ---
    const staffReportsData = {
      teachersByDepartment: [
        { department: 'Math', count: 15 },
        { department: 'English', count: 12 },
        { department: 'Science', count: 18 },
        { department: 'Social Studies', count: 10 },
        { department: 'Arts', count: 8 },
      ],
      teacherActivity: {
        labels: ['Reports', 'Meetings', 'Grading', 'Planning'],
        data: [30, 20, 45, 35] // Hours/week or activities count
      }
    };

    // --- Academic Reports Data (Mock Data) ---
    const academicReportsData = {
      classEnrollmentDistribution: [
        { size: '1-15', count: 10 },
        { size: '16-25', count: 30 },
        { size: '26-35', count: 15 },
      ],
      coursePopularity: [
        { course: 'Algebra I', enrollments: 120 },
        { course: 'Literary Analysis', enrollments: 105 },
        { course: 'Biology', enrollments: 130 },
        { course: 'Introduction to Programming', enrollments: 80 },
      ]
    };

    // --- Calendar Events Summary (Real Data from Event Model) ---
    const now = new Date();
    const startOfCurrentMonth = getStartOfMonth();
    const endOfCurrentMonth = getEndOfMonth();

    const upcomingEventsSummary: { type: string; count: number; nextDate: string | null }[] = [];
    try {
      const events = await prisma.event.findMany({
        where: {
          companyId,
          eventStatus: 'SCHEDULED',
          startDateTime: {
            gte: now, // Events starting from now
          },
          OR: [ // Events that either start or end in the current month
            {
              startDateTime: {
                gte: startOfCurrentMonth,
                lte: endOfCurrentMonth,
              },
            },
            {
              endDateTime: {
                gte: startOfCurrentMonth,
                lte: endOfCurrentMonth,
              },
            },
            { // Events that span across the entire month
              startDateTime: { lte: startOfCurrentMonth },
              endDateTime: { gte: endOfCurrentMonth },
            }
          ]
        },
        orderBy: {
          startDateTime: 'asc',
        },
        select: {
          eventType: true,
          startDateTime: true,
        },
      });

      const eventTypeCounts: { [key: string]: { count: number; nextDate: Date | null } } = {};

      events.forEach(event => {
        if (!eventTypeCounts[event.eventType]) {
          eventTypeCounts[event.eventType] = { count: 0, nextDate: null };
        }
        eventTypeCounts[event.eventType].count++;
        if (
          !eventTypeCounts[event.eventType].nextDate ||
          (eventTypeCounts[event.eventType].nextDate !== null && event.startDateTime < eventTypeCounts[event.eventType].nextDate!)
        ) {
          eventTypeCounts[event.eventType].nextDate = event.startDateTime;
        }
      });

      for (const type in eventTypeCounts) {
        upcomingEventsSummary.push({
          type: type,
          count: eventTypeCounts[type].count,
          nextDate: eventTypeCounts[type].nextDate ? eventTypeCounts[type].nextDate.toLocaleDateString() : null,
        });
      }

      // Sort summary by nextDate
      upcomingEventsSummary.sort((a, b) => {
        if (a.nextDate === null) return 1;
        if (b.nextDate === null) return -1;
        return new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime();
      });

    } catch (dbError: any) {
      console.warn("Could not fetch real event summary, using mock data:", dbError.message);
      // Fallback to static mock data if DB operations fail
      upcomingEventsSummary.push(
        { type: 'ACADEMIC', count: 3, nextDate: 'July 15' },
        { type: 'HOLIDAY', count: 1, nextDate: 'Aug 1' },
        { type: 'MEETING', count: 5, nextDate: 'July 28' }
      );
    }


    return NextResponse.json({
      overallStats,
      studentPerformanceData,
      staffReportsData,
      academicReportsData,
      upcomingEventsSummary,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ message: "Failed to fetch reports", error: error.message }, { status: 500 });
  }
}
