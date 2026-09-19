// app/api/student/schedule/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const getStudentSchedule = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("studentId"); // Using userId as per your provided logic

  if (!userId) {
    return formatResponse(false, null, "Missing studentId (User ID) parameter", 400);
  }

  try {
    // 1. Fetch student and their current Classroom assignment
    const student = await prisma.student.findUnique({
      where: { userId: userId },
      include: {
        user: { select: { id: true, name: true } },
        StudentAcademicLevel: {
          orderBy: { assignedAt: "desc" },
          take: 1,
          include: { 
            academicLevel: { select: { id: true, name: true } },
            classRoom: { select: { id: true, name: true } }
          },
        },
      },
    });

    if (!student) {
      return formatResponse(false, null, "Student not found", 404);
    }

    const levelEntry = student.StudentAcademicLevel[0];
    const classroomId = levelEntry?.classRoomId;

    if (!classroomId) {
      return formatResponse(false, null, "Student is not assigned to a classroom", 400);
    }

    const studentInfo = {
      id: student.id,
      name: student.user?.name || "N/A",
      gradeLevel: levelEntry?.academicLevel.name || "N/A",
      classroom: levelEntry?.classRoom?.name || "N/A",
    };

    // 2. Fetch Recurring class schedules SPECIFIC to this classroom
    // This ignores other classes of the same course in different rooms
    const classSchedules = await prisma.classSchedule.findMany({
      where: { 
        classroomId: classroomId,
        companyId: student.companyId as string 
      },
      include: {
        course: { select: { title: true } },
        educator: { include: { user: { select: { name: true } } } },
        classroom: { select: { name: true } }
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" }
      ]
    });

    const schedule = classSchedules.map((cs) => ({
      id: cs.id,
      day: cs.dayOfWeek,
      // Using toLocaleTimeString for cleaner formatting or keep ISO slice if frontend prefers
      startTime: cs.startTime.toISOString().slice(11, 16), 
      endTime: cs.endTime.toISOString().slice(11, 16),
      title: cs.course.title,
      educator: cs.educator.user?.name || "TBA",
      location: cs.classroom?.name || "Online",
      topic: cs.topic || null,
      meetingLink: cs.meetingLink || null,
      type: "class",
    }));

    // 3. One-off events: fetch registrations by userId
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId: student.user?.id || student.userId || "" },
      include: { event: true },
    });

    const events = registrations.map((reg) => {
      const e = reg.event;
      return {
        id: e.id,
        title: e.title,
        summary: e.summary || null,
        date: e.startDateTime.toISOString().slice(0, 10),
        startTime: e.startDateTime.toISOString().slice(11, 16),
        endTime: e.endDateTime?.toISOString().slice(11, 16) || "",
        location: e.location || null,
        onlineMeetingLink: e.onlineMeetingLink || null,
        type: e.eventType,
      };
    });

    return formatResponse(true, {
      student: studentInfo,
      schedule,
      events,
      companyId: student.companyId,
    });

  } catch (error) {
    console.error("Schedule Fetch Error:", error);
    return formatResponse(false, null, "Internal Server Error", 500);
  }
};

export const GET = withApiHandler(getStudentSchedule);