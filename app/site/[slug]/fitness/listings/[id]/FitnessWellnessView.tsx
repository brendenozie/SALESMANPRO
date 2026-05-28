// app/[slug]/products/[productId]/FitnessWellnessView.tsx
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  PlayIcon,
  ClockIcon,
  FireIcon,
  BoltIcon,
  ChevronDownIcon,
  BookOpenIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import CourseCheckoutView from "./CourseCheckoutView";
import NewsletterSection from "@/components/site/NewsletterSection/NewsletterSection";

const loader = ({ src }: { src: string }) => src;

interface FitnessWellnessViewProps {
  program: any;
  totalModules: number;
  totalLessons: number;
  totalDuration: number;
  student: any;
  slug: string;
}

export default function FitnessWellnessView({
  program,
  totalModules,
  totalLessons,
  totalDuration,
  // student,
  slug,
}: FitnessWellnessViewProps) {
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [checkedOut, setCheckedOut] = useState(false);

  const instructor =
    program?.CourseEducatorAssignment?.[0]?.educator?.user?.name || "Elite Coach";

  const heroImage =
    program?.imageUrl ||
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200";

  const metrics = useMemo(
    () => [
      {
        label: "Modules",
        value: totalModules,
        icon: <BookOpenIcon className="w-5 h-5" />,
      },
      {
        label: "Lessons",
        value: totalLessons,
        icon: <PlayIcon className="w-5 h-5" />,
      },
      {
        label: "Duration",
        value: `${Math.floor(totalDuration / 60)} hrs`,
        icon: <ClockIcon className="w-5 h-5" />,
      },
      {
        label: "Intensity",
        value: "Elite",
        icon: <BoltIcon className="w-5 h-5" />,
      },
    ],
    [totalModules, totalLessons, totalDuration],
  );

  // Guard clause to swap views efficiently without unneeded landing DOM overhead
  if (checkedOut) {
    return (
      <CourseCheckoutView
        course={program}
        companyId={program?.companyId}
        slug={slug}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white">
      {/* HERO */}
      <section className="relative min-h-screen grid lg:grid-cols-2">
        {/* LEFT */}
        <div className="relative h-[50vh] lg:h-screen">
          <Image
            src={heroImage}
            alt={program?.title}
            fill
            loader={loader}
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/10" />
          <div className="absolute bottom-10 left-10 z-10">
            <div className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white text-xs font-black uppercase tracking-[0.3em] inline-flex items-center gap-3">
              <FireIcon className="w-4 h-4 text-orange-400" />
              Peak Performance Course
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col justify-center px-8 lg:px-20 py-20">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="uppercase text-xs tracking-[0.4em] text-zinc-400 font-black mb-6">
              Fitness Academy
            </p>

            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[0.9] uppercase italic mb-8">
              {program?.title}
            </h1>

            <p className="text-zinc-500 text-lg leading-relaxed max-w-2xl mb-10">
              {program?.description ||
                "Elite fitness transformation system built for high-performance results."}
            </p>

            {/* STATS */}
            <div className="flex flex-wrap gap-4 mb-12">
              <div className="px-5 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                <p className="text-xs text-zinc-500 uppercase font-black tracking-widest">
                  Instructor
                </p>
                <p className="font-bold mt-1">{instructor}</p>
              </div>

              <div className="px-5 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                <p className="text-xs text-zinc-500 uppercase font-black tracking-widest">
                  Modules
                </p>
                <p className="font-bold mt-1">{totalModules}</p>
              </div>

              <div className="px-5 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                <p className="text-xs text-zinc-500 uppercase font-black tracking-widest">
                  Lessons
                </p>
                <p className="font-bold mt-1">{totalLessons}</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-5 items-center">
              <button
                onClick={() => setCheckedOut(true)}
                className="h-16 px-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all"
              >
                Start Training
              </button>

              <button className="flex items-center gap-3 uppercase tracking-[0.2em] text-xs font-black text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                <PlayIcon className="w-6 h-6" />
                Watch Preview
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* METRICS */}
      <section className="border-y border-zinc-100 dark:border-zinc-900 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800"
            >
              <div className="flex items-center gap-3 mb-4 text-orange-500">
                {metric.icon}
              </div>
              <h3 className="text-4xl font-black mb-2">{metric.value}</h3>
              <p className="uppercase text-xs tracking-[0.3em] text-zinc-500 font-black">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MODULES / CURRICULUM */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <div className="mb-16">
          <h2 className="text-5xl font-black tracking-tight mb-6">Course Curriculum</h2>
          <p className="text-zinc-500 text-lg max-w-3xl">
            Structured performance-focused training designed to progressively transform endurance,
            strength, mobility, and recovery.
          </p>
        </div>

        <div className="space-y-6">
          {program?.modules?.map((module: any) => (
            <div
              key={module.id}
              className="border border-zinc-100 dark:border-zinc-800 rounded-[2rem] overflow-hidden"
            >
              <button
                onClick={() => setOpenModule(openModule === module.id ? null : module.id)}
                className="w-full p-8 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/40"
              >
                <div className="text-left">
                  <p className="uppercase text-xs tracking-[0.3em] text-orange-500 font-black mb-3">
                    Module {module.order}
                  </p>
                  <h4 className="text-2xl font-black">{module.title}</h4>
                  <p className="text-zinc-500 mt-3">{module.description}</p>
                </div>
                <ChevronDownIcon
                  className={`w-6 h-6 transition-transform ${
                    openModule === module.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openModule === module.id && (
                <div className="p-8 space-y-4">
                  {module.lessons?.map((lesson: any) => (
                    <div
                      key={lesson.id}
                      className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800"
                    >
                      <div className="flex justify-between items-start gap-5">
                        <div>
                          <h5 className="font-black text-lg mb-2">{lesson.title}</h5>
                          <p className="text-zinc-500 text-sm">
                            {lesson.description}
                          </p>
                        </div>
                        <div className="px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-500 text-xs uppercase tracking-widest font-black">
                          {lesson.duration || 0} min
                        </div>
                      </div>

                      {/* MATERIALS */}
                      {lesson.materials?.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-3">
                          {lesson.materials.map((material: any) => (
                            <a
                              key={material.id}
                              href={material.fileUrl || material.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                              {material.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ENROLLMENT ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-32">
        <div className="p-10 rounded-[3rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="uppercase text-xs tracking-[0.3em] text-zinc-500 font-black mb-4">
                Enrollment
              </p>
              <h3 className="text-5xl font-black mb-4">
                KSh {(program?.price || 0).toLocaleString()}
              </h3>
              <p className="text-zinc-500 text-lg">
                Lifetime access to all lessons, downloadable materials, future updates, and premium
                fitness guidance.
              </p>
            </div>

            <div>
              <button
                onClick={() => setCheckedOut(true)}
                className="w-full h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black uppercase text-xs tracking-[0.3em] font-black hover:scale-[1.02] transition-all"
              >
                Enroll In Course
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <NewsletterSection />
    </div>
  );
}