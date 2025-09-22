"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  StarIcon, // For rating/expertise (optional, not in Prisma but useful if you add later)
  AcademicCapIcon, // For certifications
  ChatBubbleLeftRightIcon, // For direct contact
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import { Educator } from "@/types/typings";

// Loader function (kept)
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 60, rotateX: -10 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
      damping: 12,
      stiffness: 100,
    },
  },
};

type Props = {
  educators?: Educator[];
};

// Component
export default function EducatorsSection({ educators = [] }: Props) {
  return (
    <section id="trainers" className="py-20 bg-gradient-to-br from-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Background abstract shapes */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-primary-light opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary-accent opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.h2
          className="mb-16 text-4xl md:text-5xl font-extrabold text-center text-gray-900 leading-tight"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          Meet Our{" "}
          <span className="text-primary-dark">World-Class Trainers</span> 🎓
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {educators.map((edu) => (
            <motion.div
              key={edu.id}
              className="bg-white rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden flex flex-col items-center text-center p-8 transition-all duration-300 transform border border-gray-100 group relative"
              whileHover={{ y: -7 }}
              variants={itemVariants}
            >
              {/* Profile Image */}
              <div className="relative w-32 h-32 mb-6 md:mb-8 transform group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={
                    edu.photoUrl ??
                    edu.profilePicture ??
                    "/images/placeholder-avatar.png"
                  }
                  alt={edu.user?.name ?? "Educator"}
                  fill
                  className="rounded-full object-cover object-center ring-4 ring-primary-light ring-offset-4 ring-offset-white"
                  loader={loader}
                  sizes="128px"
                />
              </div>

              {/* Educator Details */}
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight">
                {edu.user?.name ?? "Unnamed Educator"}
              </h3>
              <p className="text-base font-semibold text-primary-dark mb-2">
                {edu.specialty ?? "Expert"}
              </p>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {edu.bio ?? "No bio available."}
              </p>

              {/* Certifications */}
              {edu.certifications && edu.certifications.length > 0 && (
                <div className="flex items-center justify-center gap-2 mb-4 text-primary-light text-sm">
                  <AcademicCapIcon className="h-5 w-5" />
                  <span>{edu.certifications.length} Certifications</span>
                </div>
              )}

              {/* Call to Action */}
              <motion.button
                className="mt-auto px-8 py-3 bg-primary-dark text-white rounded-full font-semibold hover:bg-primary-hover transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 w-full"
                whileTap={{ scale: 0.95 }}
                aria-label={`Schedule a consultation with ${edu.user?.name}`}
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>Schedule a Call</span>
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA for becoming an educator */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <a
            href="/join-our-team"
            className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
          >
            Want to Become an Educator? Explore Opportunities
            <ArrowRightIcon className="h-5 w-5 ml-3" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
