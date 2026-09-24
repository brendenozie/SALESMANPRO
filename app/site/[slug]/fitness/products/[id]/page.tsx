import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/server/db/prismadb";
import FitnessWellnessView from "./FitnessWellnessView";
import NewsletterSection from "@/components/site/NewsletterSection/NewsletterSection";
import { fetchWithCache, buildTenantCacheKey } from "@/lib/cache";
import type { Metadata } from "next";

export const revalidate = 120;

interface PageParams {
  slug: string;
  id: string;
}

interface PageProps {
  params: Promise<PageParams> | PageParams;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = params instanceof Promise ? await params : params;
  const { id } = resolved || {};
  if (!id) return { title: "Program" };

  const program = await fetchWithCache(
    `fitness_meta:${id}`,
    () => prisma.course.findUnique({
      where: { id },
      select: { title: true, description: true },
    }),
    300
  );

  return {
    title: program?.title ? `${program.title} | Program` : "Fitness Program",
    description: program?.description || undefined,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const resolved = params instanceof Promise ? await params : params;
  const { id, slug } = resolved || {};

  if (!id) {
    notFound();
  }

  // =========================================
  // FETCH FITNESS PROGRAM / COURSE CACHED
  // =========================================
  const program = await fetchWithCache(
    `fitness_program:${id}`,
    () => prisma.course.findUnique({
      where: { id },
      include: {
        company: true,
        CourseEducatorAssignment: {
          include: {
            educator: {
              include: { user: true },
            },
          },
        },
        modules: {
          include: {
            lessons: {
              include: { materials: true },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    }),
    300
  );

  if (!program) {
    notFound();
  }

  const totalModules = program.modules?.length || 0;
  const totalLessons =
    program.modules?.reduce((acc: number, module: any) => acc + (module.lessons?.length || 0), 0) || 0;
  const totalDuration =
    program.modules?.reduce(
      (acc: number, module: any) =>
        acc + (module.lessons?.reduce((lAcc: number, l: any) => lAcc + (l.duration || 0), 0) || 0),
      0
    ) || 0;

  return (
    <div className="bg-white dark:bg-black">
      <FitnessWellnessView
        program={program}
        totalModules={totalModules}
        totalLessons={totalLessons}
        totalDuration={totalDuration}
        slug={slug || "fitness"}
      />
      <NewsletterSection />
    </div>
  );
}