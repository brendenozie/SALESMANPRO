import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // 1. Fetch Student with all necessary relations
    const student = await prisma.student.findUnique({
      where: { userId: userId },
      include: {
        user: true,
        // Get the current classroom and academic level name
        StudentAcademicLevel: {
          include: {
            academicLevel: true,
            classRoom: true,
          },
          orderBy: { assignedAt: 'desc' },
          take: 1,
        },
        // Get courses and nested assignments
        enrolledCourses: {
          include: {
            course: {
              include: {
                CourseEducatorAssignment: {
                  include: { educator: { include: { user: true } } }
                },
                // Fetch upcoming assignments for these courses
                assignments: {
                  where: { 
                    status: "Published",
                    dueDate: { gte: new Date() } 
                  },
                  orderBy: { dueDate: 'asc' },
                  take: 3
                }
              }
            }
          }
        },
        // Get actual grades for the GPA/Performance section
        Grade: {
          include: { course: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const companyId = student.companyId;
    const currentLevel = student.StudentAcademicLevel[0];

    // 2. Fetch Relevant Announcements based on targeting
    // Filtering by audience (ALL or STUDENT or specific Student ID)
    const announcements = await prisma.announcement.findMany({
      where: {
        companyId: companyId as string,
        status: "PUBLISHED",
        OR: [
          { audience: "ALL" },
          { audience: "STUDENT", targetStudentIds: { has: student.id } },
          { audience: "ACADEMIC_LEVEL", targetAcademicLevelIds: { has: currentLevel?.academicLevelId } }
        ]
      },
      orderBy: { publishedAt: 'desc' },
      take: 4
    });

    // 3. Fetch Timetable for the student's enrolled courses
    const courseIds = student.enrolledCourses.map(ec => ec.courseId);
    const timetable = await prisma.classSchedule.findMany({
      where: {
        courseId: { in: courseIds },
        companyId: companyId as string,
      },
      include: { 
        course: true, 
        classroom: true 
      },
      orderBy: { startTime: 'asc' }
    });

    // 4. Data Transformation for the Frontend
    const responseData = {
      studentName: `${student.firstName} ${student.lastName}`,
      studentGradeLevel: currentLevel?.academicLevel?.name || student.currentClass || "General Student",
      
      studentStats: [
        { 
          title: 'Current GPA', 
          value: student.enrolledCourses.length > 0 ? (student.enrolledCourses.reduce((acc, curr) => acc + (curr.grade || 0), 0) / student.enrolledCourses.length / 25).toFixed(1) : "0.0", 
          description: 'Calculated from courses', 
          color: 'bg-blue-50' 
        },
        { 
          title: 'Assignments Due', 
          value: student.enrolledCourses.reduce((acc, curr) => acc + curr.course.assignments.length, 0).toString(), 
          description: 'Upcoming deadlines', 
          color: 'bg-purple-50' 
        },
        { 
          title: 'Classes Today', 
          value: timetable.length.toString(), 
          description: 'Scheduled today', 
          color: 'bg-yellow-50' 
        },
        { 
          title: 'Attendance', 
          value: '98%', // Placeholder: logic depends on AttendanceRecord count
          description: 'Term average', 
          color: 'bg-green-50' 
        },
      ],

      upcomingAssignments: student.enrolledCourses.flatMap(ec => 
        ec.course.assignments.map(a => ({
          id: a.id,
          title: a.title,
          class: ec.course.title,
          dueDate: a.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          status: 'Pending'
        }))
      ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 4),

      myCourses: student.enrolledCourses.map(ec => ({
        id: ec.course.id,
        name: ec.course.title,
        teacher: ec.course.CourseEducatorAssignment[0]?.educator.user?.name || "TBD",
        schedule: "Regular Session",
        currentGrade: ec.grade ? `${ec.grade}%` : "N/A"
      })),

      recentGrades: student.Grade.map(g => ({
        id: g.id,
        assignment: g.course.title + " Assessment",
        subject: g.course.title,
        grade: `${g.gradeValue}%`,
        date: g.createdAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })),

      personalTimetable: timetable.map(slot => ({
        time: `${new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        event: slot.course.title,
        location: slot.classroom?.name || "Online"
      })),

      studentAnnouncements: announcements.map(ann => ({
        id: ann.id,
        text: ann.title,
        type: ann.type === 'ALERT' ? 'warning' : 'info'
      }))
    };

    return NextResponse.json({ data: responseData });

  } catch (error) {
    console.error("Student Dashboard Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}