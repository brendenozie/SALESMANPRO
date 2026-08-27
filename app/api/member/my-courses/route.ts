import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Missing required studentId parameter." },
        { status: 400 },
      );
    }

    // 1. Fetch courses where the student has an explicit active enrollment
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId: studentId,
        // status: "ENROLLED",
      },
      include: {
        course: {
          include: {
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
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // 2. Format the courses data to pass directly to your custom frontend view cards
    const activeCourses = enrollments
      .filter((enrollment) => enrollment.course !== null)
      .map((enrollment) => {
        const course = enrollment.course;

        // Calculate dynamic stats instantly
        const totalModules = course.modules?.length || 0;
        const totalLessons =
          course.modules?.reduce(
            (acc, mod) => acc + (mod.lessons?.length || 0),
            0,
          ) || 0;
        const totalDuration =
          course.modules?.reduce(
            (acc, mod) =>
              acc +
              (mod.lessons?.reduce(
                (lAcc, les) => lAcc + (les.duration || 0),
                0,
              ) || 0),
            0,
          ) || 0;

        const instructor =
          course.CourseEducatorAssignment?.[0]?.educator?.user?.name ||
          "Elite Coach";

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          imageUrl: course.imageUrl,
          price: course.price,
          companyId: course.companyId,
          slug: "fitness", // standard fallback route parameter // course.slug ||
          progress: enrollment.progress || 0,
          lessonsCompleted: enrollment.lessonsCompleted || 0,
          instructor,
          stats: {
            totalModules,
            totalLessons,
            durationHrs: Math.floor(totalDuration / 60) || 1,
          },
        };
      });

    return NextResponse.json(
      { success: true, courses: activeCourses },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Failed to query user acquired items:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
