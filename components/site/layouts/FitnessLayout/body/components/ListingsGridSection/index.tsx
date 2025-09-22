"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  HeartIcon,
  ClockIcon,
  ArrowRightIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { ICourse } from "@/types/typings";
// import { useStoreContext } from "@/context/StoreContext";

// Optimized image loader
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

// Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Course type
interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  credits: number;
  code: string;
  rating: number | null;
  price: number;
  duration: string;
  status: string;
  companyId: string;
  companyName?: string | null; // <-- Added for display
  departmentId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Dummy fallback data
const dummyCourses: ICourse[] = [
  {
    id: "1",
    title: "Beginner Yoga & Mindfulness",
    description: "A gentle introduction to yoga postures, breathing techniques, and meditation to reduce stress.",
    imageUrl: "https://placehold.co/600x400/7c3aed/faf5ff?text=Yoga+Class",
    credits: 0,
    code: "YOGA-101",
    rating: 4.8,
    price: 50,
    duration: "60 Minutes",
    status: "ACTIVE",
    companyId: "683581bba1bdf6ca3624b541",
    departmentId: null,
    createdAt: null,
    updatedAt: null
  },
  {
    id: "2",
    title: "High-Intensity Interval Training",
    description: "Maximize your calorie burn and improve cardiovascular health with this dynamic, full-body workout.",
    imageUrl: "https://placehold.co/600x400/22c55e/f0fdf4?text=HIIT+Class",
    credits: 0,
    code: "HIIT-201",
    rating: 4.9,
    price: 75,
    duration: "45 Minutes",
    status: "ACTIVE",
    companyId: "683581bba1bdf6ca3624b541",
    departmentId: null,
    createdAt: null,
    updatedAt: null
  },
];

export default function ListingsGrid({
  courses = dummyCourses,
}: {
  courses?: ICourse[];
}) {
  const { storeFormData } = useStoreContext();

  const { primaryColor = "#4F46E5", secondaryColor = "#9333EA" } =
    storeFormData?.themeSettings || {};

  return (
    <section id="programs" className="py-16 px-4 md:px-8 bg-gray-50 relative">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.h2
          className="mb-12 text-4xl md:text-5xl font-extrabold text-center leading-tight"
          style={{ color: primaryColor }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Explore Our{" "}
          <span style={{ color: secondaryColor }}>Curated Programs</span> ✨
        </motion.h2>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {courses.map((course) => (
            <motion.div
              key={course.id}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              {/* Image */}
              <div className="relative h-56 w-full">
                <Image
                  loader={loader}
                  src={
                    course.imageUrl ||
                    "https://placehold.co/600x400/e5e7eb/4b5563?text=No+Image"
                  }
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />

                {/* Price Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <motion.span
                    className="px-4 py-1.5 text-sm font-bold rounded-full text-white shadow-lg"
                    style={{ background: primaryColor }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    ${course.price?.toLocaleString()}
                  </motion.span>
                </div>

                {/* Favorite button */}
                <motion.button
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:text-white transition-all duration-200 shadow"
                  style={{ color: primaryColor }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Add to favorites"
                >
                  <HeartIcon className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col gap-3">
                <h3
                  className="text-xl font-bold group-hover:underline"
                  style={{ color: primaryColor }}
                >
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {course.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center text-gray-500 text-sm gap-4 flex-wrap">
                  {course.duration && (
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      {course.duration}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <UserCircleIcon className="h-4 w-4 text-gray-400" />
                    {"Unknown Provider"}
                    {/* course.companyName ||  */}
                  </span>
                </div>

                {/* Rating */}
                {course.rating && (
                  <div className="flex items-center text-sm font-semibold text-yellow-500">
                    ⭐ {course.rating.toFixed(1)}
                  </div>
                )}

                {/* CTA */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <motion.button
                    className="w-full px-6 py-3 rounded-xl text-white font-semibold shadow-md hover:opacity-90 transition flex items-center justify-center gap-2"
                    style={{ background: primaryColor }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Book Now</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <a
            href="/all-programs"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:opacity-90 transition gap-3"
            style={{ background: secondaryColor, color: "#fff" }}
          >
            View All Programs
            <ArrowRightIcon className="h-5 w-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
