// app/api/teacher-subjects/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

export const GET = withApiHandler(async (request: Request) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(request.url);
  const teacherUserId = searchParams.get("teacherUserId");

  if (!teacherUserId) {
    return formatResponse(false, null, "Missing teacherUserId", 400);
  }

  try {
    // 1. Find Educator profile linked to teacherUserId
    const educator = await prisma.educator.findUnique({
      where: { userId: teacherUserId },
      select: {
        id: true,
        companyId: true,
        user: { select: { name: true, email: true, role: true } },
      },
    });

    if (!educator) {
      return formatResponse(false, null, "Educator not found", 404);
    }

    if (!educator.companyId) {
      return formatResponse(false, null, "Educator is not associated with a company", 400);
    }

    const teacherInfo = {
      id: educator.id,
      name: educator.user?.name || "N/A",
      email: educator.user?.email || "N/A",
      role: educator.user?.role,
    };

    // 2. Fetch courses relevant to this educator
    const assignedCourses = await prisma.course.findMany({
      where: {
        companyId: educator.companyId,
        OR: [
          {
            CourseEducatorAssignment: {
              some: { educatorId: educator.id },
            },
          },
          {
            academicLevels: {
              some: {
                academicLevel: {
                  educatorAssignments: { some: { educatorId: educator.id } },
                },
              },
            },
          },
        ],
      },
      include: {
        academicLevels: {
          select: { academicLevel: { select: { id: true, name: true, description: true } } },
        },
        enrollments: { select: { studentId: true } },
        assignments: {
          select: { id: true, title: true, dueDate: true, status: true },
          orderBy: { dueDate: "asc" },
        },
        CourseMaterial: {
          select: { id: true, title: true, type: true },
          orderBy: { createdAt: "desc" },
        },
        classSchedules: {
          where: { educatorId: educator.id },
          include: {
            classroom: { select: { id: true, name: true } },
            academicLevel: { select: { id: true, name: true } },
          },
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
      orderBy: { title: "asc" },
    });

    // const assignedCourses = await prisma.course.findMany({
    //   where: {
    //     companyId: educator.companyId,
    //     OR: [
    //       {
    //         CourseEducatorAssignment: {
    //           some: { educatorId: educator.id },
    //         },
    //       },
    //       {
    //         academicLevels: {
    //           some: {
    //             academicLevel: {
    //               educatorAssignments: { some: { educatorId: educator.id } },
    //             },
    //           },
    //         },
            
    //       },
    //     ],
    //   },
    //   include: {
    //     academicLevels: {
    //       select: { academicLevel: { select: { id: true, name: true, description: true } } },
    //     },
    //     enrollments: { select: { studentId: true } },
    //     assignments: {
    //       select: { id: true, title: true, dueDate: true, status: true },
    //       orderBy: { dueDate: "asc" },
    //     },
    //     CourseMaterial: { select: { id: true, title: true, type: true }, orderBy: { createdAt: "desc" } },
    //   },
    //   orderBy: { title: "asc" },
    // });

    // const teacherClasses = assignedCourses.map(course => ({
    //   id: course.id,
    //   title: course.title,
    //   description: course.description,
    //   code: course.code,
    //   schedule: "Mon, Wed, Fri | 9:00 AM - 9:45 AM", // Placeholder
    //   room: "Room 101", // Placeholder
    //   studentsEnrolled: course.enrollments.length,
    //   academicLevel: course.academicLevels[0]?.academicLevel || { id: "N/A", name: "No Academic Level", description: null },
    //   students: [],
    //   assignments: course.assignments.map(a => ({ id: a.id, title: a.title, dueDate: a.dueDate.toISOString(), status: a.status })),
    //   resources: course.CourseMaterial.map(m => ({ id: m.id, name: m.title, type: m.type })),
    //   events: [],
    // }));

    const teacherClasses = assignedCourses.map(course => {
      const schedules = course.classSchedules.map(s => ({
        id: s.id,
        day: s.dayOfWeek,
        startTime: formatTime(s.startTime),
        endTime: formatTime(s.endTime),
        classroom: s.classroom
          ? { id: s.classroom.id, name: s.classroom.name }
          : null,
        academicLevel: s.academicLevel
          ? { id: s.academicLevel.id, name: s.academicLevel.name }
          : null,
        topic: s.topic,
        meetingLink: s.meetingLink,
      }));

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        code: course.code,
        studentsEnrolled: course.enrollments.length,
        academicLevel: course.academicLevels[0]?.academicLevel || null,
        schedules,
        assignments: course.assignments.map(a => ({
          id: a.id,
          title: a.title,
          dueDate: a.dueDate.toISOString(),
          status: a.status,
        })),
        resources: course.CourseMaterial.map(m => ({
          id: m.id,
          name: m.title,
          type: m.type,
        })),
        events: [],
      };
    });

    const themeSettings = { primaryColor: "#4F46E5", accentColor: "#818CF8" };

    return formatResponse(true, { teacherInfo, themeSettings, teacherClasses });
  } catch (error: any) {
    console.error("Error fetching teacher subjects:", error);
    return formatResponse(false, null, error.message || "Failed to fetch teacher subjects", 500);
  }
});



  const formatTime = (date: Date) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
