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

  if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

  try {
    // 1. Fetch the Educator AND their associated companyId
    
    const cacheKey = buildTenantCacheKey(userId, "educator", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const educator = await prisma.educator.findUnique({
      where: { userId: userId },
      include: {
        user: true,
        Company: true, // Crucial: This gives us the companyId even if not provided in URL
        CourseEducatorAssignment: {
          include: {
            course: {
              include: {
                enrollments: { select: { id: true } },
              }
            }
          }
        },
      }
    });

    if (!educator) return formatResponse(false, null, "Educator not found", 404);

    const effectiveCompanyId = educator.Company?.id;

    if (!effectiveCompanyId) return formatResponse(false, null, "Company ID is required", 400);

    // 2. Fetch Classes/Timetable using the discovered companyId
    const classesScheduled = await prisma.classSchedule.findMany({
        where: { 
            educatorId: educator.id,
            companyId: effectiveCompanyId 
        },
        include: { course: true, classroom: true },
        orderBy: { startTime: 'asc' }
    });

    // 3. Fetch Assignments
    const assignments = await prisma.courseAssignment.findMany({
      where: { 
        createdById: educator.id,
        status: { not: "Archived" }
      },
      include: { course: true },
      orderBy: { dueDate: 'asc' },
      take: 5
    });

    // 4. Fetch Announcements using the discovered companyId
    const announcements = await prisma.announcement.findMany({
      where: {
        companyId: effectiveCompanyId,
        status: "PUBLISHED",
        audience: { in: ["ALL", "STAFF", "EDUCATOR"] }
      },
      orderBy: { publishedAt: 'desc' },
      take: 3
    });

    // 5. Calculate Stats
    const totalStudents = educator.CourseEducatorAssignment.reduce(
      (acc, curr) => acc + (curr.course.enrollments.length || 0), 0
    );

    // 6. Final Transform
    const responseData = {
      teacherName: educator.user?.name || "Educator",
      teacherRole: educator.specialty || "Lead Educator",
      teacherStats: [
        { title: 'Total Students', value: totalStudents.toString(), color: 'bg-blue-50' },
        { title: 'Assignments Due', value: assignments.length.toString(), color: 'bg-purple-50' },
        { title: 'Today\'s Classes', value: classesScheduled.length.toString(), color: 'bg-yellow-50' },
      ],
      assignments: assignments.map(a => ({
        id: a.id,
        title: a.title,
        class: a.course.title,
        dueDate: a.dueDate.toLocaleDateString(),
        status: a.isPublished ? 'Published' : 'Draft',
        color: a.isPublished ? 'bg-green-500' : 'bg-yellow-500'
      })),
      recentAnnouncements: announcements.map(ann => ({
        id: ann.id,
        text: ann.summary || ann.title,
        type: ann.type === 'ALERT' ? 'warning' : 'info'
      })),
      myClasses: educator.CourseEducatorAssignment.map(cea => ({
        id: cea.course.id,
        name: cea.course.title,
        students: cea.course.enrollments.length,
        schedule: cea.roleInCourse || "Instructor"
      }))
    };

    try {
      await cacheSet(cacheKey, responseData, 60);
    } catch (e) {
      console.error("Failed to cache educator dashboard data:", e);
    }

    return formatResponse(true, responseData, "Educator dashboard data fetched successfully", 200);

  } catch (error) {
    console.error("Educator Fetch Error:", error);
    return formatResponse(false, null, "Internal Server Error", 500);
  }
}