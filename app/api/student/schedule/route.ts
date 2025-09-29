ts
// app/api/student/schedule/route.ts
// Handles fetching a student's schedule (recurring classes + events)

import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

const getStudentSchedule = async (request: NextRequest) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return formatResponse(false, null, "Missing studentId parameter", 400);
  }

  // Fetch student and latest academic level
  const student = await prisma.student.findUnique({
    where: { userId: studentId },
    include: {
      user: { select: { id: true, name: true } },
      StudentAcademicLevel: {
        orderBy: { assignedAt: "desc" },
        take: 1,
        include: { academicLevel: { select: { id: true, name: true } } },
      },
    },
  });

  if (!student) {
    return formatResponse(false, null, "Student not found", 404);
  }

  const levelEntry = student.StudentAcademicLevel[0];
  const academicLevelId = levelEntry?.academicLevel.id;
  const studentInfo = {
    id: student.id,
    name: student.user.name,
    gradeLevel: levelEntry?.academicLevel.name || "N/A",
  };

  // Courses for this academic level
  const courseLevels = await prisma.courseAcademicLevel.findMany({
    where: { academicLevelId, companyId: student.companyId },
    select: { courseId: true },
  });
  const courseIds = courseLevels.map((cl) => cl.courseId);

  // Recurring class schedules
  const classSchedules = await prisma.classSchedule.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      course: { select: { title: true } },
      educator: { include: { user: { select: { name: true } } } },
    },
  });

  const schedule = classSchedules.map((cs) => ({
    id: cs.id,
    day: cs.dayOfWeek,
    startTime: cs.startTime.toISOString().slice(11, 16),
    endTime: cs.endTime.toISOString().slice(11, 16),
    title: `${cs.course.title} - ${cs.educator.user.name}`,
    topic: cs.topic || null,
    meetingLink: cs.meetingLink || null,
    type: "class",
  }));

  // One-off events: fetch registrations by userId
  const registrations = await prisma.eventRegistration.findMany({
    where: { userId: student.user.id },
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
};

export const GET = withApiHandler(getStudentSchedule);

