import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { formatResponse } from "@/lib/formatResponse";


const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { message: 'Missing studentId or companyId parameter' },
        { status: 400 }
      );
    }

    // Fetch student and latest academic level for this company
    const student = await prisma.student.findUnique({
      where: { userId: studentId },
      include: {
        user: { select: { id: true, name: true } },
        StudentAcademicLevel: {
          // where: { companyId },
          orderBy: { assignedAt: 'desc' },
          take: 1,
          include: { academicLevel: { select: { id: true, name: true } } }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    const levelEntry = student.StudentAcademicLevel[0];
    const academicLevelId = levelEntry?.academicLevel.id;
    const studentInfo = {
      id: student.id,
      name: student.user.name,
      gradeLevel: levelEntry?.academicLevel.name || 'N/A'
    };

    // Find courses available for this academic level
    const courseLevels = await prisma.courseAcademicLevel.findMany({
      where: { academicLevelId, companyId: student.companyId },
      select: { courseId: true }
    });
    const courseIds = courseLevels.map(cl => cl.courseId);

    // Recurring class schedules for these courses
    const classSchedules = await prisma.classSchedule.findMany({
      where: {
        // companyId: student.companyId ,
        courseId: { in: courseIds }
      },
      include: {
        course: { select: { title: true } },
        educator: { include: { user: { select: { name: true } } } }
      }
    });

    const schedule = classSchedules.map(cs => ({
      id: cs.id,
      day: cs.dayOfWeek,
      startTime: cs.startTime.toISOString().slice(11, 16),
      endTime: cs.endTime.toISOString().slice(11, 16),
      title: `${cs.course.title} - ${cs.educator.user.name}`,
      topic: cs.topic || null,
      meetingLink: cs.meetingLink || null,
      type: 'class'
    }));

    // One-off events: fetch registrations by userId
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId: student.user.id },
      include: { event: true }
    });

    const events = registrations.map(reg => {
      const e = reg.event;
      return {
        id: e.id,
        title: e.title,
        summary: e.summary || null,
        date: e.startDateTime.toISOString().slice(0, 10),
        startTime: e.startDateTime.toISOString().slice(11, 16),
        endTime: e.endDateTime?.toISOString().slice(11, 16) || '',
        location: e.location || null,
        onlineMeetingLink: e.onlineMeetingLink || null,
        type: e.eventType
      };
    });

    return NextResponse.json({
      student: studentInfo,
      schedule,
      events,
      companyId: student.companyId 
    });
  } catch (err: any) {
    console.error('[GET /api/student/schedule] Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
