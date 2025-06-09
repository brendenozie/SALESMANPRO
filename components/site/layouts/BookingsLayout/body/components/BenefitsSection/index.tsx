"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckBadgeIcon,
  LockClosedIcon,
  SparklesIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";

// Local loader for next/image
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const benefits = [
  {
    title: "Effortless Booking",
    Icon: CheckBadgeIcon,
  },
  {
    title: "Secure Payments",
    Icon: LockClosedIcon,
  },
  {
    title: "Personalized Experience",
    Icon: SparklesIcon,
  },
  {
    title: "Flexible Scheduling",
    Icon: CalendarDaysIcon,
  },
];

export default function BenefitsSection() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-rose-50 via-white to-rose-100 overflow-hidden">
      {/* Background image softly faded */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/relaxed-woman.jpg"
          loader={loader}
          alt="Relaxed client"
          fill
          className="object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="rounded-3xl overflow-hidden bg-white/70 backdrop-blur-md shadow-xl flex flex-col lg:flex-row items-center">
          {/* Left Content */}
          <div className="w-full lg:w-1/2 p-10 lg:p-14 space-y-6">
            <motion.span
              className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              Customer Benefits
            </motion.span>

            <motion.h2
              className="text-3xl sm:text-4xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Your Perfect Massage Experience, Just a Click Away
            </motion.h2>

            <motion.p
              className="text-gray-700 max-w-xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Book, manage, and enjoy your sessions with ease—secure,
              personalized, and hassle-free.
            </motion.p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {benefits.map(({ title, Icon }, i) => (
                <motion.li
                  key={title}
                  className="flex items-center space-x-3 bg-rose-100 hover:bg-rose-200 transition px-4 py-2 rounded-full shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                >
                  <Icon className="w-5 h-5 text-rose-600" />
                  <span className="text-sm font-medium text-gray-800">{title}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Right Image */}
          <div className="w-full lg:w-1/2 h-96 relative">
            <Image
              src="/images/relaxed-woman.jpg"
              loader={loader}
              alt="Relaxed client"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
