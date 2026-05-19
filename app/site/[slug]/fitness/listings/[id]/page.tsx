// app/[slug]/products/[productId]/page.tsx

import React from "react";
import { notFound } from "next/navigation";

import prisma from "@/server/db/prismadb";

import FitnessWellnessView from "./FitnessWellnessView";

import NewsletterSection from "@/components/site/NewsletterSection/NewsletterSection";

export const dynamic = "force-dynamic";

interface PageParams {
  slug: string;
  id: string;
}

interface PageProps {
  params: Promise<PageParams> | PageParams;
}

export default async function ProductPage({
  params,
}: PageProps) {
  const resolved =
    params instanceof Promise
      ? await params
      : params;

  const { id } = resolved;

  if (!id) {
    notFound();
  }

  // =========================================
  // FETCH FITNESS PROGRAM / COURSE
  // =========================================

  const program = await prisma.course.findUnique({
    where: {
      id: id,
    },

    include: {
      company: true,

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
          lessons: {
            include: {
              materials: true,
            },

            orderBy: {
              order: "asc",
            },
          },
        },

        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!program) {
    notFound();
  }

  // =========================================
  // PROGRAM STATS
  // =========================================

  const totalModules =
    program.modules?.length || 0;

  const totalLessons =
    program.modules.reduce(
      (acc, module) =>
        acc + module.lessons.length,
      0,
    ) || 0;

  const totalDuration =
    program.modules.reduce(
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

  return (
    <div className="bg-white dark:bg-black">
      <FitnessWellnessView
        program={program}
        totalModules={totalModules}
        totalLessons={totalLessons}
        totalDuration={totalDuration}
      />

      <NewsletterSection />
    </div>
  );
}