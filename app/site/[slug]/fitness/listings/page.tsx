// app/[slug]/fitness/page.tsx

import React from "react";
import prisma from "@/server/db/prismadb";

import FitnessCoursesListingView from "./FitnessCoursesListingView";

export const revalidate = 60;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function FitnessCoursesPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const company = await prisma.company.findFirst({
    where: {
      slug,
    },
  });

  if (!company) {
    return null;
  }

  const courses = await prisma.course.findMany({
    where: {
      companyId: company.id,
    },

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

    orderBy: {
      createdAt: "desc",
    },
  });

  const transformedCourses = courses.map(
    (course) => {
      const totalLessons =
        course.modules.reduce(
          (acc, module) =>
            acc + module.lessons.length,
          0,
        ) || 0;

      const totalDuration =
        course.modules.reduce(
          (acc, module) =>
            acc +
            module.lessons.reduce(
              (lessonAcc, lesson) =>
                lessonAcc +
                (lesson.duration || 0),
              0,
            ),
          0,
        ) || 0;

      return {
        ...course,

        totalLessons,

        totalModules:
          course.modules.length,

        totalDuration,

        instructor:
          course
            ?.CourseEducatorAssignment?.[0]
            ?.educator?.user?.name ||
          "Elite Coach",
      };
    },
  );

  return (
    <FitnessCoursesListingView
      company={company}
      courses={transformedCourses}
    />
  );
}