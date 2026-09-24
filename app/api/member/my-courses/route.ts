import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    let consumerId = searchParams.get("consumerId");
    let userId = searchParams.get("userId");

    if (!studentId && !consumerId && !userId) {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        userId = (session.user as any).id;
      }
    }

    if (!studentId && !consumerId && !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required identification parameter (consumerId, studentId, or userId)." },
        { status: 400 },
      );
    }

    const courseInclude = {
      CourseEducatorAssignment: {
        include: {
          educator: {
            include: {
              user: true,
            },
          },
        },
      },
      modules: {
        include: {
          lessons: true,
        },
      },
    };

    const courseMap = new Map<string, any>();

    // 1. Query by FitnessEntitlement if userId or consumerId
    let effectiveConsumerIds: string[] = [];
    if (consumerId) {
      effectiveConsumerIds.push(consumerId);
    } else if (userId) {
      const consumers = await prisma.consumer.findMany({
        where: { userId },
        select: { id: true },
      });
      effectiveConsumerIds = consumers.map((c) => c.id);
    }

    if (effectiveConsumerIds.length > 0) {
      const entitlements = await prisma.fitnessEntitlement.findMany({
        where: {
          consumerId: { in: effectiveConsumerIds },
          targetType: "COURSE",
          status: "ACTIVE",
        },
      });

      const courseIds = entitlements.map((e) => e.targetId);
      if (courseIds.length > 0) {
        const entitledCourses = await prisma.course.findMany({
          where: { id: { in: courseIds } },
          include: courseInclude,
        });

        for (const course of entitledCourses) {
          const totalModules = course.modules?.length || 0;
          const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
          const totalDuration = course.modules?.reduce(
            (acc, mod) => acc + (mod.lessons?.reduce((lAcc, les) => lAcc + (les.duration || 0), 0) || 0),
            0,
          ) || 0;
          const instructor = course.CourseEducatorAssignment?.[0]?.educator?.user?.name || "Fitness Coach";

          courseMap.set(course.id, {
            id: course.id,
            title: course.title,
            description: course.description,
            imageUrl: course.imageUrl,
            price: course.price,
            companyId: course.companyId,
            slug: "fitness",
            progress: 0,
            lessonsCompleted: 0,
            instructor,
            stats: {
              totalModules,
              totalLessons,
              durationHrs: Math.floor(totalDuration / 60) || 1,
            },
          });
        }
      }
    }

    // 2. Query by CourseEnrollment if studentId
    if (studentId) {
      const enrollments = await prisma.courseEnrollment.findMany({
        where: { studentId },
        include: { course: { include: courseInclude } },
        orderBy: { updatedAt: "desc" },
      });

      for (const enrollment of enrollments) {
        if (!enrollment.course) continue;
        const course = enrollment.course;
        const totalModules = course.modules?.length || 0;
        const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
        const totalDuration = course.modules?.reduce(
          (acc, mod) => acc + (mod.lessons?.reduce((lAcc, les) => lAcc + (les.duration || 0), 0) || 0),
          0,
        ) || 0;
        const instructor = course.CourseEducatorAssignment?.[0]?.educator?.user?.name || "Elite Coach";

        courseMap.set(course.id, {
          id: course.id,
          title: course.title,
          description: course.description,
          imageUrl: course.imageUrl,
          price: course.price,
          companyId: course.companyId,
          slug: "fitness",
          progress: enrollment.progress || 0,
          lessonsCompleted: enrollment.lessonsCompleted || 0,
          instructor,
          stats: {
            totalModules,
            totalLessons,
            durationHrs: Math.floor(totalDuration / 60) || 1,
          },
        });
      }
    }

    return NextResponse.json(
      { success: true, courses: Array.from(courseMap.values()) },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Failed to query user acquired courses:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
