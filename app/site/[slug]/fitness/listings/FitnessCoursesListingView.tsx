// app/[slug]/fitness/FitnessCoursesListingView.tsx

"use client";

import React, {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import Image from "next/image";

import { motion } from "framer-motion";

import {
  MagnifyingGlassIcon,
  FireIcon,
  ClockIcon,
  BoltIcon,
  BookOpenIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";

const loader = ({
  src,
}: {
  src: string;
}) => src;

export default function FitnessCoursesListingView({
  company,
  courses,
}: any) {
  const [search, setSearch] =
    useState("");

  const filteredCourses = useMemo(() => {
    return courses.filter((course: any) =>
      course.title
        ?.toLowerCase()
        ?.includes(search.toLowerCase()),
    );
  }, [courses, search]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white overflow-hidden">
      {/* HERO */}

      <section className="relative overflow-hidden">
        {/* Background Glow */}

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10rem] left-[-10rem] w-[30rem] h-[30rem] bg-orange-500/20 rounded-full blur-3xl" />

          <div className="absolute bottom-[-10rem] right-[-10rem] w-[30rem] h-[30rem] bg-red-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-24">
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-500 text-xs uppercase tracking-[0.3em] font-black mb-8">
              <FireIcon className="w-4 h-4" />
              Elite Performance Academy
            </div>

            <h1 className="text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] uppercase italic mb-8">
              Transform
              <br />
              Your Body.
            </h1>

            <p className="text-xl text-zinc-500 leading-relaxed max-w-2xl">
              Explore premium fitness programs,
              transformation systems, strength
              protocols, endurance training,
              wellness recovery, and elite
              performance courses built for the
              next version of you.
            </p>
          </motion.div>

          {/* SEARCH */}

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="mt-16"
          >
            <div className="relative max-w-2xl">
              <MagnifyingGlassIcon className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" />

              <input
                type="text"
                placeholder="Search fitness programs..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full h-20 rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-16 pr-6 text-lg outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}

      <section className="border-y border-zinc-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Programs",
              value: courses.length,
              icon: (
                <BookOpenIcon className="w-5 h-5" />
              ),
            },

            {
              label: "Transformation Paths",
              value: "12+",
              icon: (
                <BoltIcon className="w-5 h-5" />
              ),
            },

            {
              label: "Workout Hours",
              value: "250+",
              icon: (
                <ClockIcon className="w-5 h-5" />
              ),
            },

            {
              label: "Intensity",
              value: "Elite",
              icon: (
                <FireIcon className="w-5 h-5" />
              ),
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800"
            >
              <div className="text-orange-500 mb-4">
                {item.icon}
              </div>

              <h3 className="text-4xl font-black mb-2">
                {item.value}
              </h3>

              <p className="uppercase text-xs tracking-[0.3em] text-zinc-500 font-black">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* COURSES */}

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-16">
          <div>
            <p className="uppercase text-xs tracking-[0.4em] text-orange-500 font-black mb-4">
              Fitness Programs
            </p>

            <h2 className="text-5xl lg:text-6xl font-black tracking-tight">
              Discover Your
              <br />
              Next Evolution
            </h2>
          </div>

          <button className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:scale-105 transition-all text-sm uppercase tracking-widest font-black">
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* GRID */}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredCourses.map(
            (course: any, idx: number) => {
              const heroImage =
                course.imageUrl ||
                "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200";

              return (
                <motion.div
                  key={course.id}
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: idx * 0.05,
                  }}
                >
                  <Link
                    href={`/fitness/listings/${course.id}`}
                    className="group block"
                  >
                    <div className="relative rounded-[2.5rem] overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                      {/* IMAGE */}

                      <div className="relative h-[28rem] overflow-hidden">
                        <Image
                          src={heroImage}
                          alt={course.title}
                          fill
                          loader={loader}
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                        {/* PLAY */}

                        <div className="absolute top-6 right-6">
                          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                            <PlayIcon className="w-6 h-6 text-white" />
                          </div>
                        </div>

                        {/* BADGE */}

                        <div className="absolute top-6 left-6">
                          <div className="px-4 py-2 rounded-full bg-orange-500 text-white text-[10px] uppercase tracking-[0.3em] font-black">
                            Elite Program
                          </div>
                        </div>

                        {/* CONTENT */}

                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center font-black">
                              {course.instructor
                                ?.charAt(0)
                                ?.toUpperCase()}
                            </div>

                            <div>
                              <p className="text-xs uppercase tracking-[0.3em] text-zinc-300 font-black">
                                Instructor
                              </p>

                              <p className="font-bold">
                                {
                                  course.instructor
                                }
                              </p>
                            </div>
                          </div>

                          <h3 className="text-3xl font-black leading-tight mb-4">
                            {course.title}
                          </h3>

                          <p className="text-zinc-300 line-clamp-2 text-sm leading-relaxed">
                            {
                              course.description
                            }
                          </p>
                        </div>
                      </div>

                      {/* FOOTER */}

                      <div className="p-8">
                        <div className="grid grid-cols-3 gap-4 mb-8">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-black mb-2">
                              Modules
                            </p>

                            <h4 className="text-2xl font-black">
                              {
                                course.totalModules
                              }
                            </h4>
                          </div>

                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-black mb-2">
                              Lessons
                            </p>

                            <h4 className="text-2xl font-black">
                              {
                                course.totalLessons
                              }
                            </h4>
                          </div>

                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-black mb-2">
                              Hours
                            </p>

                            <h4 className="text-2xl font-black">
                              {Math.floor(
                                course.totalDuration /
                                  60,
                              )}
                            </h4>
                          </div>
                        </div>

                        {/* CTA */}

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-black mb-1">
                              Enrollment
                            </p>

                            <h4 className="text-3xl font-black">
                              KSh{" "}
                              {(
                                course.price ||
                                0
                              ).toLocaleString()}
                            </h4>
                          </div>

                          <div className="h-14 px-6 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center uppercase tracking-[0.2em] text-xs font-black group-hover:scale-105 transition-all">
                            Start
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            },
          )}
        </div>

        {/* EMPTY */}

        {filteredCourses.length === 0 && (
          <div className="py-32 text-center">
            <h3 className="text-4xl font-black mb-4">
              No Programs Found
            </h3>

            <p className="text-zinc-500 text-lg">
              Try adjusting your search query.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}