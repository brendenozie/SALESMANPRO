import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { formatResponse } from "@/lib/formatResponse";
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
    // 1. Fetch Student and their current Classroom Anchor
    
    const cacheKey = buildTenantCacheKey(userId, "student", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const student = await prisma.student.findUnique({
      where: { userId: userId },
      include: {
        user: true,
        StudentAcademicLevel: {
          include: {
            academicLevel: true,
            classRoom: true,
          },
          orderBy: { assignedAt: 'desc' },
          take: 1,
        },
        Grade: {
          include: { course: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!student || !student.StudentAcademicLevel[0]) {
      return NextResponse.json({ error: "Student or Classroom assignment not found" }, { status: 404 });
    }

    const currentLevelEntry = student.StudentAcademicLevel[0];
    const classroomId = currentLevelEntry.classRoomId;
    const academicLevelId = currentLevelEntry.academicLevelId;
    const companyId = student.companyId;

    // 2. Load Courses assigned to this CLASSROOM (instead of enrollment table)
    // We use CourseEducatorAssignment because it links Courses + Educators to specific Classrooms
    const classroomCourses = await prisma.courseEducatorAssignment.findMany({
      where: { classRoomId: classroomId as string },
      include: {
        course: {
          include: {
            assignments: {
              where: {
                status: "Published",
                dueDate: { gte: new Date() }
              },
              orderBy: { dueDate: 'asc' },
              take: 3
            }
          }
        },
        educator: { include: { user: true } }
      }
    });

    const courseIds = classroomCourses.map(c => c.courseId);

    // 3. Fetch Timetable specifically for this Classroom
    const timetable = await prisma.classSchedule.findMany({
      where: {
        classroomId: classroomId,
        companyId: companyId as string,
      },
      include: { 
        course: true, 
        classroom: true 
      },
      orderBy: { startTime: 'asc' }
    });

    // 4. Fetch Targeted Announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        companyId: companyId as string,
        status: "PUBLISHED",
        OR: [
          { audience: "ALL" },
          { audience: "STUDENT", targetStudentIds: { has: student.id } },
          { audience: "ACADEMIC_LEVEL", targetAcademicLevelIds: { has: academicLevelId } }
        ]
      },
      orderBy: { publishedAt: 'desc' },
      take: 4
    });

    // 5. Data Transformation
    const responseData = {
      studentName: `${student.firstName} ${student.lastName}`,
      studentGradeLevel: `${currentLevelEntry.classRoom?.name || "No Classroom"} - ${currentLevelEntry.academicLevel?.name}`,
      
      studentStats: [
        { 
          title: 'GPA', 
          value: student.Grade.length > 0 ? (student.Grade.reduce((acc, curr) => acc + (Number(curr.gradeValue) || 0), 0) / student.Grade.length).toFixed(1) : "N/A", 
          description: 'Overall performance', 
          color: 'bg-blue-50' 
        },
        { 
          title: 'Assignments Due', 
          value: classroomCourses.reduce((acc, curr) => acc + curr.course.assignments.length, 0).toString(), 
          description: 'Across all subjects', 
          color: 'bg-purple-50' 
        },
        { 
          title: 'Classroom Hours', 
          value: timetable.length.toString(), 
          description: 'Daily sessions', 
          color: 'bg-yellow-50' 
        },
        { 
          title: 'Attendance', 
          value: '98%', // You would query AttendanceRecord where studentId and classroomId match
          description: 'Current term', 
          color: 'bg-green-50' 
        },
      ],

      // Map assignments from the classroom courses
      upcomingAssignments: classroomCourses.flatMap(cc => 
        cc.course.assignments.map(a => ({
          id: a.id,
          title: a.title,
          class: cc.course.title,
          dueDate: a.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          status: 'Pending'
        }))
      ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 4),

      // Map courses based on the Classroom context
      myCourses: classroomCourses.map(cc => ({
        id: cc.course.id,
        name: cc.course.title,
        teacher: cc.educator.user?.name || "TBD",
        schedule: "Classroom Session",
        // Note: For grades, you might still check CourseEnrollment if you keep it for grade storage,
        // otherwise query student.Grade filtered by courseId.
        currentGrade: "See details" 
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
        location: slot.classroom?.name || "Room assigned"
      })),

      studentAnnouncements: announcements.map(ann => ({
        id: ann.id,
        text: ann.title,
        type: ann.type === 'ALERT' ? 'warning' : 'info'
      }))
    };

    // --- CACHE THE RESPONSE ---
    try {
      await cacheSet(cacheKey, responseData, 60); // Cache for 60 seconds
    } catch (e) {
      console.error("Cache Set Error:", e);
    }

    return formatResponse(true, responseData, "Student dashboard data fetched successfully", 200);

  } catch (error) {
    console.error("Student Dashboard Error:", error);
    return formatResponse(false, { error: "Internal Server Error" }, "Failed to fetch student dashboard data", 500);
  }
}